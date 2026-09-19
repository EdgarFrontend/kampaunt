import { useState } from 'react';
import styles from './Calculator.module.css';
import { IngredientsTable } from '../../../components/calculator/IngredientsTable';
import { calculateIngredients } from '../../../utils';
import type { Recipe } from '../../../types';

interface CalculatorProps {
  recipe: Recipe;
  liters: number;
  onLitersChange: (liters: number) => void;
}

export function Calculator({ recipe, liters, onLitersChange }: CalculatorProps) {
  const [inputValue, setInputValue] = useState(String(liters));
  const [inputError, setInputError] = useState('');
  const [calcFullscreen, setCalcFullscreen] = useState(false);

  const ingredients = calculateIngredients(liters, recipe);

  const handleChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!val || isNaN(num)) {
      setInputError('Введите значение');
      return;
    }
    if (num <= 0) {
      setInputError('Объём должен быть больше 0');
      return;
    }
    setInputError('');
    onLitersChange(num);
  };

  return (
    <div className={styles.page}>
      <div className={`card ${styles['hero-card']}`}>
        <h2 style={{ marginBottom: 20 }}>Расчёт производства</h2>

        <div className={styles['hero-input-area']}>
          <div className={styles['volume-field']}>
            <label className="label" htmlFor="calc-liters">Объём краски</label>
            <input
              id="calc-liters"
              type="number"
              className={`input input-lg ${inputError ? 'input-error' : ''}`}
              style={{ width: 180 }}
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              min="0.1"
              step="1"
              placeholder="100"
            />
            {inputError && <div className="error-text">{inputError}</div>}
          </div>

          <div style={{ paddingBottom: inputError ? 20 : 0 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>единица измерения</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1.5 }}>литров</div>
          </div>

          {liters > 0 && !inputError && (
            <div style={{ paddingBottom: inputError ? 20 : 0, marginLeft: 'auto' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Итого</div>
              <div className={styles['volume-number']}>{liters} л</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className={styles['card-title']}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Состав компонентов
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={styles['card-badge']}>
              {recipe.components.length} компонентов
            </span>
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

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          💡 Формула расчёта: <strong style={{ color: 'var(--text-secondary)' }}>количество компонента = норма на 1 л × объём в литрах</strong>
        </div>
      </div>

      {calcFullscreen && (
        <div className={styles.fullscreen}>
          <div className={styles['fullscreen-card']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
    </div>
  );
}
