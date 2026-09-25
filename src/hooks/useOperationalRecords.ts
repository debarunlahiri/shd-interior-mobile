import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/operational-records-v1";

export type OperationalRecordKind = "expense" | "attendance" | "issue";

export type OperationalRecord = {
  id: string;
  kind: OperationalRecordKind;
  values: Record<string, string>;
  attachment?: string;
  status: string;
  createdAt: string;
};

export type OperationalRecordInput = Pick<
  OperationalRecord,
  "kind" | "values" | "attachment"
>;

const initialRecords: OperationalRecord[] = [
  {
    id: "EXP-1001",
    kind: "expense",
    values: {
      CATEGORY: "Transport",
      AMOUNT: "1200",
      "PAID TO": "Site transport vendor",
      DESCRIPTION: "Worker transport for the morning shift",
    },
    status: "Pending",
    createdAt: "2026-09-20T09:20:00.000Z",
  },
  {
    id: "ATT-1001",
    kind: "attendance",
    values: {
      "WORKER NAME": "Ravi Kumar",
      "TRADE / ROLE": "Carpenter",
      STATUS: "Present",
      REMARKS: "Morning shift",
    },
    status: "Recorded",
    createdAt: "2026-09-20T08:42:00.000Z",
  },
  {
    id: "ISS-1001",
    kind: "issue",
    values: {
      "ISSUE TYPE": "Technical",
      PRIORITY: "High",
      TITLE: "Lighting plan confirmation",
      DESCRIPTION: "Revised lighting points need engineering confirmation.",
    },
    status: "Open",
    createdAt: "2026-09-20T11:10:00.000Z",
  },
];

export function useOperationalRecords() {
  const [records, setRecords] = useState<OperationalRecord[]>(initialRecords);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    databaseStorage
      .getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setRecords(JSON.parse(saved) as OperationalRecord[]);
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

  const addRecord = useCallback((input: OperationalRecordInput) => {
    const prefix =
      input.kind === "expense"
        ? "EXP"
        : input.kind === "attendance"
          ? "ATT"
          : "ISS";
    const status =
      input.kind === "expense"
        ? "Pending"
        : input.kind === "attendance"
          ? "Recorded"
          : "Open";
    setRecords((current) => [
      {
        ...input,
        id: `${prefix}-${Date.now()}`,
        status,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  return { records, addRecord };
}
