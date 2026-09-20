import { useEffect, useMemo, useState } from 'react';
import styles from './History.module.css';
import type { HistoryEntry } from '../../../types';
import { formatTime } from '../../../utils';
import { PageLoader } from '../../../components/ui/PageLoader';

interface ProductionRow {
  name: string;
  hex?: string;
  liters: number;
}

function formatLiters(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function buildProductionReport(history: HistoryEntry[]): ProductionRow[] {
  const totals = new Map<string, ProductionRow>();

  for (const entry of history) {
    const name = entry.color?.name?.trim() || 'Без цвета';
    const hex = entry.color?.hex;
    const key = `${name.toLowerCase()}|${hex ?? ''}`;
    const existing = totals.get(key);

    if (existing) {
      existing.liters += entry.volumeLiters;
    } else {
      totals.set(key, { name, hex, liters: entry.volumeLiters });
    }
  }

  return [...totals.values()].sort((a, b) => b.liters - a.liters || a.name.localeCompare(b.name, 'ru'));
}

interface HistoryProps {
  history: HistoryEntry[];
  isLoading?: boolean;
  onLoad: () => void;
  onDelete: (id: string) => void;
}

export function History({ history, isLoading, onLoad, onDelete }: HistoryProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const productionRows = useMemo(() => buildProductionReport(history), [history]);
  const totalLiters = useMemo(
    () => productionRows.reduce((sum, row) => sum + row.liters, 0),
    [productionRows],
  );

  if (isLoading) {
    return <PageLoader label="Загрузка истории..." />;
  }

  if (history.length === 0) {
    return (
      <div className={styles.page}>
        <div className="card">
          <div className={styles['empty-state']}>
            <svg className={styles['empty-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 8 12 12 14 14" />
              <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
              <polyline points="3 3 3.05 11 11 11" />
            </svg>
            <div className={styles['empty-title']}>История пуста</div>
            <div className={styles['empty-desc']}>
              Здесь будут отображаться завершённые процессы вакумации. Запустите первый процесс на Dashboard.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="card">
        <div className={styles['history-header']}>
          <h2>История процессов</h2>
          <div className={styles['header-actions']}>
            <span className={styles['count-badge']}>{history.length} записей</span>
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${reportOpen ? styles['report-btn-active'] : ''}`}
              onClick={() => setReportOpen((open) => !open)}
              aria-expanded={reportOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 14l4-4 4 4 6-6" />
              </svg>
              Отчёт по производству
              <svg
                className={`${styles.chevron} ${reportOpen ? styles['chevron-open'] : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {reportOpen && (
          <div className={styles['report-panel']}>
            <div className={styles['report-title']}>Производство красок</div>
            <div className={styles['report-scroll']}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Краска</th>
                    <th>Объём</th>
                  </tr>
                </thead>
                <tbody>
                  {productionRows.map((row) => (
                    <tr key={`${row.name}-${row.hex ?? ''}`}>
                      <td>
                        <div className={styles['color-cell']}>
                          <div
                            className={styles['color-dot']}
                            style={{ background: row.hex || '#9CA3AF' }}
                          />
                          <span className={styles['color-name']}>{row.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles['volume-cell']}>{formatLiters(row.liters)} л</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Итого</td>
                    <td>
                      <span className={styles['volume-cell']}>{formatLiters(totalLiters)} л</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата создания</th>
                <th>Цвет</th>
                <th>Объём</th>
                <th>Длительность</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className={styles['date-cell']}>{entry.createdAt}</div>
                    <div className={styles['time-range']}>
                      Факт. время: {formatTime(entry.actualSeconds)}
                    </div>
                  </td>
                  <td>
                    {entry.color ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: entry.color.hex || '#9CA3AF',
                          border: '1px solid var(--border)'
                        }} />
                        <span style={{ fontWeight: 600 }}>{entry.color.name}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={styles['volume-cell']}>{entry.volumeLiters} л</span>
                  </td>
                  <td>
                    <span className={styles['duration-cell']}>{entry.durationMinutes} мин</span>
                  </td>
                  <td>
                    <span className={`${styles['status-chip']} ${styles[entry.status]}`}>
                      {entry.status === 'completed' ? (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Завершено
                        </>
                      ) : (
                        <>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          </svg>
                          Остановлено
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles['delete-btn']}
                      onClick={() => setPendingDelete(entry)}
                      title="Удалить запись"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pendingDelete && (
        <div className={styles.modalOverlay} onClick={() => setPendingDelete(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-history-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-history-title" className={styles.modalTitle}>Удалить запись?</h3>
            <p className={styles.modalSubtitle}>
              {pendingDelete.color?.name
                ? `Запись «${pendingDelete.color.name}», ${pendingDelete.volumeLiters} л от ${pendingDelete.createdAt} будет удалена без возможности восстановления.`
                : `Запись ${pendingDelete.volumeLiters} л от ${pendingDelete.createdAt} будет удалена без возможности восстановления.`}
            </p>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-secondary" onClick={() => setPendingDelete(null)}>
                Отмена
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onDelete(pendingDelete.id);
                  setPendingDelete(null);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
