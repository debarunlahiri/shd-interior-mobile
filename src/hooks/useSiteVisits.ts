import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/site-visits-v1";

export type SiteVisit = {
  id: string;
  visitor: string;
  date: string;
  inTime: string;
  outTime: string;
  purpose: string;
  remarks: string;
  imageNames: string[];
  createdAt: string;
};

export type SiteVisitInput = Omit<SiteVisit, "id" | "createdAt">;

export function useSiteVisits() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    databaseStorage
      .getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setVisits(JSON.parse(saved) as SiteVisit[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(visits))
      .catch(() => undefined);
  }, [hydrated, visits]);

  const addVisit = useCallback((input: SiteVisitInput) => {
    setVisits((current) => [
      {
        ...input,
        id: `VIS-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  return { visits, addVisit };
}
