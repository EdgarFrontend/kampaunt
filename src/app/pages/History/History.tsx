import styles from './History.module.css';
import type { HistoryEntry } from '../../../types';
import { formatTime } from '../../../utils';

interface HistoryProps {
  history: HistoryEntry[];
}

export function History({ history }: HistoryProps) {
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
          <span className={styles['count-badge']}>{history.length} записей</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата создания</th>
                <th>Цвет</th>
                <th>Объём</th>
                <th>Длительность</th>
                <th>Статус</th>
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
                        {entry.color.hex && (
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: entry.color.hex, border: '1px solid var(--border)' }} />
                        )}
                        {!entry.color.hex && (
                           <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#9CA3AF', border: '1px solid var(--border)' }} />
                        )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
