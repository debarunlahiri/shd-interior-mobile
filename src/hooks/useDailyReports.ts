import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/daily-reports-v1";

export type DailyReport = {
  id: string;
  date: string;
  project: string;
  site: string;
  supervisor: string;
  workCompleted: string;
  completedTaskIds: string[];
  pendingTaskIds: string[];
  workforce: number;
  materialsUsed: string;
  materialsRequired: string;
  expenseSummary: string;
  issues: string;
  remarks: string;
  photoName?: string;
  videoName?: string;
  createdAt: string;
};

export type DailyReportInput = Omit<DailyReport, "id" | "createdAt">;

const initialReports: DailyReport[] = [
  {
    id: "DPR-1001",
    date: "2026-09-20",
    project: "Palm Grove Residence",
    site: "Villa 18",
    supervisor: "Arjun Kumar",
    workCompleted: "Electrical point marking completed on both floors.",
    completedTaskIds: ["TSK-1039"],
    pendingTaskIds: ["TSK-1048", "TSK-1051"],
    workforce: 18,
    materialsUsed: "Electrical wire · 45 m; conduit · 20 m",
    materialsRequired: "White cement · 20 bags",
    expenseSummary: "Worker transport · ₹1,200",
    issues: "Revised lighting plan awaiting final confirmation.",
    remarks: "Ceiling framework can continue after point verification.",
    photoName: "electrical-marking.jpg",
    createdAt: "2026-09-20T17:30:00.000Z",
  },
];

export function useDailyReports() {
  const [reports, setReports] = useState<DailyReport[]>(initialReports);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setReports(JSON.parse(saved) as DailyReport[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports)).catch(
      () => undefined,
    );
  }, [hydrated, reports]);

  const addReport = useCallback((input: DailyReportInput) => {
    const report: DailyReport = {
      ...input,
      id: `DPR-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReports((current) => [report, ...current]);
  }, []);

  return { reports, addReport };
}
