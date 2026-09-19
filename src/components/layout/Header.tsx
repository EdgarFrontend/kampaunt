import styles from './Header.module.css';
import type { VacuumationStatus } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  vacuumStatus: VacuumationStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onMenuToggle: () => void;
}

const statusLabels: Record<VacuumationStatus, string> = {
  idle: 'Система готова',
  running: 'Вакумация выполняется',
  paused: 'Вакумация приостановлена',
  completed: 'Вакумация завершена',
  stopped: 'Вакумация остановлена',
};

export function Header({ title, subtitle, vacuumStatus, theme, onToggleTheme, onMenuToggle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles['header-left']}>
        <button className={styles['menu-btn']} onClick={onMenuToggle} aria-label="Открыть меню">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <div className={styles['page-title']}>{title}</div>
          {subtitle && <div className={styles['page-subtitle']}>{subtitle}</div>}
        </div>
      </div>

      <div className={styles['header-right']}>
        <button
          type="button"
          className={styles['theme-btn']}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
            </svg>
          )}
        </button>
        <div className={`${styles['status-pill']} ${styles[vacuumStatus]}`}>
          <span className={`${styles.dot} ${vacuumStatus === 'running' ? styles.animate : ''}`} />
          {statusLabels[vacuumStatus]}
        </div>
      </div>
    </header>
  );
}
