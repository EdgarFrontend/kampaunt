import styles from './PageLoader.module.css';

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = 'Загрузка данных...' }: PageLoaderProps) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label={label}>
      <div className={styles.scene}>
        <span className={styles.glow} />
        <svg className={styles.orbit} viewBox="0 0 120 120" aria-hidden>
          <circle className={styles.orbitTrack} cx="60" cy="60" r="48" />
          <circle className={styles.orbitDot} cx="60" cy="12" r="4.5" />
        </svg>
        <svg className={styles.orbitReverse} viewBox="0 0 120 120" aria-hidden>
          <circle className={styles.orbitTrackSoft} cx="60" cy="60" r="36" />
        </svg>
        <div className={styles.dropWrap}>
          <svg className={styles.drop} viewBox="0 0 48 56" aria-hidden>
            <path
              d="M24 4C24 4 8 22.5 8 34.5C8 43.6 15.2 51 24 51s16-7.4 16-16.5C40 22.5 24 4 24 4z"
              fill="url(#paintDrop)"
            />
            <path
              d="M17 33c2.2-6 6-12.5 7-16"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="paintDrop" x1="16" y1="8" x2="36" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="0.55" stopColor="#2563EB" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.dots} aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
