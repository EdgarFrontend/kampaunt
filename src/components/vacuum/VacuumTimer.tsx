import { useMemo } from 'react';
import styles from './VacuumTimer.module.css';
import { formatTime, formatElapsed, formatTimeRemaining } from '../../utils';
import type { VacuumationStatus, PaintColor } from '../../types';

interface VacuumTimerProps {
  status: VacuumationStatus;
  remaining: number;
  elapsed: number;
  progress: number;
  durationMinutes: number;
  color: PaintColor | null;
  liters: number;
  isLoading?: boolean;
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function VacuumTimer({ status, remaining, elapsed, progress, durationMinutes, color, liters, isLoading }: VacuumTimerProps) {
  const offset = CIRCUMFERENCE * (1 - progress);

  const labelText = {
    idle: 'Готово к вакумации',
    running: 'Осталось',
    paused: 'Приостановлено',
    completed: 'Завершено',
    stopped: 'Остановлено',
  }[status];

  // Generate a stable set of bubbles
  const bubbles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`, // random position across width
      size: `${8 + Math.random() * 12}px`, // 8px to 20px
      delay: `${Math.random() * 2}s`, // 0 to 2s delay
      duration: `${1.5 + Math.random() * 1.5}s`, // 1.5s to 3s speed
    }));
  }, []);

  // Set the background color based on status and paint color
  const chamberColor = (status === 'idle' || status === 'stopped') 
    ? 'var(--bg)' // Default when not active
    : (color?.hex || 'var(--border)'); // Selected color or fallback

  return (
    <div className={styles.container}>
      <div className={styles['ring-wrapper']}>
        {/* Vacuum Chamber Background */}
        <div 
          className={styles['vacuum-chamber']} 
          style={{ backgroundColor: chamberColor }}
        >
          {/* Animated Bubbles (only visible when running or paused, but paused stops animation) */}
          {(status === 'running' || status === 'paused') && bubbles.map(bubble => (
            <div 
              key={bubble.id}
              className={styles.bubble}
              style={{
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationName: status === 'running' ? styles['bubble-rise'] : 'none',
                animationDuration: bubble.duration,
                animationDelay: bubble.delay,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in',
                // Keep bubbles visible but stopped when paused
                transform: status === 'paused' ? 'translateY(-100px)' : undefined, 
                opacity: status === 'paused' ? 0.6 : undefined
              }}
            />
          ))}
        </div>

        <svg className={styles['ring-svg']} viewBox="0 0 200 200">
          <circle
            className={styles['ring-bg']}
            cx="100"
            cy="100"
            r={RADIUS}
          />
          <circle
            className={`${styles['ring-track']} ${styles[status]}`}
            cx="100"
            cy="100"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={status === 'idle' || status === 'stopped' ? CIRCUMFERENCE : offset}
          />
        </svg>

        <div className={styles['ring-center']}>
          {/* Glass plate for readable text over colored background */}
          <div className={styles['glass-plate']}>
            <svg
              className={`${styles['ring-icon']} ${styles[status]}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {status === 'completed' ? (
                <polyline points="20 6 9 17 4 12" />
              ) : status === 'stopped' ? (
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              ) : status === 'paused' ? (
                 <path d="M10 15v-6m4 6v-6" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </>
              )}
            </svg>

            <div className={`${styles['ring-time']} ${styles[status]}`}>
              {isLoading ? (
                <span className={styles['skeleton-loader']} style={{ display: 'inline-block', width: '100px', height: '36px', borderRadius: '8px', verticalAlign: 'middle' }} />
              ) : (
                status === 'idle' || status === 'stopped'
                  ? `${durationMinutes}:00`
                  : formatTime(status === 'completed' ? 0 : remaining)
              )}
            </div>
            <div className={styles['ring-label']}>{labelText}</div>
            
            {(status === 'running' || status === 'paused') && (
              <div className={styles['ring-percent']}>
                {Math.round(progress * 100)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {(status === 'running' || status === 'paused') && color && (
        <div className={styles['color-badge']}>
           Цвет: 
           {color.hex ? (
             <span className={styles['color-dot']} style={{ backgroundColor: color.hex }} />
           ) : (
             <span className={styles['color-dot']} style={{ backgroundColor: '#9CA3AF' }} />
           )}
           <span>{color.name}</span>
        </div>
      )}

      {(status === 'running' || status === 'paused') && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles['stat-value']}>{formatTime(elapsed)}</span>
            <span className={styles['stat-label']}>прошло</span>
          </div>
          <div className={styles['stat-divider']} />
          <div className={styles.stat}>
            <span className={styles['stat-value']}>{formatTimeRemaining(remaining)}</span>
            <span className={styles['stat-label']}>осталось</span>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className={styles['idle-label']}>
          Продолжительность: {isLoading ? (
            <span className={styles['skeleton-loader']} style={{ display: 'inline-block', width: '36px', height: '14px', borderRadius: '4px', verticalAlign: 'middle', margin: '0 4px' }} />
          ) : (
            `${durationMinutes} мин`
          )}
          {isLoading && <br/>}
          {!isLoading && <br/>}
          Объём: {liters} л
        </div>
      )}

      {status === 'completed' && (
        <div className={styles['completed-msg']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Процесс успешно завершён · {formatElapsed(elapsed)}
        </div>
      )}
      
      {status === 'stopped' && (
        <div className={styles['stopped-msg']}>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
           </svg>
           Вакумация остановлена
        </div>
      )}
    </div>
  );
}
