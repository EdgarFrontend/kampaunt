import type { Component, Recipe, CalculatedIngredient } from '../types';

export const DEFAULT_RECIPE: Recipe = {
  components: [
    { id: 'ppkh', name: 'ППХ', amountPerLiter: 0.5, unit: 'кг' },
    { id: 'dinf', name: 'Динф', amountPerLiter: 0.5, unit: 'кг' },
    { id: 'antioxidant', name: 'Антиоксидант(Порох)', amountPerLiter: 10, unit: 'г' },
    { id: 'cykt', name: 'Цинк', amountPerLiter: 15, unit: 'г' },
    { id: 'oil', name: 'Масло', amountPerLiter: 10, unit: 'г' },
    { id: 'dye', name: 'Краситель', amountPerLiter: 20, unit: 'г' },
  ],
};

export const DEFAULT_VACUUM_DURATION = 60;

export function calculateIngredients(
  liters: number,
  recipe: Recipe
): CalculatedIngredient[] {
  if (liters <= 0) return [];
  return recipe.components.map((component: Component) => ({
    component,
    required: component.amountPerLiter * liters,
  }));
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} сек прошло`;
  if (seconds === 0) return `${minutes} мин прошло`;
  return `${minutes} мин ${seconds} сек прошло`;
}

export function formatTimeRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} секунд`;
  if (seconds === 0) return `${minutes} минут`;
  return `${minutes} мин ${seconds} сек`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTimeStamp(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
