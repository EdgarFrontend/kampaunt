import { useState, useEffect } from 'react';
import styles from './Configuration.module.css';
import { DEFAULT_RECIPE } from '../../../utils';
import type { Recipe, Component } from '../../../types';

interface ConfigurationProps {
  recipe: Recipe;
  durationMinutes: number;
  onUpdateRecipe: (recipe: Recipe) => void;
  onUpdateDuration: (minutes: number) => void;
  onReset: () => void;
}

const PRESETS = [30, 45, 60, 90, 120];

interface ComponentError {
  id: string;
  message: string;
}

export function Configuration({
  recipe,
  durationMinutes,
  onUpdateRecipe,
  onUpdateDuration,
  onReset,
}: ConfigurationProps) {
  const [localComponents, setLocalComponents] = useState<Component[]>(recipe.components);
  const [errors, setErrors] = useState<ComponentError[]>([]);
  const [localDuration, setLocalDuration] = useState(durationMinutes);
  const [durationError, setDurationError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalComponents(recipe.components);
  }, [recipe.components]);

  const getError = (id: string) => errors.find((e) => e.id === id)?.message ?? '';

  const handleComponentChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setLocalComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, amountPerLiter: isNaN(num) ? 0 : num } : c))
    );

    if (!value || isNaN(num) || num <= 0) {
      setErrors((prev) => {
        const filtered = prev.filter((e) => e.id !== id);
        return [...filtered, { id, message: 'Значение должно быть больше 0' }];
      });
    } else {
      setErrors((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleDurationChange = (value: string) => {
    const num = parseInt(value, 10);
    setLocalDuration(isNaN(num) ? 0 : num);
    if (!value || isNaN(num) || num <= 0) {
      setDurationError('Значение должно быть больше 0');
    } else {
      setDurationError('');
    }
  };

  const handleSave = () => {
    if (errors.length > 0 || durationError) return;
    onUpdateRecipe({ ...recipe, components: localComponents });
    onUpdateDuration(localDuration);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setLocalComponents(DEFAULT_RECIPE.components);
    setErrors([]);
    setLocalDuration(60);
    setDurationError('');
    onReset();
  };

  const handleCancel = () => {
    setLocalComponents(recipe.components);
    setLocalDuration(durationMinutes);
    setErrors([]);
    setDurationError('');
  };

  const hasChanges =
    JSON.stringify(localComponents) !== JSON.stringify(recipe.components) ||
    localDuration !== durationMinutes;

  return (
    <div className={styles.page}>
      {/* Recipe section */}
      <div style={{ marginBottom: 32 }}>
        <div className={styles['section-title']}>Конфигурация рецепта</div>
        <div className={styles['section-desc']}>
          Настройте норму расхода каждого компонента на 1 литр готовой краски
        </div>

        <div className={styles['components-grid']}>
          {localComponents.map((component) => {
            const err = getError(component.id);
            return (
              <div key={component.id} className={styles['component-card']}>
                <div className={styles['component-header']}>
                  <span className={styles['component-name']}>{component.name}</span>
                  <span className={`${styles['component-unit-tag']} ${
                    component.unit === 'кг' ? styles['unit-kg'] : styles['unit-g']
                  }`}>
                    {component.unit}
                  </span>
                </div>

                <label className="label">Количество на 1 литр</label>
                <div className={styles['component-input-row']}>
                  <input
                    type="number"
                    className={`input ${err ? 'input-error' : ''}`}
                    value={component.amountPerLiter}
                    onChange={(e) => handleComponentChange(component.id, e.target.value)}
                    min="0.001"
                    step="0.001"
                  />
                  <span className={styles['unit-label']}>{component.unit}</span>
                </div>
                {err && <div className={styles['error-msg']}>{err}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vacuum settings section */}
      <div className={`card ${styles['vacuum-section']}`}>
        <h3 style={{ marginBottom: 4 }}>Параметры вакумации</h3>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Продолжительность процесса вакумации
        </div>

        <label className="label">Продолжительность (минуты)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <input
            type="number"
            className={`input ${durationError ? 'input-error' : ''}`}
            style={{ maxWidth: 160 }}
            value={localDuration}
            onChange={(e) => handleDurationChange(e.target.value)}
            min="1"
            step="1"
          />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>мин</span>
        </div>
        {durationError && <div className="error-text">{durationError}</div>}

        <div className={styles['preset-chips']}>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              className={`${styles.chip} ${localDuration === preset ? styles.active : ''}`}
              onClick={() => { setLocalDuration(preset); setDurationError(''); }}
            >
              {preset} мин
            </button>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className={styles['action-bar']}>
        {saved ? (
          <div className={styles['saved-msg']}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Конфигурация сохранена
          </div>
        ) : (
          <span className={styles['action-bar-label']}>
            {hasChanges ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
          </span>
        )}

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleReset}
        >
          По умолчанию
        </button>

        {hasChanges && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCancel}
          >
            Отмена
          </button>
        )}

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={errors.length > 0 || !!durationError || !hasChanges}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
