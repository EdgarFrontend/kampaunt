import { TaskList } from '../../../components/tasks/TaskList';
import type { PaintTask } from '../../../types';
import styles from './TasksPage.module.css';

interface TasksPageProps {
  tasks: PaintTask[];
  onAddTask: (colorName: string, liters: number, colorHex?: string) => void;
  onRemoveTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: PaintTask['status']) => void;
  onLaunchTask: (task: PaintTask) => void;
  isLoading?: boolean;
}

export function TasksPage({
  tasks,
  onAddTask,
  onRemoveTask,
  onUpdateTaskStatus,
  onLaunchTask,
  isLoading,
}: TasksPageProps) {
  return (
    <div className={styles.page}>
      <div className={`card ${styles['tasks-card']}`}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Загрузка задач...</span>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onAddTask={onAddTask}
            onRemoveTask={onRemoveTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onLaunchTask={onLaunchTask}
          />
        )}
      </div>
    </div>
  );
}
