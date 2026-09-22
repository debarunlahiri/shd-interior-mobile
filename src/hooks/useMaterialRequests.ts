import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/material-requests-v1";

export type MaterialRequestStatus =
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Partially Approved"
  | "Allocated"
  | "Purchased"
  | "Dispatched"
  | "Received";

export type MaterialRequestHistory = {
  id: string;
  status: MaterialRequestStatus;
  note: string;
  createdAt: string;
};

export type MaterialRequest = {
  id: string;
  project: string;
  site: string;
  material: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  purpose: string;
  remarks: string;
  status: MaterialRequestStatus;
  history: MaterialRequestHistory[];
  createdAt: string;
};

export type MaterialRequestInput = Pick<
  MaterialRequest,
  "material" | "quantity" | "unit" | "requiredDate" | "purpose" | "remarks"
>;

const initialRequests: MaterialRequest[] = [
  {
    id: "MR-204",
    project: "Palm Grove Residence",
    site: "Villa 18",
    material: "White cement",
    quantity: 20,
    unit: "Bags",
    requiredDate: "2026-09-24",
    purpose: "False-ceiling joint finishing",
    remarks: "Site stock is below the two-day requirement.",
    status: "Dispatched",
    createdAt: "2026-09-20T08:30:00.000Z",
    history: [
      {
        id: "MR-204-3",
        status: "Dispatched",
        note: "Dispatched from central warehouse under challan CH-184.",
        createdAt: "2026-09-21T11:15:00.000Z",
      },
      {
        id: "MR-204-2",
        status: "Allocated",
        note: "Twenty bags allocated from available warehouse stock.",
        createdAt: "2026-09-20T14:10:00.000Z",
      },
      {
        id: "MR-204-1",
        status: "Submitted",
        note: "Request submitted by Arjun Kumar.",
        createdAt: "2026-09-20T08:30:00.000Z",
      },
    ],
  },
  {
    id: "MR-198",
    project: "Palm Grove Residence",
    site: "Villa 18",
    material: "Wall primer",
    quantity: 60,
    unit: "Litres",
    requiredDate: "2026-09-19",
    purpose: "Bedroom wall preparation",
    remarks: "Required after moisture inspection approval.",
    status: "Partially Approved",
    createdAt: "2026-09-18T09:00:00.000Z",
    history: [
      {
        id: "MR-198-2",
        status: "Partially Approved",
        note: "Forty litres approved; remaining quantity awaits stock.",
        createdAt: "2026-09-18T15:20:00.000Z",
      },
      {
        id: "MR-198-1",
        status: "Submitted",
        note: "Request submitted by Arjun Kumar.",
        createdAt: "2026-09-18T09:00:00.000Z",
      },
    ],
  },
];

export function useMaterialRequests() {
  const [requests, setRequests] =
    useState<MaterialRequest[]>(initialRequests);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setRequests(JSON.parse(saved) as MaterialRequest[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests)).catch(
      () => undefined,
    );
  }, [hydrated, requests]);

  const addRequest = useCallback((input: MaterialRequestInput) => {
    const createdAt = new Date().toISOString();
    const id = `MR-${Date.now()}`;
    const request: MaterialRequest = {
      ...input,
      id,
      project: "Palm Grove Residence",
      site: "Villa 18",
      status: "Submitted",
      createdAt,
      history: [
        {
          id: `${id}-1`,
          status: "Submitted",
          note: "Request submitted by Arjun Kumar.",
          createdAt,
        },
      ],
    };
    setRequests((current) => [request, ...current]);
  }, []);

  const confirmReceived = useCallback((requestId: string) => {
    const createdAt = new Date().toISOString();
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId && request.status === "Dispatched"
          ? {
              ...request,
              status: "Received",
              history: [
                {
                  id: `${request.id}-${Date.now()}`,
                  status: "Received",
                  note: "Receipt confirmed at Villa 18 by Arjun Kumar.",
                  createdAt,
                },
                ...request.history,
              ],
            }
          : request,
      ),
    );
  }, []);

  return { requests, addRequest, confirmReceived };
}
