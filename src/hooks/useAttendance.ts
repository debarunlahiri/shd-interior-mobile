import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/attendance-v1";

export type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave";

export type AttendanceEntry = {
  id: string;
  date: string;
  workerName: string;
  trade: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  overtimeHours: number;
  remarks?: string;
  recordedAt: string;
};

export type AttendanceEntryInput = Omit<AttendanceEntry, "id" | "recordedAt">;

export const attendanceRoster = [
  { workerName: "Ravi Kumar", trade: "Carpenter" },
  { workerName: "Imran Ali", trade: "Electrician" },
  { workerName: "Sunil Das", trade: "Painter" },
  { workerName: "Manoj Yadav", trade: "Helper" },
];

export function useAttendance() {
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setEntries(JSON.parse(saved) as AttendanceEntry[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(
      () => undefined,
    );
  }, [entries, hydrated]);

  const saveAttendance = useCallback((input: AttendanceEntryInput[]) => {
    const recordedAt = new Date().toISOString();
    setEntries((current) => {
      const replacementKeys = new Set(
        input.map((entry) => `${entry.date}:${entry.workerName}`),
      );
      const untouched = current.filter(
        (entry) => !replacementKeys.has(`${entry.date}:${entry.workerName}`),
      );
      const saved = input.map((entry) => ({
        ...entry,
        id: `ATT-${entry.date}-${entry.workerName.replace(/\s+/g, "-").toLowerCase()}`,
        recordedAt,
      }));
      return [...saved, ...untouched].sort(
        (left, right) =>
          right.date.localeCompare(left.date) ||
          left.workerName.localeCompare(right.workerName),
      );
    });
  }, []);

  return { entries, saveAttendance };
}
