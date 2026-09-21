import { useState, useCallback } from 'react';
import type { PaintTask } from '../types';

const TASKS_KEY = 'kampaunt_tasks';

function loadTasks(): PaintTask[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) return JSON.parse(raw) as PaintTask[];
  } catch {}
  return [];
}

function saveTasks(tasks: PaintTask[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<PaintTask[]>(loadTasks);

  const addTask = useCallback((colorName: string, liters: number, colorHex?: string) => {
    const task: PaintTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      colorName,
      colorHex,
      liters,
      status: 'pending',
      createdAt: Date.now(),
    };
    setTasks((prev) => {
      const next = [task, ...prev];
      saveTasks(next);
      return next;
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  }, []);

  const updateTaskStatus = useCallback((id: string, status: PaintTask['status']) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status } : t));
      saveTasks(next);
      return next;
    });
  }, []);

  return { tasks, addTask, removeTask, updateTaskStatus };
}
