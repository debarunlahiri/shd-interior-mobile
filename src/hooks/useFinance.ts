import { databaseStorage } from "../database";
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@shd-interior/site-finance-v1";

export type FinanceRecordKind =
  "Expense" | "Local Purchase" | "Cash Issued" | "Cash Returned";
export type FinanceRecordStatus =
  "Pending" | "Approved" | "Rejected" | "Recorded";

export type FinanceRecord = {
  id: string;
  kind: FinanceRecordKind;
  date: string;
  amount: number;
  status: FinanceRecordStatus;
  reference: string;
  purpose: string;
  paymentMethod?: string;
  category?: string;
  paidTo?: string;
  material?: string;
  quantity?: number;
  unit?: string;
  remarks?: string;
  receiptName?: string;
  createdAt: string;
};

export type FinanceRecordInput = Omit<
  FinanceRecord,
  "id" | "status" | "createdAt"
>;

const initialRecords: FinanceRecord[] = [
  {
    id: "CASH-ISSUE-1001",
    kind: "Cash Issued",
    date: "2026-09-20",
    amount: 50000,
    status: "Recorded",
    reference: "CI-1001",
    purpose: "Site operating cash",
    createdAt: "2026-09-20T08:00:00.000Z",
  },
];

export function useFinance() {
  const [records, setRecords] = useState<FinanceRecord[]>(initialRecords);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    databaseStorage
      .getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setRecords(JSON.parse(saved) as FinanceRecord[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(records))
      .catch(() => undefined);
  }, [hydrated, records]);

  const addRecord = useCallback((input: FinanceRecordInput) => {
    const createdAt = new Date().toISOString();
    const prefix =
      input.kind === "Expense"
        ? "EXP"
        : input.kind === "Local Purchase"
          ? "PUR"
          : input.kind === "Cash Returned"
            ? "RET"
            : "CASH";
    setRecords((current) => [
      {
        ...input,
        id: `${prefix}-${Date.now()}`,
        status:
          input.kind === "Expense" || input.kind === "Local Purchase"
            ? "Pending"
            : "Recorded",
        createdAt,
      },
      ...current,
    ]);
  }, []);

  const updateStatus = useCallback(
    (id: string, status: "Approved" | "Rejected") => {
      setRecords((current) =>
        current.map((record) =>
          record.id === id && record.status === "Pending"
            ? { ...record, status }
            : record,
        ),
      );
    },
    [],
  );

  const balance = useMemo(
    () =>
      records.reduce((total, record) => {
        if (record.kind === "Cash Issued") return total + record.amount;
        if (record.kind === "Cash Returned") return total - record.amount;
        if (record.status === "Approved") return total - record.amount;
        return total;
      }, 0),
    [records],
  );

  return { records, balance, addRecord, updateStatus };
}
