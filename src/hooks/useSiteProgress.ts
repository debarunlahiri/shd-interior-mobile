import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { initialSiteProgress, ProgressStage, SiteProgressEntry } from "../data";

const STORAGE_KEY = "@shd-interior/site-progress-v1";

export type SiteProgressInput = {
  stage: ProgressStage;
  progress: number;
  workDescription: string;
  remarks: string;
  mediaName: string;
};

export function useSiteProgress() {
  const [entries, setEntries] =
    useState<SiteProgressEntry[]>(initialSiteProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setEntries(JSON.parse(saved) as SiteProgressEntry[]);
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

  const addProgress = useCallback((input: SiteProgressInput) => {
    const entry: SiteProgressEntry = {
      ...input,
      id: `PRG-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEntries((current) => [entry, ...current]);
  }, []);

  return { entries, addProgress };
}
