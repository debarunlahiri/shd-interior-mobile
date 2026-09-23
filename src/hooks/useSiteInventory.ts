import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ManagedMaterial, ManagedUnit } from "./useAdminMasters";

const STORAGE_KEY = "@shd-interior/site-inventory-v1";

export type InventoryTransactionType =
  | "Received"
  | "Used"
  | "Returned"
  | "Transferred"
  | "Damaged";

export type InventoryTransaction = {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  type: InventoryTransactionType;
  quantity: number;
  date: string;
  reference: string;
  activity: string;
  remarks: string;
  createdAt: string;
};

export type InventoryTransactionInput = Omit<
  InventoryTransaction,
  "id" | "createdAt"
>;

export type InventoryBalance = {
  materialId: string;
  materialName: string;
  unit: string;
  available: number;
  transactionCount: number;
};

const initialTransactions: InventoryTransaction[] = [
  {
    id: "INV-1001",
    materialId: "MAT-1001",
    materialName: "Gypsum board",
    unit: "sheets",
    type: "Received",
    quantity: 40,
    date: "2026-09-18",
    reference: "CH-180",
    activity: "Warehouse delivery",
    remarks: "Received in good condition.",
    createdAt: "2026-09-18T10:15:00.000Z",
  },
  {
    id: "INV-1002",
    materialId: "MAT-1001",
    materialName: "Gypsum board",
    unit: "sheets",
    type: "Used",
    quantity: 16,
    date: "2026-09-20",
    reference: "TSK-1048",
    activity: "Living room false ceiling",
    remarks: "Issued for framework boarding.",
    createdAt: "2026-09-20T12:30:00.000Z",
  },
  {
    id: "INV-1003",
    materialId: "MAT-1002",
    materialName: "White cement",
    unit: "bags",
    type: "Received",
    quantity: 12,
    date: "2026-09-19",
    reference: "CH-181",
    activity: "Warehouse delivery",
    remarks: "Stock received at Villa 18.",
    createdAt: "2026-09-19T09:20:00.000Z",
  },
  {
    id: "INV-1004",
    materialId: "MAT-1002",
    materialName: "White cement",
    unit: "bags",
    type: "Used",
    quantity: 4,
    date: "2026-09-20",
    reference: "TSK-1048",
    activity: "False-ceiling joint preparation",
    remarks: "Issued to the ceiling team.",
    createdAt: "2026-09-20T14:10:00.000Z",
  },
];

function movementValue(transaction: InventoryTransaction) {
  return transaction.type === "Received"
    ? transaction.quantity
    : -transaction.quantity;
}

export function useSiteInventory(
  materials: ManagedMaterial[],
  units: ManagedUnit[],
) {
  const [transactions, setTransactions] =
    useState<InventoryTransaction[]>(initialTransactions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setTransactions(JSON.parse(saved) as InventoryTransaction[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)).catch(
      () => undefined,
    );
  }, [hydrated, transactions]);

  const balances = useMemo<InventoryBalance[]>(() => {
    const materialMap = new Map<string, InventoryBalance>();

    materials.forEach((material) => {
      const unit = units.find((item) => item.id === material.unitId);
      materialMap.set(material.id, {
        materialId: material.id,
        materialName: material.name,
        unit: unit?.symbol ?? "unit",
        available: 0,
        transactionCount: 0,
      });
    });

    transactions.forEach((transaction) => {
      const current = materialMap.get(transaction.materialId) ?? {
        materialId: transaction.materialId,
        materialName: transaction.materialName,
        unit: transaction.unit,
        available: 0,
        transactionCount: 0,
      };
      materialMap.set(transaction.materialId, {
        ...current,
        available: current.available + movementValue(transaction),
        transactionCount: current.transactionCount + 1,
      });
    });

    return Array.from(materialMap.values()).sort((a, b) =>
      a.materialName.localeCompare(b.materialName),
    );
  }, [materials, transactions, units]);

  const addTransaction = useCallback((input: InventoryTransactionInput) => {
    const transaction: InventoryTransaction = {
      ...input,
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((current) => [transaction, ...current]);
  }, []);

  return { transactions, balances, addTransaction };
}
