import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { UserRole } from "../types/roles";

const STORAGE_KEY = "@shd-interior/user-role-v1";

export function useUserRole() {
  const [role, setRoleState] = useState<UserRole>("Supervisor");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "Supervisor" || saved === "Admin" || saved === "Vendor")
          setRoleState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    AsyncStorage.setItem(STORAGE_KEY, nextRole).catch(() => undefined);
  };

  return { role, setRole };
}
