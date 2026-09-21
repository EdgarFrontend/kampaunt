import styles from './IngredientsTable.module.css';
import type { CalculatedIngredient } from '../../types';

interface IngredientsTableProps {
  ingredients: CalculatedIngredient[];
  liters: number;
  isFullscreen?: boolean;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString('ru-RU');
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 3 });
}

/** Приводим к граммам для вычисления доли от общей массы */
function toGrams(amount: number, unit: string): number {
  return unit === 'кг' ? amount * 1000 : amount;
}

export function IngredientsTable({ ingredients, liters, isFullscreen }: IngredientsTableProps) {
  if (liters <= 0 || ingredients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
        Укажите объём производства для расчёта компонентов
      </div>
    );
  }

  // Основная масса - это сумма базовых компонентов (в кг)
  const mainMassGrams = ingredients
    .filter(i => i.component.unit === 'кг')
    .reduce((sum, { component, required }) => sum + toGrams(required, component.unit), 0);
  
  // Если базовых компонентов нет, берем общую сумму как fallback
  const totalGrams = mainMassGrams > 0 ? mainMassGrams : ingredients.reduce(
    (sum, { component, required }) => sum + toGrams(required, component.unit),
    0
  );

  return (
    <div className={styles['table-wrapper']}>
      <table className={`${styles.table} ${isFullscreen ? styles['table-fullscreen'] : ''}`}>
        <thead>
          <tr>
            <th>Компонент</th>
            <th>На 1 л</th>
            <th className={styles.right}>Необходимо</th>
            <th>Ед.</th>
            <th className={styles['th-percent']}>%</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map(({ component, required }) => {
            const grams = toGrams(required, component.unit);
            const percent = totalGrams > 0 ? (grams / totalGrams) * 100 : 0;
            return (
              <tr key={component.id}>
                <td>
                  <span className={styles['component-name']}>{component.name}</span>
                </td>
                <td>
                  <span className={styles['per-liter']}>
                    {formatNumber(component.amountPerLiter)} {component.unit}
                  </span>
                </td>
                <td>
                  <span className={styles['required-value']}>{formatNumber(required)}</span>
                </td>
                <td>
                  <span className={`${styles['unit-badge']} ${component.unit === 'кг' ? styles['unit-kg'] : styles['unit-g']}`}>
                    {component.unit}
                  </span>
                </td>
                <td>
                  <span className={styles['percent-badge']}>
                    {percent.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
