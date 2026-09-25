import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "shd-interior-demo.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type AuditEvent = {
  id: number;
  actorRole: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: string;
  createdAt: string;
};

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS app_state (
      storage_key TEXT PRIMARY KEY NOT NULL,
      json_value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_role TEXT NOT NULL DEFAULT 'System',
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY NOT NULL,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      site_id TEXT,
      site_name TEXT,
      vendor_id TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      material_request_id TEXT,
      amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      expected_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY NOT NULL,
      purchase_order_id TEXT NOT NULL,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY NOT NULL,
      purchase_order_id TEXT NOT NULL,
      project_name TEXT NOT NULL,
      site_name TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      status TEXT NOT NULL,
      challan_reference TEXT,
      received_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      next_retry_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      server_cursor TEXT,
      last_sync_at TEXT,
      last_error TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_entity
      ON audit_events(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_po_vendor
      ON purchase_orders(vendor_id, status);
    CREATE INDEX IF NOT EXISTS idx_delivery_po
      ON deliveries(purchase_order_id, status);
    CREATE INDEX IF NOT EXISTS idx_outbox_status_retry
      ON sync_outbox(status, next_retry_at, created_at);
  `);

  await database.runAsync(
    `UPDATE sync_outbox
     SET status = 'pending', updated_at = ?
     WHERE status = 'syncing'`,
    new Date().toISOString(),
  );

  const seeded = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM purchase_orders",
  );
  if ((seeded?.count ?? 0) === 0) {
    const now = new Date().toISOString();
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO purchase_orders
          (id, project_id, project_name, site_id, site_name, vendor_id,
           vendor_name, material_request_id, amount, status, expected_date,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        "PO-2048",
        "PRJ-001",
        "Palm Grove Residence",
        "SITE-018",
        "Villa 18",
        "USR-VEN-001",
        "Approved Vendor",
        "MR-204",
        84600,
        "Sent",
        "2026-09-28",
        now,
        now,
      );
      await database.runAsync(
        `INSERT INTO purchase_order_items
          (id, purchase_order_id, material_name, quantity, unit, unit_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        "POI-2048-1",
        "PO-2048",
        "Gypsum board",
        120,
        "sheets",
        705,
      );
      await database.runAsync(
        `INSERT INTO deliveries
          (id, purchase_order_id, project_name, site_name, scheduled_date,
           status, challan_reference, received_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        "DEL-776",
        "PO-2048",
        "Palm Grove Residence",
        "Villa 18",
        "2026-09-28",
        "Scheduled",
        null,
        null,
        now,
        now,
      );
    });
  }
}

export async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(
      async (database) => {
        await initializeDatabase(database);
        return database;
      },
    );
  }
  return databasePromise;
}

export const databaseStorage = {
  async getItem(storageKey: string) {
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ json_value: string }>(
      "SELECT json_value FROM app_state WHERE storage_key = ?",
      storageKey,
    );
    if (row) return row.json_value;

    const legacyValue = await AsyncStorage.getItem(storageKey).catch(
      () => null,
    );
    if (legacyValue !== null) {
      await databaseStorage.setItem(storageKey, legacyValue, "Migration");
    }
    return legacyValue;
  },

  async setItem(storageKey: string, value: string, actorRole = "Local user") {
    const database = await getDatabase();
    const updatedAt = new Date().toISOString();
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO app_state (storage_key, json_value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(storage_key) DO UPDATE SET
           json_value = excluded.json_value,
           updated_at = excluded.updated_at`,
        storageKey,
        value,
        updatedAt,
      );
      await enqueueSyncMutationInTransaction(database, {
        entityType: "app_state",
        entityId: storageKey,
        operation: "upsert",
        payload: { value },
        actorRole,
        createdAt: updatedAt,
      });
      await database.runAsync(
        `INSERT INTO audit_events
          (actor_role, entity_type, entity_id, action, payload, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        actorRole,
        "app_state",
        storageKey,
        "updated",
        JSON.stringify({ storageKey }),
        updatedAt,
      );
    });
    notifyOutboxChanged();
  },

  async removeItem(storageKey: string, actorRole = "Local user") {
    const database = await getDatabase();
    await database.runAsync(
      "DELETE FROM app_state WHERE storage_key = ?",
      storageKey,
    );
    await enqueueSyncMutation({
      entityType: "app_state",
      entityId: storageKey,
      operation: "delete",
      payload: {},
      actorRole,
    });
    await recordAuditEvent(actorRole, "app_state", storageKey, "deleted");
  },
};

export async function recordAuditEvent(
  actorRole: string,
  entityType: string,
  entityId: string,
  action: string,
  payload: Record<string, unknown> = {},
) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO audit_events
      (actor_role, entity_type, entity_id, action, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    actorRole,
    entityType,
    entityId,
    action,
    JSON.stringify(payload),
    new Date().toISOString(),
  );
}

export type SyncMutationInput = {
  entityType: string;
  entityId: string;
  operation: "upsert" | "delete" | "status_change";
  payload: Record<string, unknown>;
  actorRole: string;
};

async function enqueueSyncMutationInTransaction(
  database: SQLite.SQLiteDatabase,
  input: SyncMutationInput & { createdAt: string },
) {
  const id = `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await database.runAsync(
    `INSERT INTO sync_outbox
      (id, entity_type, entity_id, operation, payload, actor_role, status,
       attempts, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
    id,
    input.entityType,
    input.entityId,
    input.operation,
    JSON.stringify(input.payload),
    input.actorRole,
    input.createdAt,
    input.createdAt,
  );
}

export async function enqueueSyncMutation(input: SyncMutationInput) {
  const database = await getDatabase();
  const createdAt = new Date().toISOString();
  await enqueueSyncMutationInTransaction(database, { ...input, createdAt });
  notifyOutboxChanged();
}

const outboxListeners = new Set<() => void>();

export function subscribeToOutbox(listener: () => void) {
  outboxListeners.add(listener);
  return () => {
    outboxListeners.delete(listener);
  };
}

function notifyOutboxChanged() {
  outboxListeners.forEach((listener) => listener());
}

export function notifySyncOutboxChanged() {
  notifyOutboxChanged();
}

export async function getRecentAuditEvents(limit = 100) {
  const database = await getDatabase();
  return database.getAllAsync<AuditEvent>(
    `SELECT
      id,
      actor_role AS actorRole,
      entity_type AS entityType,
      entity_id AS entityId,
      action,
      payload,
      created_at AS createdAt
     FROM audit_events
     ORDER BY id DESC
     LIMIT ?`,
    limit,
  );
}
