import { IngredientItem, Recipe, RecipeIngredient } from '../types';

/**
 * Calculates the unit conversion factor from recipeUnit to masterUnit.
 * Returns factor such that: (amountInMasterUnit = recipeAmount * factor)
 */
export function getUnitConversionFactor(
  recipeUnit: string,
  masterUnit: string
): { factor: number; note?: string } {
  if (!recipeUnit || !masterUnit) return { factor: 1 };

  const r = recipeUnit.trim().toLowerCase();
  const m = masterUnit.trim().toLowerCase();

  if (r === m) return { factor: 1 };

  // Helper matching functions for common unit aliases
  const isKg = (u: string) => ['kg', 'kilogram', 'kilo', '1kg'].includes(u);
  const isGram = (u: string) => ['g', 'gram', 'gr', 'găm'].includes(u);
  const isMg = (u: string) => ['mg', 'milligram'].includes(u);

  const isLit = (u: string) => ['l', 'lit', 'lít', '1l', '1lít'].includes(u);
  const isMl = (u: string) => ['ml', 'millilit', 'cc'].includes(u);

  const isTsp = (u: string) => ['tsp', 'muỗng cà phê', 'thìa cà phê', 'mcp'].includes(u);
  const isTbsp = (u: string) => ['tbsp', 'muỗng canh', 'thìa canh', 'mc'].includes(u);

  // Weight conversions
  if (isKg(r) && isKg(m)) return { factor: 1 };
  if (isGram(r) && isGram(m)) return { factor: 1 };

  if (isGram(r) && isKg(m)) return { factor: 0.001, note: '1 gram = 0.001 kg' };
  if (isKg(r) && isGram(m)) return { factor: 1000, note: '1 kg = 1.000 gram' };
  if (isMg(r) && isGram(m)) return { factor: 0.001, note: '1 mg = 0.001 gram' };
  if (isGram(r) && isMg(m)) return { factor: 1000, note: '1 gram = 1.000 mg' };
  if (isMg(r) && isKg(m)) return { factor: 0.000001, note: '1 mg = 0.000001 kg' };
  if (isKg(r) && isMg(m)) return { factor: 1000000, note: '1 kg = 1.000.000 mg' };

  // Volume conversions
  if (isMl(r) && isLit(m)) return { factor: 0.001, note: '1 ml = 0.001 lít' };
  if (isLit(r) && isMl(m)) return { factor: 1000, note: '1 lít = 1.000 ml' };

  // Spoons -> Gram/Ml
  if (isTsp(r) && (isGram(m) || isMl(m))) return { factor: 5, note: '1 muỗng cà phê ≈ 5g/ml' };
  if (isTbsp(r) && (isGram(m) || isMl(m))) return { factor: 15, note: '1 muỗng canh ≈ 15g/ml' };
  if ((isGram(r) || isMl(r)) && isTsp(m)) return { factor: 0.2, note: '5g/ml ≈ 1 muỗng cà phê' };
  if ((isGram(r) || isMl(r)) && isTbsp(m)) return { factor: 1 / 15, note: '15g/ml ≈ 1 muỗng canh' };

  // Spoons -> Kg/Lít
  if (isTsp(r) && (isKg(m) || isLit(m))) return { factor: 0.005, note: '1 muỗng cà phê ≈ 0.005 kg/lít' };
  if (isTbsp(r) && (isKg(m) || isLit(m))) return { factor: 0.015, note: '1 muỗng canh ≈ 0.015 kg/lít' };

  return { factor: 1 };
}

/**
 * Returns detailed calculation info for a single recipe ingredient, including unit conversion details.
 */
export function getIngredientCostDetails(
  ing: RecipeIngredient,
  allIngredients: IngredientItem[] = []
): {
  cost: number;
  masterPrice: number;
  masterUnit: string;
  recipeUnit: string;
  factor: number;
  convertedAmount: number;
  conversionNote?: string;
  isConverted: boolean;
} {
  const masterItem = allIngredients.find(
    (item) => item.id === ing.ingredientId || item.name === ing.ingredientName
  );

  const masterPrice = ing.pricePerUnit ?? masterItem?.pricePerUnit ?? 0;
  const masterUnit = masterItem?.unit || ing.unit;
  const recipeUnit = ing.unit || masterUnit;

  const { factor, note } = getUnitConversionFactor(recipeUnit, masterUnit);
  const convertedAmount = ing.amount * factor;
  const cost = Math.round(convertedAmount * masterPrice);

  const isConverted = factor !== 1 && recipeUnit.trim().toLowerCase() !== masterUnit.trim().toLowerCase();

  return {
    cost,
    masterPrice,
    masterUnit,
    recipeUnit,
    factor,
    convertedAmount,
    conversionNote: note,
    isConverted,
  };
}

/**
 * Calculates the cost for a single ingredient in a recipe.
 * Automatically performs unit conversions if recipe unit differs from master unit (e.g. 100 gram -> 0.1 kg).
 */
export function calculateIngredientCost(
  ing: RecipeIngredient,
  allIngredients: IngredientItem[] = []
): number {
  return getIngredientCostDetails(ing, allIngredients).cost;
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

