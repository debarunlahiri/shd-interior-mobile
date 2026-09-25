import { getDatabase, notifySyncOutboxChanged } from "../database";

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_BASE_URL = rawApiBaseUrl?.replace(/\/$/, "") ?? "";
export const isApiConfigured = API_BASE_URL.length > 0;

type OutboxRow = {
  id: string;
  entityType: string;
  entityId: string;
  operation: string;
  payload: string;
  actorRole: string;
  attempts: number;
  createdAt: string;
};

type RemoteChange = {
  entityType: "app_state" | "purchase_order" | "delivery";
  entityId: string;
  operation: "upsert" | "delete" | "status_change";
  payload: Record<string, unknown>;
  updatedAt: string;
};

type SyncResponse = {
  acknowledgedIds?: string[];
  serverCursor?: string;
  changes?: RemoteChange[];
};

export type SyncRunResult = {
  status: "unconfigured" | "idle" | "synced" | "error";
  pendingCount: number;
  appliedChanges: number;
  error?: string;
};

export async function getPendingSyncCount() {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM sync_outbox WHERE status != 'acknowledged'",
  );
  return row?.count ?? 0;
}

export async function getLastSyncAt() {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ lastSyncAt: string | null }>(
    "SELECT last_sync_at AS lastSyncAt FROM sync_state WHERE id = 1",
  );
  return row?.lastSyncAt ?? null;
}

async function applyRemoteChange(change: RemoteChange) {
  const database = await getDatabase();
  const payload = change.payload;

  if (change.entityType === "app_state") {
    if (change.operation === "delete") {
      await database.runAsync(
        "DELETE FROM app_state WHERE storage_key = ? AND updated_at <= ?",
        change.entityId,
        change.updatedAt,
      );
      return;
    }
    const value = payload.value;
    if (typeof value !== "string") return;
    await database.runAsync(
      `INSERT INTO app_state (storage_key, json_value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(storage_key) DO UPDATE SET
         json_value = excluded.json_value,
         updated_at = excluded.updated_at
       WHERE app_state.updated_at <= excluded.updated_at`,
      change.entityId,
      value,
      change.updatedAt,
    );
    return;
  }

  if (change.operation === "delete") return;
  if (change.entityType === "purchase_order") {
    const status = payload.status;
    if (typeof status === "string") {
      await database.runAsync(
        `UPDATE purchase_orders SET status = ?, updated_at = ?
         WHERE id = ? AND updated_at <= ?`,
        status,
        change.updatedAt,
        change.entityId,
        change.updatedAt,
      );
    }
    return;
  }

  const status = payload.status;
  if (typeof status === "string") {
    await database.runAsync(
      `UPDATE deliveries
       SET status = ?, challan_reference = COALESCE(?, challan_reference),
           updated_at = ?
       WHERE id = ? AND updated_at <= ?`,
      status,
      typeof payload.challanReference === "string"
        ? payload.challanReference
        : null,
      change.updatedAt,
      change.entityId,
      change.updatedAt,
    );
  }
}

function retryDelayMilliseconds(attempts: number) {
  return Math.min(15 * 60_000, 5_000 * 2 ** Math.min(attempts, 8));
}

export async function processSyncQueue(): Promise<SyncRunResult> {
  const pendingCount = await getPendingSyncCount();
  if (!isApiConfigured) {
    return { status: "unconfigured", pendingCount, appliedChanges: 0 };
  }
  if (pendingCount === 0) {
    return { status: "idle", pendingCount: 0, appliedChanges: 0 };
  }

  const database = await getDatabase();
  const now = new Date().toISOString();
  const rows = await database.getAllAsync<OutboxRow>(
    `SELECT id, entity_type AS entityType, entity_id AS entityId,
      operation, payload, actor_role AS actorRole, attempts,
      created_at AS createdAt
     FROM sync_outbox
     WHERE status IN ('pending', 'failed')
       AND (next_retry_at IS NULL OR next_retry_at <= ?)
     ORDER BY created_at ASC
     LIMIT 25`,
    now,
  );
  if (rows.length === 0) {
    return { status: "idle", pendingCount, appliedChanges: 0 };
  }

  const rowIds = rows.map((row) => row.id);
  const placeholders = rowIds.map(() => "?").join(",");
  await database.runAsync(
    `UPDATE sync_outbox SET status = 'syncing', updated_at = ?
     WHERE id IN (${placeholders})`,
    now,
    ...rowIds,
  );
  notifySyncOutboxChanged();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const cursorRow = await database.getFirstAsync<{
      serverCursor: string | null;
    }>("SELECT server_cursor AS serverCursor FROM sync_state WHERE id = 1");
    const response = await fetch(`${API_BASE_URL}/mobile/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": rowIds.join("."),
      },
      body: JSON.stringify({
        client: "shd-interior-mobile",
        cursor: cursorRow?.serverCursor ?? null,
        mutations: rows.map((row) => ({
          id: row.id,
          entityType: row.entityType,
          entityId: row.entityId,
          operation: row.operation,
          payload: JSON.parse(row.payload) as Record<string, unknown>,
          actorRole: row.actorRole,
          createdAt: row.createdAt,
        })),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Sync API returned ${response.status}`);
    }

    const result = (await response.json()) as SyncResponse;
    const acknowledged = new Set(result.acknowledgedIds ?? []);
    const acknowledgedIds = rowIds.filter((id) => acknowledged.has(id));
    const unacknowledgedIds = rowIds.filter((id) => !acknowledged.has(id));
    for (const change of result.changes ?? []) {
      await applyRemoteChange(change);
    }
    const completedAt = new Date().toISOString();
    await database.withTransactionAsync(async () => {
      if (acknowledgedIds.length > 0) {
        await database.runAsync(
          `DELETE FROM sync_outbox WHERE id IN (${acknowledgedIds
            .map(() => "?")
            .join(",")})`,
          ...acknowledgedIds,
        );
      }
      if (unacknowledgedIds.length > 0) {
        await database.runAsync(
          `UPDATE sync_outbox SET status = 'pending', updated_at = ?
           WHERE id IN (${unacknowledgedIds.map(() => "?").join(",")})`,
          completedAt,
          ...unacknowledgedIds,
        );
      }
      await database.runAsync(
        `INSERT INTO sync_state (id, server_cursor, last_sync_at, last_error)
         VALUES (1, ?, ?, NULL)
         ON CONFLICT(id) DO UPDATE SET
           server_cursor = COALESCE(excluded.server_cursor, server_cursor),
           last_sync_at = excluded.last_sync_at,
           last_error = NULL`,
        result.serverCursor ?? null,
        completedAt,
      );
    });
    const remaining = await getPendingSyncCount();
    notifySyncOutboxChanged();
    return {
      status: "synced",
      pendingCount: remaining,
      appliedChanges: result.changes?.length ?? 0,
    };
  } catch (caughtError) {
    const error =
      caughtError instanceof Error ? caughtError.message : "Sync failed";
    const failedAt = new Date();
    await database.withTransactionAsync(async () => {
      for (const row of rows) {
        const nextRetryAt = new Date(
          failedAt.getTime() + retryDelayMilliseconds(row.attempts + 1),
        ).toISOString();
        await database.runAsync(
          `UPDATE sync_outbox
           SET status = 'failed', attempts = attempts + 1,
               next_retry_at = ?, last_error = ?, updated_at = ?
           WHERE id = ?`,
          nextRetryAt,
          error,
          failedAt.toISOString(),
          row.id,
        );
      }
      await database.runAsync(
        `INSERT INTO sync_state (id, last_error) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET last_error = excluded.last_error`,
        error,
      );
    });
    notifySyncOutboxChanged();
    return {
      status: "error",
      pendingCount: await getPendingSyncCount(),
      appliedChanges: 0,
      error,
    };
  } finally {
    clearTimeout(timeout);
  }
}
