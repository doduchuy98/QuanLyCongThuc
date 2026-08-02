import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Search, Check, Calculator, Sparkles, ChefHat } from 'lucide-react';
import { Recipe, IngredientItem, ShoppingListItem } from '../types';
import { formatCurrency } from '../utils/costUtils';

interface BatchAddShoppingModalProps {
  isOpen: boolean;
  recipes: Recipe[];
  allIngredients: IngredientItem[];
  onClose: () => void;
  onAddItemsToShoppingList: (items: Omit<ShoppingListItem, 'id' | 'createdAt'>[]) => void;
}

interface SelectedRecipeConfig {
  recipe: Recipe;
  servings: number;
}

export const BatchAddShoppingModal: React.FC<BatchAddShoppingModalProps> = ({
  isOpen,
  recipes,
  allIngredients,
  onClose,
  onAddItemsToShoppingList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<{ [recipeId: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');

  // Helper to extract base portion count from portionLabel e.g. "2 phần" => 2
  const getBaseServings = (portionLabel?: string): number => {
    if (!portionLabel) return 1;
    const match = portionLabel.match(/(\d+(\.\d+)?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val > 0) return val;
    }
    return 1;
  };

  const handleToggleRecipe = (recipe: Recipe) => {
    setSelectedRecipes((prev) => {
      const next = { ...prev };
      if (next[recipe.id] !== undefined) {
        delete next[recipe.id];
      } else {
        next[recipe.id] = getBaseServings(recipe.portionLabel);
      }
      return next;
    });
  };

  const handleUpdateServings = (recipeId: string, delta: number) => {
    setSelectedRecipes((prev) => {
      const current = prev[recipeId] || 1;
      const updated = Math.max(0.5, current + delta);
      return { ...prev, [recipeId]: updated };
    });
  };

  // Aggregation of ingredients from selected recipes
  const aggregatedIngredients = useMemo(() => {
    const map: {
      [key: string]: {
        name: string;
        amount: number;
        unit: string;
        ingredientId?: string;
        category?: string;
        pricePerUnit?: number;
        sources: string[];
      };
    } = {};

    Object.entries(selectedRecipes).forEach(([recipeId, rawServings]) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (!recipe) return;

      const servings = Number(rawServings);
      const baseServings = getBaseServings(recipe.portionLabel);
      const multiplier = servings / baseServings;

      recipe.ingredients.forEach((ing) => {
        // Find matching global ingredient for category & price info
        const matchingGlobalIng = allIngredients.find(
          (gi) => gi.id === ing.ingredientId || gi.name.toLowerCase() === ing.ingredientName.toLowerCase()
        );

        const normalizedKey = `${ing.ingredientName.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;

        const addedAmount = (ing.amount || 0) * multiplier;
        const sourceLabel = `${recipe.title} (${servings} phần)`;

        if (!map[normalizedKey]) {
          map[normalizedKey] = {
            name: ing.ingredientName,
            amount: addedAmount,
            unit: ing.unit,
            ingredientId: ing.ingredientId || matchingGlobalIng?.id,
            category: matchingGlobalIng?.category || 'Rau củ & Thực phẩm',
            pricePerUnit: ing.pricePerUnit ?? matchingGlobalIng?.pricePerUnit ?? 0,
            sources: [sourceLabel],
          };
        } else {
          map[normalizedKey].amount += addedAmount;
          if (!map[normalizedKey].sources.includes(sourceLabel)) {
            map[normalizedKey].sources.push(sourceLabel);
          }
        }
      });
    });

    return Object.values(map);
  }, [selectedRecipes, recipes, allIngredients]);

  // Total estimated price
  const totalEstimatedCost = useMemo(() => {
    return aggregatedIngredients.reduce((sum, item) => {
      const cost = (item.pricePerUnit || 0) * item.amount;
      return sum + cost;
    }, 0);
  }, [aggregatedIngredients]);

  const selectedCount = Object.keys(selectedRecipes).length;

  const handleConfirmAdd = () => {
    if (aggregatedIngredients.length === 0) return;

    const itemsToAdd: Omit<ShoppingListItem, 'id' | 'createdAt'>[] = aggregatedIngredients.map((item) => ({
      ingredientId: item.ingredientId,
      name: item.name,
      amount: Math.round(item.amount * 10) / 10,
      unit: item.unit,
      category: item.category,
      pricePerUnit: item.pricePerUnit,
      isBought: false,
      recipeSource: item.sources.join(', '),
    }));

    onAddItemsToShoppingList(itemsToAdd);
    onClose();
    // Reset state
    setSelectedRecipes({});
    setActiveTab('select');
  };

  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-xl bg-white rounded-[28px] shadow-2xl border border-pink-100 flex flex-col max-h-[88vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-pink-100/80 bg-gradient-to-r from-pink-50/50 via-white to-sky-50/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF8FB8] text-white flex items-center justify-center shadow-md shadow-pink-200">
                  <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                    Gom Nguyên Liệu Đi Chợ 🛒
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Chọn các món ăn sẽ nấu để tự động tạo danh sách đi chợ
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs Header */}
            <div className="flex border-b border-slate-100 px-4 bg-slate-50/50 text-xs font-bold">
              <button
                onClick={() => setActiveTab('select')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'select'
                    ? 'border-[#FF8FB8] text-[#FF8FB8]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>1. Chọn công thức món</span>
                {selectedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-extrabold">
                    {selectedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                disabled={selectedCount === 0}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-[#FF8FB8] text-[#FF8FB8]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 disabled:opacity-40'
                }`}
              >
                <span>2. Xem tổng hợp ({aggregatedIngredients.length} loại)</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {activeTab === 'select' ? (
                <>
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm món ăn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#FF8FB8]"
                    />
                  </div>

                  {/* Recipe Grid */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {filteredRecipes.map((recipe) => {
                      const isSelected = selectedRecipes[recipe.id] !== undefined;
                      const servings = selectedRecipes[recipe.id] || getBaseServings(recipe.portionLabel);

                      return (
                        <div
                          key={recipe.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-pink-50/60 border-pink-300 shadow-2xs'
                              : 'bg-white border-slate-100 hover:border-pink-200'
                          }`}
                        >
                          <div
                            onClick={() => handleToggleRecipe(recipe)}
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#FF8FB8] border-[#FF8FB8] text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                            </div>

                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                              {recipe.imageUrl ? (
                                <img
                                  src={recipe.imageUrl}
                                  alt={recipe.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ChefHat className="w-5 h-5 text-pink-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-xs truncate">
                                {recipe.title}
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                {recipe.category} • {recipe.ingredients.length} nguyên liệu
                              </p>
                            </div>
                          </div>

                          {/* Servings stepper if selected */}
                          {isSelected && (
                            <div className="flex items-center gap-1.5 bg-white border border-pink-200 p-1 rounded-xl shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateServings(recipe.id, -0.5)}
                                className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-slate-700 min-w-[42px] text-center">
                                {servings} khẩu phần
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateServings(recipe.id, 0.5)}
                                className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Preview Tab */
                <div className="space-y-3">
                  <div className="p-3 bg-pink-50/80 rounded-2xl border border-pink-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tóm tắt số món nấu:</span>
                    <span className="font-black text-pink-600">{selectedCount} món ăn</span>
                  </div>

                  {/* List of aggregated ingredients */}
                  <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                    {aggregatedIngredients.map((item, index) => {
                      const estimatedCost = (item.pricePerUnit || 0) * item.amount;
                      return (
                        <div
                          key={index}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{item.name}</span>
                              <span className="text-[10px] text-pink-600 font-extrabold bg-pink-100 px-1.5 py-0.2 rounded-md">
                                {item.amount} {item.unit}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                              Từ món: {item.sources.join(', ')}
                            </div>
                          </div>

                          {estimatedCost > 0 && (
                            <div className="text-right flex-shrink-0">
                              <span className="text-[11px] font-extrabold text-slate-700">
                                ~{formatCurrency(estimatedCost)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-500 font-bold">Dự kiến chi phí:</p>
                <p className="text-sm font-black text-emerald-600">
                  {totalEstimatedCost > 0 ? formatCurrency(totalEstimatedCost) : 'Chưa có giá vốn'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeTab === 'select' && selectedCount > 0 ? (
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all flex items-center gap-1.5"
                  >
                    <span>Xem tóm tắt ({aggregatedIngredients.length})</span>
                  </button>
                ) : null}

                <button
                  onClick={handleConfirmAdd}
                  disabled={aggregatedIngredients.length === 0}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Thêm {aggregatedIngredients.length} món vào danh sách</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
