import { useState, useCallback, useEffect } from 'react';
import type { Recipe } from '../types';
import { DEFAULT_RECIPE } from '../utils';

interface RemoteConfig {
  recipe?: Recipe;
  durationMinutes?: number;
}

async function fetchConfig(): Promise<RemoteConfig> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

async function saveConfigKey(key: string, value: unknown) {
  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

// Legacy localStorage fallback keys
const RECIPE_KEY = 'kampaunt_recipe';
const DURATION_KEY = 'kampaunt_vacuum_duration';

function loadLocalRecipe(): Recipe {
  try {
    const raw = localStorage.getItem(RECIPE_KEY);
    if (raw) return JSON.parse(raw) as Recipe;
  } catch {}
  return DEFAULT_RECIPE;
}

function loadLocalDuration(): number {
  try {
    const raw = localStorage.getItem(DURATION_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {}
  return 60;
}

export function useConfig() {
  const [recipe, setRecipe] = useState<Recipe>(loadLocalRecipe);
  const [durationMinutes, setDurationMinutes] = useState<number>(loadLocalDuration);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Prisma on mount
  useEffect(() => {
    setIsLoading(true);
    fetchConfig()
      .then((config) => {
        if (config.recipe) setRecipe(config.recipe);
        if (config.durationMinutes) setDurationMinutes(config.durationMinutes);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateRecipe = useCallback((updated: Recipe) => {
    setRecipe(updated);
    saveConfigKey('recipe', updated);
  }, []);

  const updateDuration = useCallback((minutes: number) => {
    setDurationMinutes(minutes);
    saveConfigKey('durationMinutes', minutes);
  }, []);

  const resetConfig = useCallback(() => {
    setRecipe(DEFAULT_RECIPE);
    setDurationMinutes(60);
    saveConfigKey('recipe', DEFAULT_RECIPE);
    saveConfigKey('durationMinutes', 60);
  }, []);

  return { recipe, durationMinutes, updateRecipe, updateDuration, resetConfig, isLoading };
}
