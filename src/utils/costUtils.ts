import { IngredientItem, Recipe, RecipeIngredient } from '../types';

/**
 * Calculates the cost for a single ingredient in a recipe.
 * If pricePerUnit is overridden in RecipeIngredient, it takes precedence;
 * otherwise, it looks up pricePerUnit from the master ingredient item list.
 */
export function calculateIngredientCost(
  ing: RecipeIngredient,
  allIngredients: IngredientItem[] = []
): number {
  const price =
    ing.pricePerUnit ??
    allIngredients.find((item) => item.id === ing.ingredientId || item.name === ing.ingredientName)?.pricePerUnit ??
    0;
  return Math.round(ing.amount * price);
}

/**
 * Calculates total cost of all ingredients in a recipe.
 */
export function calculateRecipeTotalCost(
  recipe: Recipe,
  allIngredients: IngredientItem[] = []
): number {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;
  return recipe.ingredients.reduce(
    (sum, ing) => sum + calculateIngredientCost(ing, allIngredients),
    0
  );
}

/**
 * Formats a number to Vietnamese Dong currency format (e.g. 35.000 đ)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}
