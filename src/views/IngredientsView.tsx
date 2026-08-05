import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  Carrot,
  Trash2,
  Tag,
  ImageOff,
  Table,
  LayoutGrid,
  Edit2,
  Check,
  ChefHat,
  Sparkles,
  Save,
  DollarSign,
  Download
} from 'lucide-react';
import { IngredientItem, Category, Recipe } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';
import { matchesSearch } from '../utils/stringUtils';

interface IngredientsViewProps {
  ingredients: IngredientItem[];
  recipes?: Recipe[];
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onAddIngredient: () => void;
  onSelectIngredient: (ing: IngredientItem) => void;
  onDeleteIngredient: (ingId: string) => void;
  onUpdateIngredientPrice?: (ingId: string, newPrice: number | undefined) => void;
  onAddMissingIngredient?: (ing: IngredientItem) => void;
  onBatchAddMissingIngredients?: (ings: IngredientItem[]) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  recipes = [],
  categories = [],
  selectedCategory: externalCategory,
  onSelectCategory,
  isAdmin,
  onOpenAdminLogin,
  onAddIngredient,
  onSelectIngredient,
  onDeleteIngredient,
  onUpdateIngredientPrice,
  onBatchAddMissingIngredients,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Tất cả');
  const [internalCategory, setInternalCategory] = useState('Tất cả');
  const [ingToDelete, setIngToDelete] = useState<IngredientItem | null>(null);

  // Local state for editing prices directly in table rows
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const selectedCategory = externalCategory !== undefined ? externalCategory : internalCategory;

  const handleSetCategory = (catName: string) => {
    setInternalCategory(catName);
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
  };

  // Build a map of ingredient usage across all recipes
  // Map key: ingredient name (lowercase) -> array of recipe titles
  const recipeUsageMap: Record<string, { title: string; id: string; amount: number; unit: string }[]> = {};
  recipes.forEach((r) => {
    r.ingredients.forEach((ri) => {
      const key = ri.ingredientName.trim().toLowerCase();
      if (!recipeUsageMap[key]) {
        recipeUsageMap[key] = [];
      }
      if (!recipeUsageMap[key].some((item) => item.id === r.id)) {
        recipeUsageMap[key].push({
          title: r.title,
          id: r.id,
          amount: ri.amount,
          unit: ri.unit,
        });
      }
    });
  });

  // Find ingredients that are used in recipes but NOT in the master ingredients array yet
  const missingRecipeIngredients: IngredientItem[] = [];
  recipes.forEach((r) => {
    r.ingredients.forEach((ri) => {
      const cleanName = ri.ingredientName.trim();
      const existsInMaster = ingredients.some(
        (i) => i.name.trim().toLowerCase() === cleanName.toLowerCase()
      );
      const existsInMissing = missingRecipeIngredients.some(
        (i) => i.name.trim().toLowerCase() === cleanName.toLowerCase()
      );

      if (!existsInMaster && !existsInMissing) {
        missingRecipeIngredients.push({
          id: `ing-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName,
          unit: ri.unit || 'gram',
          category: 'Nguyên liệu công thức',
          pricePerUnit: ri.pricePerUnit,
          isActive: true,
          note: `Thêm tự động từ công thức: ${r.title}`,
        });
      }
    });
  });

  // Filter Categories
  const ingredientCatNamesFromObj = categories
    .filter((c) => c.type === 'ingredient')
    .map((c) => c.name);

  const ingredientCatNamesFromIngs = ingredients
    .map((i) => i.category)
    .filter((c): c is string => !!c);

  const filterCategories = [
    'Tất cả',
    ...Array.from(new Set([...ingredientCatNamesFromObj, ...ingredientCatNamesFromIngs])),
  ];

  const unitCatNames = categories.filter((c) => c.type === 'unit').map((c) => c.name);
  const ingredientUnits = ingredients.map((i) => i.unit).filter(Boolean);
  const availableUnits = ['Tất cả', ...Array.from(new Set([...unitCatNames, ...ingredientUnits]))];

  // Filter ingredients list
  const filtered = ingredients.filter((ing) => {
    const matchesQuery =
      matchesSearch(ing.name, searchQuery) ||
      matchesSearch(ing.category, searchQuery) ||
      matchesSearch(ing.note, searchQuery);
    const matchesUnit =
      selectedUnitFilter === 'Tất cả' || ing.unit === selectedUnitFilter;
    const matchesCategory =
      selectedCategory === 'Tất cả' || ing.category === selectedCategory;
    return matchesQuery && matchesUnit && matchesCategory;
  });

  const ingredientsWithPriceCount = ingredients.filter(
    (i) => i.pricePerUnit !== undefined && i.pricePerUnit > 0
  ).length;

  // Handle local price changes
  const handlePriceInputChange = (ingId: string, val: string) => {
    setEditingPrices((prev) => ({ ...prev, [ingId]: val }));
  };

  const handleSavePrice = (ingId: string, currentPrice?: number) => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
      return;
    }

    const rawVal = editingPrices[ingId];
    if (rawVal === undefined) return;

    const numVal = rawVal.trim() === '' ? undefined : Math.max(0, Number(rawVal));
    if (onUpdateIngredientPrice) {
      onUpdateIngredientPrice(ingId, numVal);
      setSavedSuccessId(ingId);
      setTimeout(() => setSavedSuccessId(null), 2000);
    }
  };

  const handleBatchImportMissing = () => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
      return;
    }
    if (missingRecipeIngredients.length > 0 && onBatchAddMissingIngredients) {
      onBatchAddMissingIngredients(missingRecipeIngredients);
      alert(`Đã thêm thành công ${missingRecipeIngredients.length} nguyên liệu từ công thức vào danh sách!`);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* Top Header & Dashboard Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-4 sm:p-5 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 border border-white/20">
                Bảng Tính Giá Vốn 📊
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight mt-1 text-white">
              Quản Lý Nguyên Liệu & Đơn Giá
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5 font-medium">
              Liệt kê danh sách nguyên liệu, cập nhật giá vốn &amp; đồng bộ từ công thức món ăn
            </p>
          </div>

          <button
            onClick={() => {
              if (isAdmin) {
                onAddIngredient();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="self-start sm:self-auto px-3.5 py-2 rounded-2xl bg-white text-emerald-800 font-extrabold text-xs shadow-sm hover:bg-emerald-50 transition-all flex items-center gap-1.5 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm nguyên liệu mới</span>
          </button>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/15 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
            <span className="block text-[10px] text-emerald-100 font-medium">Tổng nguyên liệu</span>
            <span className="font-extrabold text-sm text-white">{ingredients.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
            <span className="block text-[10px] text-emerald-100 font-medium">Đã nhập giá</span>
            <span className="font-extrabold text-sm text-emerald-200">
              {ingredientsWithPriceCount} / {ingredients.length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-2 rounded-xl text-center border border-white/10">
            <span className="block text-[10px] text-emerald-100 font-medium">Từ công thức</span>
            <span className="font-extrabold text-sm text-amber-200">
              {Object.keys(recipeUsageMap).length} loại
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner: Missing Recipe Ingredients Auto-Sync */}
      {missingRecipeIngredients.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 sm:mt-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Phát hiện {missingRecipeIngredients.length} nguyên liệu trong công thức chưa có trong bảng tính master!
              </h4>
              <p className="text-[11px] text-amber-800 font-medium">
                Tự động trích xuất nguyên liệu từ các bài công thức để quản lý giá dễ dàng hơn.
              </p>
            </div>
          </div>
          <button
            onClick={handleBatchImportMissing}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tất cả ({missingRecipeIngredients.length})</span>
          </button>
        </div>
      )}

      {/* Controls Bar: View Mode Switcher, Search, Unit Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nguyên liệu, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & View Mode Switcher */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              const nextIdx = (availableUnits.indexOf(selectedUnitFilter) + 1) % availableUnits.length;
              setSelectedUnitFilter(availableUnits[nextIdx]);
            }}
            className={`px-3 py-2 rounded-2xl border flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs ${
              selectedUnitFilter !== 'Tất cả'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{selectedUnitFilter}</span>
          </button>

          {/* Mode Switcher: Spreadsheet Table vs Grid Cards */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng Bảng tính"
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Bảng tính</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Xem dạng Thẻ"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Thẻ card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      {filterCategories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filterCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleSetCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN CONTENT: SPREADSHEET TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-12 text-center">STT</th>
                  <th className="py-3 px-3.5">Tên nguyên liệu</th>
                  <th className="py-3 px-2.5 w-28 text-center">Đơn vị tính</th>
                  <th className="py-3 px-3.5 w-48 text-right">Giá vốn (đ / Đơn vị)</th>
                  <th className="py-3 px-3.5">Công thức sử dụng</th>
                  <th className="py-3 px-3.5 w-24 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <Carrot className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600 text-xs">Không tìm thấy nguyên liệu nào</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((ing, index) => {
                    const recipesUsingThis = recipeUsageMap[ing.name.trim().toLowerCase()] || [];
                    const currentEditingVal = editingPrices[ing.id] ?? (ing.pricePerUnit !== undefined ? String(ing.pricePerUnit) : '');
                    const isSuccess = savedSuccessId === ing.id;

                    return (
                      <tr
                        key={ing.id}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        {/* STT */}
                        <td className="py-2.5 px-3.5 text-center font-bold text-slate-400 text-[11px]">
                          {index + 1}
                        </td>

                        {/* Name */}
                        <td className="py-2.5 px-3.5 font-bold text-slate-800">
                          <div>
                            <span className="font-extrabold text-slate-800 text-xs">{ing.name}</span>
                            {ing.note && (
                              <p className="text-[10px] text-slate-400 font-normal truncate max-w-[240px]">
                                {ing.note}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="py-2.5 px-2.5 text-center font-bold text-slate-700">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-extrabold border border-slate-200/60">
                            {ing.unit}
                          </span>
                        </td>

                        {/* Price - Inline Editable Field */}
                        <td className="py-2 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="relative w-32">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                placeholder="Nhập giá..."
                                value={currentEditingVal}
                                onChange={(e) => handlePriceInputChange(ing.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSavePrice(ing.id, ing.pricePerUnit);
                                  }
                                }}
                                onBlur={() => handleSavePrice(ing.id, ing.pricePerUnit)}
                                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-2.5 py-1.5 text-right font-extrabold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
                              />
                              <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400 pointer-events-none">
                                đ
                              </span>
                            </div>

                            <button
                              onClick={() => handleSavePrice(ing.id, ing.pricePerUnit)}
                              title="Lưu giá"
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                isSuccess
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                              }`}
                            >
                              {isSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* Recipe Usage / Sources */}
                        <td className="py-2.5 px-3.5">
                          {recipesUsingThis.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[240px]">
                              {recipesUsingThis.map((r) => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold"
                                >
                                  <ChefHat className="w-3 h-3 text-emerald-600" />
                                  <span>{r.title}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Chưa liên kết công thức</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                if (isAdmin) {
                                  onSelectIngredient(ing);
                                } else if (onOpenAdminLogin) {
                                  onOpenAdminLogin();
                                }
                              }}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
                              title="Chỉnh sửa chi tiết"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (isAdmin) {
                                  setIngToDelete(ing);
                                } else if (onOpenAdminLogin) {
                                  onOpenAdminLogin();
                                }
                              }}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                              title="Xóa nguyên liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
          {filtered.map((ing) => (
            <div
              key={ing.id}
              onClick={() => {
                if (isAdmin) {
                  onSelectIngredient(ing);
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-xs truncate group-hover:text-emerald-600 transition-colors">
                    {ing.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Đơn vị: <span className="font-bold text-slate-700">{ing.unit}</span>
                  </p>
                  {ing.pricePerUnit !== undefined && ing.pricePerUnit > 0 ? (
                    <span className="inline-block text-[11px] font-black text-emerald-700 mt-0.5">
                      {ing.pricePerUnit.toLocaleString('vi-VN')} đ / {ing.unit}
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-bold text-amber-600 mt-0.5">
                      Chưa nhập giá
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CuteDeleteModal
        isOpen={!!ingToDelete}
        itemName={ingToDelete?.name}
        itemType="nguyên liệu"
        onConfirm={() => {
          if (ingToDelete) {
            onDeleteIngredient(ingToDelete.id);
            setIngToDelete(null);
          }
        }}
        onClose={() => setIngToDelete(null)}
      />
    </div>
  );
};
