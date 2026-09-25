import { useCallback, useEffect, useState } from "react";
import {
  enqueueSyncMutation,
  getDatabase,
  recordAuditEvent,
} from "../database";

export type PurchaseOrderStatus =
  | "Draft"
  | "Approved"
  | "Sent"
  | "Partially Received"
  | "Received"
  | "Closed"
  | "Cancelled";

export type DeliveryStatus = "Scheduled" | "In Transit" | "Delivered";

export type PurchaseOrder = {
  id: string;
  projectId: string;
  projectName: string;
  siteId: string | null;
  siteName: string | null;
  vendorId: string;
  vendorName: string;
  materialRequestId: string | null;
  amount: number;
  status: PurchaseOrderStatus;
  expectedDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Delivery = {
  id: string;
  purchaseOrderId: string;
  projectName: string;
  siteName: string;
  scheduledDate: string;
  status: DeliveryStatus;
  challanReference: string | null;
  receivedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useProcurement(vendorId?: string) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const database = await getDatabase();
    const vendorClause = vendorId ? " WHERE vendor_id = ?" : "";
    const orderRows = await database.getAllAsync<PurchaseOrder>(
      `SELECT
        id,
        project_id AS projectId,
        project_name AS projectName,
        site_id AS siteId,
        site_name AS siteName,
        vendor_id AS vendorId,
        vendor_name AS vendorName,
        material_request_id AS materialRequestId,
        amount,
        status,
        expected_date AS expectedDate,
        created_at AS createdAt,
        updated_at AS updatedAt
       FROM purchase_orders${vendorClause}
       ORDER BY updated_at DESC`,
      ...(vendorId ? [vendorId] : []),
    );
    const orderIds = orderRows.map((order) => order.id);
    const deliveryRows = orderIds.length
      ? await database.getAllAsync<Delivery>(
          `SELECT
            id,
            purchase_order_id AS purchaseOrderId,
            project_name AS projectName,
            site_name AS siteName,
            scheduled_date AS scheduledDate,
            status,
            challan_reference AS challanReference,
            received_by AS receivedBy,
            created_at AS createdAt,
            updated_at AS updatedAt
           FROM deliveries
           WHERE purchase_order_id IN (${orderIds.map(() => "?").join(",")})
           ORDER BY updated_at DESC`,
          ...orderIds,
        )
      : [];
    setPurchaseOrders(orderRows);
    setDeliveries(deliveryRows);
    setHydrated(true);
  }, [vendorId]);

  useEffect(() => {
    refresh().catch(() => setHydrated(true));
  }, [refresh]);

  const updatePurchaseOrderStatus = useCallback(
    async (
      id: string,
      status: PurchaseOrderStatus,
      actorRole: "Admin" | "Supervisor" | "Vendor",
    ) => {
      const database = await getDatabase();
      await database.runAsync(
        "UPDATE purchase_orders SET status = ?, updated_at = ? WHERE id = ?",
        status,
        new Date().toISOString(),
        id,
      );
      await recordAuditEvent(actorRole, "purchase_order", id, status);
      await enqueueSyncMutation({
        entityType: "purchase_order",
        entityId: id,
        operation: "status_change",
        payload: { status },
        actorRole,
      });
      await refresh();
    },
    [refresh],
  );

  const updateDeliveryStatus = useCallback(
    async (
      id: string,
      status: DeliveryStatus,
      actorRole: "Admin" | "Vendor",
      challanReference?: string,
    ) => {
      const database = await getDatabase();
      const updatedAt = new Date().toISOString();
      await database.runAsync(
        `UPDATE deliveries
         SET status = ?, challan_reference = COALESCE(?, challan_reference),
             updated_at = ?
         WHERE id = ?`,
        status,
        challanReference ?? null,
        updatedAt,
        id,
      );
      await recordAuditEvent(actorRole, "delivery", id, status, {
        challanReference,
      });
      await enqueueSyncMutation({
        entityType: "delivery",
        entityId: id,
        operation: "status_change",
        payload: { status, challanReference },
        actorRole,
      });
      await refresh();
    },
    [refresh],
  );

  const createPurchaseOrderFromRequest = useCallback(
    async (input: {
      requestId: string;
      projectName: string;
      siteName: string;
      materialName: string;
      quantity: number;
      unit: string;
      expectedDate: string;
      vendorId: string;
      vendorName: string;
    }) => {
      const database = await getDatabase();
      const existing = await database.getFirstAsync<{ id: string }>(
        "SELECT id FROM purchase_orders WHERE material_request_id = ?",
        input.requestId,
      );
      if (existing) return existing.id;
      const suffix = Date.now().toString().slice(-6);
      const orderId = `PO-${suffix}`;
      const deliveryId = `DEL-${suffix}`;
      const now = new Date().toISOString();
      await database.withTransactionAsync(async () => {
        await database.runAsync(
          `INSERT INTO purchase_orders
            (id, project_id, project_name, site_id, site_name, vendor_id,
             vendor_name, material_request_id, amount, status, expected_date,
             created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          orderId,
          input.projectName,
          input.projectName,
          input.siteName,
          input.siteName,
          input.vendorId,
          input.vendorName,
          input.requestId,
          0,
          "Draft",
          input.expectedDate,
          now,
          now,
        );
        await database.runAsync(
          `INSERT INTO purchase_order_items
            (id, purchase_order_id, material_name, quantity, unit, unit_price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          `POI-${suffix}`,
          orderId,
          input.materialName,
          input.quantity,
          input.unit,
          0,
        );
        await database.runAsync(
          `INSERT INTO deliveries
            (id, purchase_order_id, project_name, site_name, scheduled_date,
             status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          deliveryId,
          orderId,
          input.projectName,
          input.siteName,
          input.expectedDate,
          "Scheduled",
          now,
          now,
        );
      });
      await recordAuditEvent(
        "Admin",
        "purchase_order",
        orderId,
        "created_from_material_request",
        { requestId: input.requestId },
      );
      await enqueueSyncMutation({
        entityType: "purchase_order",
        entityId: orderId,
        operation: "upsert",
        payload: {
          ...input,
          id: orderId,
          deliveryId,
          status: "Draft",
        },
        actorRole: "Admin",
      });
      await refresh();
      return orderId;
    },
    [refresh],
  );

  return {
    purchaseOrders,
    deliveries,
    hydrated,
    refresh,
    updatePurchaseOrderStatus,
    updateDeliveryStatus,
    createPurchaseOrderFromRequest,
  };
}
