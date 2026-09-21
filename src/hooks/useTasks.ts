import { useState, useCallback, useEffect } from 'react';
import type { PaintTask } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<PaintTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTasks(data);
        }
      })
      .catch((err) => console.error('Failed to load tasks:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const addTask = useCallback((colorName: string, liters: number, colorHex?: string) => {
    const tempId = `temp-${Date.now()}`;
    const newTask: PaintTask = {
      id: tempId,
      colorName,
      colorHex,
      liters,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colorName, colorHex, liters, status: 'pending' }),
    })
      .then((res) => res.json())
      .then((savedTask) => {
        if (savedTask.id) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? savedTask : t)));
        }
      })
      .catch((err) => {
        console.error('Failed to save task:', err);
        // Rollback on failure
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      });
  }, []);

  const removeTask = useCallback((id: string) => {
    // Optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    fetch(`/api/tasks/${id}`, { method: 'DELETE' }).catch((err) => {
      console.error('Failed to delete task:', err);
      // We could rollback here if we kept the deleted task, but skipping for simplicity
    });
  }, []);

  const updateTaskStatus = useCallback((id: string, status: PaintTask['status']) => {
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((err) => {
      console.error('Failed to update task status:', err);
    });
  }, []);

  return { tasks, addTask, removeTask, updateTaskStatus, isLoading };
}
