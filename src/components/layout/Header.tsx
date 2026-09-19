import styles from './Header.module.css';
import type { VacuumationStatus } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  vacuumStatus: VacuumationStatus;
  onMenuToggle: () => void;
}

const statusLabels: Record<VacuumationStatus, string> = {
  idle: 'Система готова',
  running: 'Вакумация выполняется',
  paused: 'Вакумация приостановлена',
  completed: 'Вакумация завершена',
  stopped: 'Вакумация остановлена',
};

export function Header({ title, subtitle, vacuumStatus, onMenuToggle }: HeaderProps) {
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
        <div className={`${styles['status-pill']} ${styles[vacuumStatus]}`}>
          <span className={`${styles.dot} ${vacuumStatus === 'running' ? styles.animate : ''}`} />
          {statusLabels[vacuumStatus]}
        </div>
      </div>
    </header>
  );
}
