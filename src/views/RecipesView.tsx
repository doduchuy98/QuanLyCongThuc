import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Plus, ChefHat, ArrowUpDown, Star, Calendar, Check, Share2, CheckCircle2, ImageOff, Coins } from 'lucide-react';
import { Category, IngredientItem, Recipe } from '../types';
import { shareRecipeData } from '../utils/shareUtils';
import { calculateRecipeTotalCost, formatCurrency } from '../utils/costUtils';
import { matchesSearch } from '../utils/stringUtils';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

export type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'rating_desc';

interface RecipesViewProps {
  recipes: Recipe[];
  categories: Category[];
  allIngredients?: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onSelectRecipe: (recipeId: string) => void;
  onAddRecipe: () => void;
  onEditRecipe: (recipeId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

const SORT_OPTIONS: { id: SortOption; label: string; subLabel: string; icon: string }[] = [
  { id: 'date_desc', label: 'Ngày thêm (Mới nhất)', subLabel: 'Mới đăng gần đây', icon: '📅' },
  { id: 'date_asc', label: 'Ngày thêm (Cũ nhất)', subLabel: 'Đã lưu lâu nhất', icon: '⏳' },
  { id: 'name_asc', label: 'Tên món (A → Z)', subLabel: 'Sắp xếp theo bảng chữ cái', icon: '🔤' },
  { id: 'name_desc', label: 'Tên món (Z → A)', subLabel: 'Bảng chữ cái ngược', icon: '🔤' },
  { id: 'rating_desc', label: 'Đánh giá (Cao nhất)', subLabel: 'Món ăn yêu thích nhất', icon: '⭐' },
];

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  categories,
  allIngredients = [],
  isAdmin,
  onOpenAdminLogin,
  onSelectRecipe,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
}) => {
  const handleProtectedAddRecipe = () => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      onAddRecipe();
    }
  };

  const handleProtectedEditRecipe = (id: string) => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      onEditRecipe(id);
    }
  };

  const handleProtectedDeleteRecipe = (id: string) => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      onDeleteRecipe(id);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const handleShareRecipe = async (r: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const res = await shareRecipeData(r);
    setShareToast(res.message);
    setTimeout(() => setShareToast(null), 3000);
  };

  // Filter categories to only include recipe categories
  const recipeCatNamesFromObj = categories
    .filter((c) => c.type === 'recipe' || (!c.type && c.type !== 'ingredient' && c.type !== 'unit'))
    .map((c) => c.name);

  const recipeCatNamesFromRecipes = recipes.map((r) => r.category).filter(Boolean);

  const filterCategories = [
    'Tất cả',
    ...Array.from(new Set([...recipeCatNamesFromObj, ...recipeCatNamesFromRecipes])),
  ];

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return 0;
    const parts = dateStr.trim().split(' ');
    const datePart = parts[0];
    const timePart = parts[1] ? `T${parts[1]}` : '';
    const dParts = datePart.split('/');
    if (dParts.length === 3) {
      const [day, month, year] = dParts;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${timePart}`).getTime() || 0;
    }
    return new Date(dateStr).getTime() || 0;
  };

  const filteredRecipes = recipes
    .filter((r) => {
      const matchesCategory =
        selectedCategory === 'Tất cả' || r.category === selectedCategory;
      const q = searchQuery.trim();
      const matchesSearchQuery =
        !q ||
        matchesSearch(r.title, q) ||
        matchesSearch(r.description, q) ||
        matchesSearch(r.category, q) ||
        (r.ingredients &&
          r.ingredients.some((ing) => matchesSearch(ing.ingredientName, q)));
      return matchesCategory && matchesSearchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.title.localeCompare(b.title, 'vi');
      }
      if (sortBy === 'name_desc') {
        return b.title.localeCompare(a.title, 'vi');
      }
      if (sortBy === 'rating_desc') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'date_asc') {
        return parseDate(a.updatedAt) - parseDate(b.updatedAt);
      }
      // default date_desc
      return parseDate(b.updatedAt) - parseDate(a.updatedAt);
    });

  const activeSortObj = SORT_OPTIONS.find((s) => s.id === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Share Toast Banner */}
      {shareToast && (
        <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-between animate-fade-in z-30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span>{shareToast}</span>
          </div>
          <button onClick={() => setShareToast(null)} className="text-emerald-200 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Search & Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên món hoặc nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-8 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Trigger Button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              sortBy !== 'date_desc'
                ? 'bg-pink-500 text-white border-pink-500 shadow-pink-200 shadow-sm'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
            title="Sắp xếp danh sách"
          >
            <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{activeSortObj.label.split(' ')[0]}</span>
          </button>

          {/* Sort Menu Dropdown */}
          {isSortMenuOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-3xl shadow-xl border border-pink-100 p-2 z-30 animate-fade-in space-y-1">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Sắp xếp theo
              </div>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortBy(opt.id);
                      setIsSortMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-2xl transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-50 text-[#FF8FB8] font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none">{opt.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">{opt.subLabel}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF8FB8] flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {filterCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-2xs ${
                isSelected
                  ? 'bg-[#FF8FB8] text-white shadow-pink-200 shadow-sm scale-102'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-pink-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Active Sort Status Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-semibold text-slate-600">
          Hiển thị {filteredRecipes.length} công thức
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Tiêu chí:</span>
          <span className="font-bold text-[#FF8FB8] bg-pink-50 px-2 py-0.5 rounded-full text-[11px]">
            {activeSortObj.icon} {activeSortObj.label}
          </span>
        </div>
      </div>

      {/* Recipes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <AnimatePresence mode="popLayout">
          {filteredRecipes.length === 0 ? (
            <motion.div
              key="empty-recipe-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6 col-span-full"
            >
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">
                Không tìm thấy công thức phù hợp
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Thử tìm từ khóa khác nhé!
              </p>
            </motion.div>
          ) : (
            filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={() => onSelectRecipe(recipe.id)}
                className="relative flex items-center justify-between p-3 rounded-[22px] bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-shadow cursor-pointer group"
              >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex-shrink-0">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 group-hover:scale-105 transition-transform">
                      <ImageOff className="w-5 h-5 opacity-40 mb-0.5 text-slate-500" />
                      <span className="text-[9px] font-extrabold text-slate-500">No image</span>
                    </div>
                  )}
                  {recipe.rating && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-slate-900 stroke-none" />
                      <span>{recipe.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#FF8FB8] transition-colors truncate">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {recipe.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {recipe.ingredients.length} ng.liệu
                    </span>
                    {(() => {
                      const cost = calculateRecipeTotalCost(recipe, allIngredients);
                      if (cost <= 0) return null;
                      return (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                            <Coins className="w-2.5 h-2.5 text-emerald-600" />
                            {formatCurrency(cost)}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  {recipe.updatedAt && (
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>Cập nhật: {recipe.updatedAt}</span>
                    </div>
                  )}
                  {searchQuery.trim() && (() => {
                    const q = searchQuery.trim();
                    const matchedIngs = recipe.ingredients.filter((ing) =>
                      matchesSearch(ing.ingredientName, q)
                    );
                    if (matchedIngs.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {matchedIngs.slice(0, 3).map((ing, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md bg-pink-50 border border-pink-200/60 text-[10px] font-bold text-[#FF8FB8] inline-flex items-center gap-0.5"
                            >
                              <span>🥕</span>
                              <span>{ing.ingredientName}</span>
                            </span>
                          ))}
                          {matchedIngs.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{matchedIngs.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Action Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === recipe.id ? null : recipe.id);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {activeMenuId === recipe.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-9 w-36 bg-white rounded-2xl shadow-xl border border-pink-100 py-1.5 z-20 animate-fade-in"
                  >
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onSelectRecipe(recipe.id);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                    >
                      👁️ Xem chi tiết
                    </button>
                    <button
                      onClick={(e) => handleShareRecipe(recipe, e)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                    >
                      📲 Chia sẻ công thức
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        handleProtectedEditRecipe(recipe.id);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        if (isAdmin) {
                          setRecipeToDelete(recipe);
                        } else {
                          handleProtectedDeleteRecipe(recipe.id);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      🗑️ Xóa công thức
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>

      <CuteDeleteModal
        isOpen={!!recipeToDelete}
        itemName={recipeToDelete?.title}
        itemType="công thức món"
        onConfirm={() => {
          if (recipeToDelete) {
            onDeleteRecipe(recipeToDelete.id);
            setRecipeToDelete(null);
          }
        }}
        onClose={() => setRecipeToDelete(null)}
      />
    </div>
  );
};

