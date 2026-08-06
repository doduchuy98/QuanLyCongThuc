export interface IngredientItem {
  id: string;
  name: string;
  unit: string; // e.g. "gram", "ml", "quả", "muỗng"
  pricePerUnit?: number; // Price in VNĐ per unit (e.g. 250 VNĐ / gram)
  imageUrl?: string;
  note?: string;
  isActive: boolean;
  category?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
  pricePerUnit?: number; // Optional override price in VNĐ per unit
  note?: string; // e.g. "bằm nhỏ", "thái mỏng", "bỏ hạt"
}

export interface CookingStep {
  stepNumber: number;
  title: string;
  description: string;
  isDone?: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // lucide icon name
  bgColor: string; // hex or tailwind class
  recipeCount?: number;
  type?: 'recipe' | 'ingredient' | 'unit';
  itemCount?: number;
}

export interface Recipe {
  id: string;
  title: string;
  category: string; // Category name
  imageUrl: string;
  description: string;
  isActive: boolean;
  updatedAt: string; // DD/MM/YYYY
  rating?: number; // e.g. 4.9
  portionLabel: string; // e.g. "1 phần", "100 gram", "1 lít"
  ingredients: RecipeIngredient[];
  steps: CookingStep[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
}

export interface UnitConversionRule {
  fromUnit: string;
  toUnit: string;
  factor: number; // toUnit = amount * factor
  note?: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientId?: string;
  name: string;
  amount: number;
  unit: string;
  category?: string;
  pricePerUnit?: number;
  isBought: boolean;
  recipeSource?: string;
  note?: string;
  createdAt: string;
}

export type ActiveTab = 'home' | 'recipes' | 'ingredients' | 'categories' | 'browser' | 'settings';

export type AppMode = 'kitchen' | 'finance';

export interface ExpenseItem {
  id: string;
  type: 'expense' | 'income' | 'loan';
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod?: 'cash' | 'transfer' | 'card';
  createdAt: string;
  loanType?: 'borrow' | 'lend'; // 'borrow' = đi vay, 'lend' = cho vay
  isPaid?: boolean; // true = đã trả khoản vay / tất toán
  isRepayment?: boolean; // true = đợt trả trước / thanh toán bớt
  personName?: string; // Tên người vay / cho vay
}

export interface AppNotification {
  id: string;
  type: 'add' | 'edit' | 'delete' | 'system' | 'shopping' | 'expense';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  recipeId?: string;
}

export interface FinanceUser {
  id: string;
  username: string;
  name: string;
  pin: string;
  avatarBg?: string;
  createdAt: string;
}


