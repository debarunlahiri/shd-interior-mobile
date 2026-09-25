import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/app-settings-v1";

export type AppSettings = {
  notificationsEnabled: boolean;
  taskAlerts: boolean;
  materialAlerts: boolean;
  financeAlerts: boolean;
  reportReminders: boolean;
};

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  taskAlerts: true,
  materialAlerts: true,
  financeAlerts: true,
  reportReminders: true,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setSettings({
            ...defaultSettings,
            ...(JSON.parse(saved) as Partial<AppSettings>),
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(
      () => undefined,
    );
  }, [hydrated, settings]);

  const setSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  return { settings, setSetting, hydrated };
}
