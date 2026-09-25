import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/issues-v1";

export type IssueKind = "Site Issue" | "Technical Support";
export type IssueStatus =
  "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export type IssueHistoryEntry = {
  id: string;
  status: IssueStatus;
  note: string;
  createdAt: string;
};

export type SiteIssue = {
  id: string;
  kind: IssueKind;
  project: string;
  site: string;
  category: string;
  priority: string;
  reportedDate: string;
  title: string;
  remarks: string;
  status: IssueStatus;
  photoNames: string[];
  videoNames: string[];
  assignee?: string;
  resolution?: string;
  history: IssueHistoryEntry[];
  createdAt: string;
};

export type SiteIssueInput = Pick<
  SiteIssue,
  | "kind"
  | "category"
  | "priority"
  | "reportedDate"
  | "title"
  | "remarks"
  | "photoNames"
  | "videoNames"
>;

const initialIssues: SiteIssue[] = [
  {
    id: "ISS-1001",
    kind: "Site Issue",
    project: "Palm Grove Residence",
    site: "Villa 18",
    category: "Technical",
    priority: "High",
    reportedDate: "2026-09-20",
    title: "Lighting plan confirmation",
    remarks: "Revised lighting points need engineering confirmation.",
    status: "Assigned",
    assignee: "Electrical engineer",
    photoNames: [],
    videoNames: [],
    history: [
      {
        id: "ISS-1001-2",
        status: "Assigned",
        note: "Assigned to the electrical engineer by Admin.",
        createdAt: "2026-09-20T12:05:00.000Z",
      },
      {
        id: "ISS-1001-1",
        status: "Open",
        note: "Issue reported by Arjun Kumar.",
        createdAt: "2026-09-20T11:10:00.000Z",
      },
    ],
    createdAt: "2026-09-20T11:10:00.000Z",
  },
];

export function useIssues() {
  const [issues, setIssues] = useState<SiteIssue[]>(initialIssues);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    databaseStorage
      .getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setIssues(JSON.parse(saved) as SiteIssue[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(issues))
      .catch(() => undefined);
  }, [hydrated, issues]);

  const addIssue = useCallback((input: SiteIssueInput) => {
    const createdAt = new Date().toISOString();
    const id = `${input.kind === "Technical Support" ? "SUP" : "ISS"}-${Date.now()}`;
    setIssues((current) => [
      {
        ...input,
        id,
        project: "Palm Grove Residence",
        site: "Villa 18",
        status: "Open",
        createdAt,
        history: [
          {
            id: `${id}-1`,
            status: "Open",
            note:
              input.kind === "Technical Support"
                ? "Technical support requested by Arjun Kumar."
                : "Issue reported by Arjun Kumar.",
            createdAt,
          },
        ],
      },
      ...current,
    ]);
  }, []);

  const updateStatus = useCallback(
    (id: string, status: IssueStatus, note: string, assignee?: string) => {
      const createdAt = new Date().toISOString();
      setIssues((current) =>
        current.map((issue) =>
          issue.id === id
            ? {
                ...issue,
                status,
                assignee: assignee ?? issue.assignee,
                resolution:
                  status === "Resolved" || status === "Closed"
                    ? note.trim()
                    : issue.resolution,
                history: [
                  {
                    id: `${id}-${Date.now()}`,
                    status,
                    note: note.trim(),
                    createdAt,
                  },
                  ...issue.history,
                ],
              }
            : issue,
        ),
      );
    },
    [],
  );

  return { issues, addIssue, updateStatus };
}
