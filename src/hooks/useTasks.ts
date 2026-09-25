import { databaseStorage } from "../database";
import { useCallback, useEffect, useState } from "react";
import { Task, tasks as initialTasks, TaskStatus, TaskUpdate } from "../data";

const STORAGE_KEY = "@shd-interior/tasks-v1";

export type TaskUpdateInput = {
  taskId: string;
  status: TaskStatus;
  progress: number;
  remark: string;
  evidenceName?: string;
  beforeMediaName?: string;
  duringMediaName?: string;
  afterMediaName?: string;
};

export type CreateTaskInput = Pick<
  Task,
  | "title"
  | "area"
  | "due"
  | "dueDate"
  | "priority"
  | "description"
  | "evidenceRequired"
  | "projectId"
  | "projectName"
  | "siteId"
  | "siteName"
  | "supervisorId"
  | "supervisorName"
>;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restore() {
      try {
        const saved = await databaseStorage.getItem(STORAGE_KEY);
        if (saved) setTasks(JSON.parse(saved) as Task[]);
      } catch {
        // The bundled demonstration tasks remain available if local storage fails.
      } finally {
        setHydrated(true);
      }
    }
    restore();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    databaseStorage
      .setItem(STORAGE_KEY, JSON.stringify(tasks))
      .catch(() => undefined);
  }, [hydrated, tasks]);

  const updateTask = useCallback((input: TaskUpdateInput) => {
    const update: TaskUpdate = {
      id: `${input.taskId}-${Date.now()}`,
      status: input.status,
      progress: input.progress,
      remark: input.remark,
      evidenceName: input.evidenceName,
      beforeMediaName: input.beforeMediaName,
      duringMediaName: input.duringMediaName,
      afterMediaName: input.afterMediaName,
      createdAt: new Date().toISOString(),
    };
    setTasks((current) =>
      current.map((task) =>
        task.id === input.taskId
          ? {
              ...task,
              status: input.status,
              progress: input.progress,
              updates: [update, ...task.updates],
            }
          : task,
      ),
    );
  }, []);

  const createTask = useCallback((input: CreateTaskInput) => {
    const createdAt = new Date().toISOString();
    const id = `TSK-${Date.now().toString().slice(-6)}`;
    const task: Task = {
      ...input,
      id,
      status: "Assigned",
      progress: 0,
      updates: [
        {
          id: `${id}-created`,
          status: "Assigned",
          progress: 0,
          remark: `Created and assigned by Admin to ${input.supervisorName}`,
          createdAt,
        },
      ],
    };
    setTasks((current) => [task, ...current]);
  }, []);

  return { tasks, createTask, updateTask, hydrated };
}
