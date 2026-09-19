import { useState, useCallback } from 'react';
import type { Recipe } from '../types';
import { DEFAULT_RECIPE } from '../utils';

const RECIPE_KEY = 'kampaunt_recipe';

function loadRecipe(): Recipe {
  try {
    const raw = localStorage.getItem(RECIPE_KEY);
    if (raw) return JSON.parse(raw) as Recipe;
  } catch {}
  return DEFAULT_RECIPE;
}

export function useRecipe() {
  const [recipe, setRecipe] = useState<Recipe>(loadRecipe);

  const updateRecipe = useCallback((updated: Recipe) => {
    setRecipe(updated);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(updated));
  }, []);

  const resetRecipe = useCallback(() => {
    setRecipe(DEFAULT_RECIPE);
    localStorage.setItem(RECIPE_KEY, JSON.stringify(DEFAULT_RECIPE));
  }, []);

  return { recipe, updateRecipe, resetRecipe };
}
