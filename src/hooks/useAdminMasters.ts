import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/admin-masters-v1";

export type ManagedUserRole = "Supervisor" | "Admin" | "Other";

export type ManagedUser = {
  id: string;
  name: string;
  identifier: string;
  role: ManagedUserRole;
  createdAt: string;
};

export type ManagedVendor = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  createdAt: string;
};

export type ManagedMaterial = {
  id: string;
  name: string;
  unitId: string;
  createdAt: string;
};

export type ManagedUnit = {
  id: string;
  name: string;
  symbol: string;
  createdAt: string;
};

export type AdminMasters = {
  users: ManagedUser[];
  vendors: ManagedVendor[];
  materials: ManagedMaterial[];
  units: ManagedUnit[];
};

const initialMasters: AdminMasters = {
  users: [
    {
      id: "USR-1001",
      name: "Arjun Kumar",
      identifier: "arjun@shdinterior.com",
      role: "Supervisor",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
  ],
  vendors: [
    {
      id: "VND-1001",
      companyName: "BuildMart Supplies",
      contactName: "Rohit Mehta",
      phone: "+91 98765 43210",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
  ],
  materials: [
    {
      id: "MAT-1001",
      name: "Gypsum board",
      unitId: "UNT-1002",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
    {
      id: "MAT-1002",
      name: "White cement",
      unitId: "UNT-1001",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
  ],
  units: [
    {
      id: "UNT-1001",
      name: "Bag",
      symbol: "bags",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
    {
      id: "UNT-1002",
      name: "Sheet",
      symbol: "sheets",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
    {
      id: "UNT-1003",
      name: "Piece",
      symbol: "pcs",
      createdAt: "2026-09-20T08:30:00.000Z",
    },
  ],
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export function useAdminMasters() {
  const [masters, setMasters] = useState<AdminMasters>(initialMasters);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restore() {
      try {
        const saved = await databaseStorage.getItem(STORAGE_KEY);
        if (saved) setMasters(JSON.parse(saved) as AdminMasters);
      } catch {
        // Seed data remains available when local storage cannot be restored.
      } finally {
        setHydrated(true);
      }
    }

    restore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(masters))
      .catch(() => undefined);
  }, [hydrated, masters]);

  const addUser = useCallback(
    (input: Omit<ManagedUser, "id" | "createdAt">) => {
      setMasters((current) => ({
        ...current,
        users: [
          {
            ...input,
            id: createId("USR"),
            createdAt: new Date().toISOString(),
          },
          ...current.users,
        ],
      }));
    },
    [],
  );

  const addVendor = useCallback(
    (input: Omit<ManagedVendor, "id" | "createdAt">) => {
      setMasters((current) => ({
        ...current,
        vendors: [
          {
            ...input,
            id: createId("VND"),
            createdAt: new Date().toISOString(),
          },
          ...current.vendors,
        ],
      }));
    },
    [],
  );

  const addMaterial = useCallback(
    (input: Omit<ManagedMaterial, "id" | "createdAt">) => {
      setMasters((current) => ({
        ...current,
        materials: [
          {
            ...input,
            id: createId("MAT"),
            createdAt: new Date().toISOString(),
          },
          ...current.materials,
        ],
      }));
    },
    [],
  );

  const addUnit = useCallback(
    (input: Omit<ManagedUnit, "id" | "createdAt">) => {
      setMasters((current) => ({
        ...current,
        units: [
          {
            ...input,
            id: createId("UNT"),
            createdAt: new Date().toISOString(),
          },
          ...current.units,
        ],
      }));
    },
    [],
  );

  return { masters, addUser, addVendor, addMaterial, addUnit };
}
