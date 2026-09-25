import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { DemoAccount, getDemoAccount } from "../config/auth";
import { UserRole } from "../types/roles";

const STORAGE_KEY = "shd-interior-auth-session-v4";
const LEGACY_STORAGE_KEY = "@shd-interior/auth-session-v3";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export type AuthSession = {
  userId: string;
  phoneNumber: string;
  role: UserRole;
  name: string;
  permissions: string[];
  assignedProjects: DemoAccount["assignedProjects"];
  signedInAt: string;
  expiresAt: string;
};

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AuthSession>;
  return Boolean(
    session.userId &&
    session.phoneNumber &&
    session.role &&
    session.name &&
    Array.isArray(session.permissions) &&
    Array.isArray(session.assignedProjects) &&
    session.signedInAt &&
    session.expiresAt &&
    Date.parse(session.expiresAt) > Date.now(),
  );
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const secureStorageAvailable = await SecureStore.isAvailableAsync();
        const saved = secureStorageAvailable
          ? await SecureStore.getItemAsync(STORAGE_KEY)
          : null;
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (isValidSession(parsed)) {
            setSession(parsed);
          } else if (secureStorageAvailable) {
            await SecureStore.deleteItemAsync(STORAGE_KEY);
          }
        }
        await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(
          () => undefined,
        );
      } catch {
        await SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => undefined);
      } finally {
        setHydrated(true);
      }
    }

    restoreSession();
  }, []);

  const signIn = useCallback(async (phoneNumber: string) => {
    const account = getDemoAccount(phoneNumber);
    if (!account) throw new Error("Unregistered phone number");
    const nextSession: AuthSession = {
      userId: account.id,
      phoneNumber: account.phoneNumber,
      role: account.role,
      name: account.name,
      permissions: account.permissions,
      assignedProjects: account.assignedProjects,
      signedInAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    };
    if (await SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(nextSession), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => undefined);
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (name: string) => {
      const normalizedName = name.trim();
      if (!normalizedName) throw new Error("Name is required");
      if (!session) throw new Error("No active session");
      const updated = { ...session, name: normalizedName };
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated), {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      }
      setSession(updated);
    },
    [session],
  );

  return { session, hydrated, signIn, signOut, updateProfile };
}
