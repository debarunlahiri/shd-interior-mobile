import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/site-documents-v1";

export type SiteDocument = {
  id: string;
  name: string;
  project: string;
  site: string;
  category: string;
  uploadedAt: string;
  uri?: string;
  mimeType?: string;
  size?: number;
};

export type DocumentUploadInput = Pick<
  SiteDocument,
  "name" | "project" | "site" | "category" | "uri" | "mimeType" | "size"
>;

const initialDocuments: SiteDocument[] = [
  {
    id: "DOC-1001",
    name: "Approved lighting plan.pdf",
    project: "Palm Grove Residence",
    site: "Villa 18",
    category: "Drawing",
    mimeType: "application/pdf",
    uploadedAt: "2026-09-18T10:00:00.000Z",
  },
  {
    id: "DOC-1002",
    name: "Kitchen elevation.pdf",
    project: "Palm Grove Residence",
    site: "Villa 18",
    category: "Drawing",
    mimeType: "application/pdf",
    uploadedAt: "2026-09-19T09:30:00.000Z",
  },
  {
    id: "DOC-1003",
    name: "Material challan 184.pdf",
    project: "Palm Grove Residence",
    site: "Villa 18",
    category: "Bill / Challan",
    mimeType: "application/pdf",
    uploadedAt: "2026-09-21T11:15:00.000Z",
  },
];

export function useDocuments() {
  const [documents, setDocuments] = useState<SiteDocument[]>(initialDocuments);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setDocuments(JSON.parse(saved) as SiteDocument[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents)).catch(
      () => undefined,
    );
  }, [documents, hydrated]);

  const addDocument = useCallback((input: DocumentUploadInput) => {
    setDocuments((current) => [
      {
        ...input,
        id: `DOC-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      },
      ...current,
    ]);
  }, []);

  return { documents, addDocument };
}
