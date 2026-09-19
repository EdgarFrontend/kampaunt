import { useState } from 'react';
import styles from './Dashboard.module.css';
import { IngredientsTable } from '../../../components/calculator/IngredientsTable';
import { VacuumTimer } from '../../../components/vacuum/VacuumTimer';
import { calculateIngredients } from '../../../utils';
import type { Recipe, VacuumationState, PaintColor } from '../../../types';

const COLOR_PRESETS = [
  { name: 'Белый', hex: '#FFFFFF' },
  { name: 'Чёрный', hex: '#111827' },
  { name: 'Красный', hex: '#EF4444' },
  { name: 'Оранжевый', hex: '#F97316' },
  { name: 'Жёлтый', hex: '#fae829' },
  { name: 'Зелёный', hex: '#22C55E' },
  { name: 'Синий', hex: '#3B82F6' },
  { name: 'Фиолетовый', hex: '#A855F7' },
];

interface DashboardProps {
  recipe: Recipe;
  liters: number;
  onLitersChange: (liters: number) => void;
  vacuumState: VacuumationState;
  remaining: number;
  elapsed: number;
  progress: number;
  durationMinutes: number;
  onStartVacuum: (duration: number, color: PaintColor) => void;
  onPauseVacuum: () => void;
  onResumeVacuum: () => void;
  onStopVacuum: () => void;
}

export function Dashboard({
  recipe,
  liters,
  onLitersChange,
  vacuumState,
  remaining,
  elapsed,
  progress,
  durationMinutes,
  onStartVacuum,
  onPauseVacuum,
  onResumeVacuum,
  onStopVacuum,
}: DashboardProps) {
  const [inputValue, setInputValue] = useState(String(liters));
  const [inputError, setInputError] = useState('');

  // Modals
  const [showColorModal, setShowColorModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  // Fullscreen states
  const [calcFullscreen, setCalcFullscreen] = useState(false);
  const [vacuumFullscreen, setVacuumFullscreen] = useState(false);

  // Color input state
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('');

  const ingredients = calculateIngredients(liters, recipe);

  const handleLitersChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!val || isNaN(num)) {
      setInputError('Введите значение');
      return;
    }
    if (num <= 0) {
      setInputError('Значение должно быть больше 0');
      return;
    }
    setInputError('');
    onLitersChange(num);
  };

  const handleStartClick = () => {
    if (vacuumState.status === 'idle' || vacuumState.status === 'stopped' || vacuumState.status === 'completed') {
      setShowColorModal(true);
    }
  };

  const handleConfirmStart = () => {
    if (!colorName.trim()) return; // Validation check
    setShowColorModal(false);
    onStartVacuum(durationMinutes, { name: colorName, hex: colorHex });
    setColorName('');
    setColorHex('');
  };

  const handleCancelStart = () => {
    setShowColorModal(false);
    setColorName('');
    setColorHex('');
  };

  const handleStopClick = () => {
    setShowStopModal(true);
  };

  const handleConfirmStop = () => {
    setShowStopModal(false);
    onStopVacuum();
  };

  const handleCancelStop = () => {
    setShowStopModal(false);
  };

  const status = vacuumState.status;

  const renderVacuumContent = (isFullscreen: boolean) => (
    <>
      <div className={styles['card-header']}>
        <h3 className={styles['card-title']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Вакумация
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`badge ${status === 'idle' ? 'badge-idle' :
            status === 'running' ? 'badge-running' :
              status === 'paused' ? 'badge-paused' :
                status === 'stopped' ? 'badge-stopped' : 'badge-completed'
            }`}>
            <span className="pulse-dot" style={{ display: status === 'running' ? 'block' : 'none' }} />
            {status === 'idle' ? 'Ожидание' :
              status === 'running' ? 'В процессе' :
                status === 'paused' ? 'Приостановлено' :
                  status === 'stopped' ? 'Остановлено' : 'Завершено'}
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setVacuumFullscreen(!isFullscreen)}
            title={isFullscreen ? "Свернуть" : "Развернуть"}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`${styles['vacuum-card-inner']} ${isFullscreen ? styles['fullscreen-inner'] : ''}`}>
        <VacuumTimer
          status={status}
          remaining={remaining}
          elapsed={elapsed}
          progress={progress}
          durationMinutes={vacuumState.durationMinutes || durationMinutes}
          color={vacuumState.color}
          liters={vacuumState.volumeLiters || liters}
        />

        <div className={styles['vacuum-actions']}>
          {status === 'idle' || status === 'completed' || status === 'stopped' ? (
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleStartClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {status === 'idle' ? 'Запустить вакумацию' : 'Запустить новую вакумацию'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {status === 'running' ? (
                <button
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1, backgroundColor: 'var(--warning-light)', borderColor: 'var(--warning)', color: 'var(--warning)' }}
                  onClick={onPauseVacuum}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v-6m4 6v-6" />
                  </svg>
                  Пауза
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-lg"
                  style={{ flex: 1, backgroundColor: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)' }}
                  onClick={onResumeVacuum}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Продолжить
                </button>
              )}

              <button
                className="btn btn-secondary btn-lg"
                style={{ flex: 1, backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={handleStopClick}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
                Стоп
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* Volume card */}
        <div className={`card ${styles['volume-card']}`}>
          <div className={styles['card-header']}>
            <h3 className={styles['card-title']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
              Объём производства
            </h3>
          </div>

          <div className={styles['volume-display']}>
            <span className={styles['volume-number']}>{liters > 0 ? liters : '—'}</span>
            <span className={styles['volume-unit']}>л</span>
          </div>

          <div className={styles['volume-input-row']}>
            <div style={{ flex: 1 }}>
              <label className="label" htmlFor="liters-input">Количество литров</label>
              <input
                id="liters-input"
                type="number"
                className={`input ${inputError ? 'input-error' : ''}`}
                style={{ maxWidth: 180 }}
                value={inputValue}
                onChange={(e) => handleLitersChange(e.target.value)}
                min="0.1"
                step="1"
                placeholder="Например: 100"
              />
              {inputError && <div className="error-text">{inputError}</div>}
            </div>
          </div>
        </div>

        {/* Ingredients card */}
        <div className={`card ${styles['ingredients-card']}`}>
          <div className={styles['card-header']}>
            <h3 className={styles['card-title']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
              </svg>
              Состав компонентов
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {liters > 0 && (
                <span className={styles['card-badge']}>для {liters} л</span>
              )}
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setCalcFullscreen(true)}
                title="Развернуть"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>
          <IngredientsTable ingredients={ingredients} liters={liters} />
        </div>

        {/* Vacuum card */}
        <div className={`card ${styles['vacuum-card']}`}>
          {renderVacuumContent(false)}
        </div>
      </div>

      {/* Fullscreen Overlays */}
      {calcFullscreen && (
        <div className={styles.fullscreen}>
          <div className={styles['fullscreen-card']}>
            <div className={styles['card-header']}>
              <h3 className={styles['card-title']} style={{ fontSize: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
                Расчёт компонентов
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className={styles['card-badge']} style={{ fontSize: '1rem', padding: '6px 16px' }}>Объём: {liters} л</span>
                <button className="btn btn-secondary" onClick={() => setCalcFullscreen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Свернуть
                </button>
              </div>
            </div>
            <div className={styles['fullscreen-content']}>
              <IngredientsTable ingredients={ingredients} liters={liters} isFullscreen={true} />
            </div>
          </div>
        </div>
      )}

      {vacuumFullscreen && (
        <div className={styles.fullscreen}>
          <div className={styles['fullscreen-card']} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 1000 }}>
              {renderVacuumContent(true)}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showColorModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Новая вакумация</h3>
            <p className={styles.modalSubtitle}>Пожалуйста, выберите или укажите цвет краски перед запуском.</p>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Быстрый выбор</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.hex}
                    type="button"
                    className={styles['color-preset-btn']}
                    onClick={() => {
                      setColorName(preset.name);
                      setColorHex(preset.hex);
                    }}
                    style={{
                      background: preset.hex,
                      border: preset.hex === '#FFFFFF' ? '1px solid var(--border)' : '1px solid transparent',
                      boxShadow: colorHex === preset.hex ? `0 0 0 2px var(--surface), 0 0 0 4px var(--accent)` : 'none'
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Цвет краски</label>
              <input
                type="text"
                className="input"
                placeholder="Например: Красный или RAL 3020"
                value={colorName}
                onChange={e => setColorName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">HEX-код (необязательно)</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="color"
                  style={{ width: 38, height: 38, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  value={colorHex || '#000000'}
                  onChange={e => setColorHex(e.target.value)}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="#E53935"
                  value={colorHex}
                  onChange={e => setColorHex(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={handleCancelStart}>Отмена</button>
              <button className="btn btn-primary" onClick={handleConfirmStart} disabled={!colorName.trim()}>Начать вакумацию</button>
            </div>
          </div>
        </div>
      )}

      {showStopModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Остановить вакумацию?</h3>
            <p className={styles.modalSubtitle}>Текущий процесс будет остановлен. Продолжить?</p>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={handleCancelStop}>Отмена</button>
              <button className="btn btn-danger" onClick={handleConfirmStop}>Остановить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
