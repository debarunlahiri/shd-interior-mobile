import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "@shd-interior/admin-projects-v1";

export type ProjectStatus =
  "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";

export type SiteStatus = "Planning" | "Active" | "On Hold" | "Completed";

export type SupervisorAssignment = {
  id: string;
  supervisorId: string;
  supervisorName: string;
  assignedAt: string;
  note: string;
};

export type AdminSite = {
  id: string;
  name: string;
  location: string;
  status: SiteStatus;
  startDate: string;
  targetDate: string;
  completion: number;
  supervisorId: string;
  supervisorName: string;
  assignmentHistory: SupervisorAssignment[];
  createdAt: string;
  updatedAt: string;
};

export type AdminSiteInput = Omit<
  AdminSite,
  "id" | "assignmentHistory" | "createdAt" | "updatedAt"
>;

export type AdminProject = {
  id: string;
  name: string;
  clientName: string;
  location: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  contractValue: number;
  amountReceived: number;
  totalExpense: number;
  siteCount: number;
  completion: number;
  sites: AdminSite[];
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectInput = Omit<
  AdminProject,
  "id" | "sites" | "createdAt" | "updatedAt"
>;

const initialProjects: AdminProject[] = [
  {
    id: "PRJ-1001",
    name: "Palm Grove Residence",
    clientName: "Mehra Family",
    location: "Gurugram",
    status: "Active",
    startDate: "2026-05-12",
    targetDate: "2026-11-28",
    contractValue: 2400000,
    amountReceived: 1680000,
    totalExpense: 1240000,
    siteCount: 1,
    completion: 68,
    sites: [
      {
        id: "STE-1001",
        name: "Villa 18",
        location: "Sector 54, Gurugram",
        status: "Active",
        startDate: "2026-05-12",
        targetDate: "2026-11-28",
        completion: 68,
        supervisorId: "USR-1001",
        supervisorName: "Arjun Kumar",
        assignmentHistory: [
          {
            id: "ASN-1001",
            supervisorId: "USR-1001",
            supervisorName: "Arjun Kumar",
            assignedAt: "2026-05-10T08:30:00.000Z",
            note: "Initial site assignment",
          },
        ],
        createdAt: "2026-05-01T08:30:00.000Z",
        updatedAt: "2026-09-23T08:30:00.000Z",
      },
    ],
    createdAt: "2026-05-01T08:30:00.000Z",
    updatedAt: "2026-09-23T08:30:00.000Z",
  },
  {
    id: "PRJ-1002",
    name: "Orchid Corporate Suite",
    clientName: "Orchid Technologies",
    location: "Noida",
    status: "Active",
    startDate: "2026-07-01",
    targetDate: "2027-01-15",
    contractValue: 1850000,
    amountReceived: 925000,
    totalExpense: 870000,
    siteCount: 2,
    completion: 42,
    sites: [],
    createdAt: "2026-06-20T08:30:00.000Z",
    updatedAt: "2026-09-22T08:30:00.000Z",
  },
  {
    id: "PRJ-1003",
    name: "Lakeview Apartment",
    clientName: "Riya Sen",
    location: "Delhi",
    status: "On Hold",
    startDate: "2026-02-10",
    targetDate: "2026-10-05",
    contractValue: 980000,
    amountReceived: 784000,
    totalExpense: 320000,
    siteCount: 1,
    completion: 91,
    sites: [],
    createdAt: "2026-02-01T08:30:00.000Z",
    updatedAt: "2026-09-20T08:30:00.000Z",
  },
];

export function useAdminProjects() {
  const [projects, setProjects] = useState(initialProjects);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const restored = JSON.parse(saved) as AdminProject[];
          setProjects(
            restored.map((project) => ({
              ...project,
              sites: Array.isArray(project.sites)
                ? project.sites.map((site) => ({
                    ...site,
                    assignmentHistory: Array.isArray(site.assignmentHistory)
                      ? site.assignmentHistory
                      : [],
                  }))
                : [],
            })),
          );
        }
      } catch {
        // Seed projects remain available if local storage cannot be restored.
      } finally {
        setHydrated(true);
      }
    }

    restore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects)).catch(
      () => undefined,
    );
  }, [hydrated, projects]);

  const saveProject = useCallback(
    (input: AdminProjectInput, projectId?: string) => {
      const now = new Date().toISOString();
      setProjects((current) => {
        if (projectId) {
          return current.map((project) =>
            project.id === projectId
              ? { ...project, ...input, updatedAt: now }
              : project,
          );
        }

        return [
          {
            ...input,
            id: `PRJ-${Date.now()}`,
            sites: [],
            createdAt: now,
            updatedAt: now,
          },
          ...current,
        ];
      });
    },
    [],
  );

  const saveSite = useCallback(
    (projectId: string, input: AdminSiteInput, siteId?: string) => {
      const now = new Date().toISOString();
      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) return project;

          const currentSite = siteId
            ? project.sites.find((site) => site.id === siteId)
            : undefined;
          const assignmentChanged =
            !currentSite || currentSite.supervisorId !== input.supervisorId;
          const assignment: SupervisorAssignment = {
            id: `ASN-${Date.now()}`,
            supervisorId: input.supervisorId,
            supervisorName: input.supervisorName,
            assignedAt: now,
            note: currentSite
              ? `Transferred from ${currentSite.supervisorName || "Unassigned"} to ${input.supervisorName}`
              : `Assigned to ${input.supervisorName}`,
          };
          const sites = currentSite
            ? project.sites.map((site) =>
                site.id === siteId
                  ? {
                      ...site,
                      ...input,
                      updatedAt: now,
                      assignmentHistory: assignmentChanged
                        ? [assignment, ...site.assignmentHistory]
                        : site.assignmentHistory,
                    }
                  : site,
              )
            : [
                {
                  ...input,
                  id: `STE-${Date.now()}`,
                  assignmentHistory: [assignment],
                  createdAt: now,
                  updatedAt: now,
                },
                ...project.sites,
              ];

          return {
            ...project,
            sites,
            siteCount: sites.length,
            updatedAt: now,
          };
        }),
      );
    },
    [],
  );

  return { projects, saveProject, saveSite };
}
