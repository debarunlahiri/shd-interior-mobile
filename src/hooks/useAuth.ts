import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { getDemoAccount } from "../config/auth";
import { UserRole } from "../types/roles";

const STORAGE_KEY = "@shd-interior/auth-session-v3";

export type AuthSession = {
  phoneNumber: string;
  role: UserRole;
  signedInAt: string;
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as AuthSession;
          if (parsed.phoneNumber && parsed.role && parsed.signedInAt) {
            setSession(parsed);
          }
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
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
      phoneNumber: account.phoneNumber,
      role: account.role,
      signedInAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return { session, hydrated, signIn, signOut };
}
