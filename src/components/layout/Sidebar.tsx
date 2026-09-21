import React from 'react';
import styles from './Sidebar.module.css';
import type { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactElement }[] = [
  {
    page: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    page: 'calculator',
    label: 'Калькулятор',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="11" y2="14" />
        <line x1="8" y1="18" x2="11" y2="18" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="14" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    page: 'tasks',
    label: 'Задачи',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    page: 'configuration',
    label: 'Конфигурация',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
  {
    page: 'history',
    label: 'История',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
        <polyline points="3 3 3.05 11 11 11" />
      </svg>
    ),
  },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      <div className={`${styles['sidebar-overlay']} ${isOpen ? styles.open : ''}`} onClick={onClose} />
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles['sidebar-logo']}>
          <div className={styles['logo-mark']}>
            <div className={styles['logo-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 12h8M12 8v8" strokeWidth="2" />
              </svg>
            </div>
            <div className={styles['logo-text']}>
              <span className={styles['logo-title']}>КамПаунт</span>
              <span className={styles['logo-subtitle']}>Paint Production</span>
            </div>
          </div>
        </div>

        <nav className={styles['sidebar-nav']}>
          <div className={styles['nav-section-label']}>Навигация</div>
          {navItems.map((item) => (
            <button
              key={item.page}
              className={`${styles['nav-item']} ${currentPage === item.page ? styles.active : ''}`}
              onClick={() => handleNav(item.page)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles['sidebar-footer']}>
          <div className={styles['user-profile']}>
            <div className={styles['user-avatar']}>ОП</div>
            <div className={styles['user-info']}>
              <div className={styles['user-name']}>Оператор</div>
              <div className={styles['user-role']}>Производство</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
