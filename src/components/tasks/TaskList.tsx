import { useState } from 'react';
import type { PaintTask } from '../../types';
import styles from './TaskList.module.css';

const COLOR_PRESETS = [
  { name: 'Белый', hex: '#FFFFFF' },
  { name: 'Чёрный', hex: '#111827' },
  { name: 'Красный', hex: '#EF4444' },
  { name: 'Розовый', hex: '#FF3278' },
  { name: 'Оранжевый', hex: '#F97316' },
  { name: 'Жёлтый', hex: '#fae829' },
  { name: 'Зелёный', hex: '#22C55E' },
  { name: 'Синий', hex: '#3B82F6' },
  { name: 'Фиолетовый', hex: '#A855F7' },
  { name: 'Бежевый', hex: '#f5f5dc' },
  { name: 'Коричневый', hex: '#964b00' },
];

const STATUS_LABEL: Record<PaintTask['status'], string> = {
  pending: 'Ожидает',
  'in-progress': 'В работе',
  done: 'Выполнено',
};

interface TaskListProps {
  tasks: PaintTask[];
  onAddTask: (colorName: string, liters: number, colorHex?: string) => void;
  onRemoveTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: PaintTask['status']) => void;
  onLaunchTask: (task: PaintTask) => void;
}

export function TaskList({ tasks, onAddTask, onRemoveTask, onUpdateTaskStatus, onLaunchTask }: TaskListProps) {
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('');
  const [liters, setLiters] = useState('');
  const [litersError, setLitersError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!colorName.trim()) return;
    const num = parseFloat(liters);
    if (!liters || isNaN(num) || num <= 0) {
      setLitersError('Укажите корректный объём');
      return;
    }
    onAddTask(colorName.trim(), num, colorHex || undefined);
    setColorName('');
    setColorHex('');
    setLiters('');
    setLitersError('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setColorName('');
    setColorHex('');
    setLiters('');
    setLitersError('');
    setShowForm(false);
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Список задач</span>
          {tasks.length > 0 && (
            <span className={styles.taskCount}>{tasks.length}</span>
          )}
        </div>
        {!showForm && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Добавить задачу
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className={styles.form}>
          <div className={styles.formTitle}>Новая задача</div>

          {/* Color presets */}
          <div className={styles.formGroup}>
            <label className="label">Быстрый выбор цвета</label>
            <div className={styles.colorPresets}>
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  className={styles.colorPresetBtn}
                  onClick={() => { setColorName(p.name); setColorHex(p.hex); }}
                  style={{
                    background: p.hex,
                    border: p.hex === '#FFFFFF' ? '1px solid var(--border)' : '1px solid transparent',
                    boxShadow: colorHex === p.hex ? '0 0 0 2px var(--surface), 0 0 0 4px var(--accent)' : 'none',
                  }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className="label">Цвет краски</label>
              <input
                type="text"
                className="input"
                placeholder="Например: Красный, RAL 3020"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.formGroup}>
              <label className="label">HEX</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="color"
                  style={{ width: 38, height: 38, padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6 }}
                  value={colorHex || '#000000'}
                  onChange={(e) => setColorHex(e.target.value)}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="#RRGGBB"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  style={{ width: 100 }}
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup} style={{ maxWidth: 160 }}>
            <label className="label">Литраж</label>
            <input
              type="number"
              className={`input ${litersError ? 'input-error' : ''}`}
              placeholder="100"
              value={liters}
              onChange={(e) => { setLiters(e.target.value); setLitersError(''); }}
              min="0.1"
              step="0.1"
            />
            {litersError && <div className="error-text">{litersError}</div>}
          </div>

          <div className={styles.formActions}>
            <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Отмена</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleAdd}
              disabled={!colorName.trim()}
            >
              Создать задачу
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !showForm ? (
        <div className={styles.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="15" x2="13" y2="15" />
          </svg>
          <span>Задачи не созданы</span>
          <span className={styles.emptyHint}>Нажмите «Добавить задачу» чтобы запланировать производство</span>
        </div>
      ) : (
        <div className={styles.list}>
          {tasks.map((task) => (
            <div key={task.id} className={`${styles.taskCard} ${styles[`task-${task.status}`]}`}>
              <div className={styles.taskInfo}>
                <div className={styles.taskColor}>
                  <div
                    className={styles.colorDot}
                    style={{ backgroundColor: task.colorHex || '#9CA3AF' }}
                  />
                  <span className={styles.taskColorName}>{task.colorName}</span>
                </div>
                <div className={styles.taskMeta}>
                  <span className={styles.taskLiters}>{task.liters} л</span>
                  <span className={`${styles.statusBadge} ${styles[`status-${task.status}`]}`}>
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
              </div>
              <div className={styles.taskActions}>
                {task.status !== 'done' && (
                  <button
                    className={`btn btn-sm ${task.status === 'in-progress' ? 'btn-secondary' : 'btn-primary'}`}
                    style={task.status === 'pending' ? undefined : { backgroundColor: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)' }}
                    onClick={() => task.status === 'pending' ? onLaunchTask(task) : onUpdateTaskStatus(task.id, 'done')}
                    title={task.status === 'pending' ? 'Запустить' : 'Завершить'}
                  >
                    {task.status === 'pending' ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Запустить
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Выполнено
                      </>
                    )}
                  </button>
                )}
                {task.status === 'done' && (
                  <span className={styles.doneCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Готово
                  </span>
                )}
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onRemoveTask(task.id)}
                  title="Удалить"
                  style={{ color: 'var(--danger)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
