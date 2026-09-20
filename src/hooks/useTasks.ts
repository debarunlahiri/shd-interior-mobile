import AsyncStorage from "@react-native-async-storage/async-storage";
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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function restore() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(
      () => undefined,
    );
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

  return { tasks, updateTask, hydrated };
}
