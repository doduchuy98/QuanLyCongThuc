import React, { useState } from 'react';
import {
  Utensils,
  Coffee,
  IceCream,
  Soup,
  Cookie,
  Plus,
  ChevronRight,
  FolderPlus,
  X,
  Check,
  Trash2,
  Carrot,
  Sparkles,
  Milk,
  Beef,
  Wheat,
  Scale,
  Droplets,
  UtensilsCrossed,
  Box,
  Ruler,
} from 'lucide-react';
import { Category, IngredientItem, Recipe } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface CategoriesViewProps {
  categories: Category[];
  recipes: Recipe[];
  ingredients: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onSelectCategoryFilter: (categoryName: string, categoryType?: 'recipe' | 'ingredient') => void;
  onAddCategory: (newCat: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  recipes,
  ingredients,
  isAdmin,
  onOpenAdminLogin,
  onSelectCategoryFilter,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'ingredient' | 'unit'>('recipe');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#FFD9E8');
  const [targetCatType, setTargetCatType] = useState<'recipe' | 'ingredient' | 'unit'>('recipe');

  // Cute Warning Popup state for category deletion
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    Utensils,
    Coffee,
    IceCream,
    Soup,
    Cookie,
    FolderPlus,
    Carrot,
    Beef,
    Wheat,
    Sparkles,
    Milk,
    Scale,
    Droplets,
    UtensilsCrossed,
    Box,
    Ruler,
  };

  const getRecipeCount = (catName: string) => {
    return recipes.filter((r) => r.category === catName).length;
  };

  const getIngredientCount = (catName: string) => {
    return ingredients.filter((i) => i.category === catName).length;
  };

  const getUnitUsageCount = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes('khối lượng') || lower.includes('gram') || lower.includes('kg')) {
      return ingredients.filter((i) => ['gram', 'g', 'kg', 'kilogram'].includes(i.unit.toLowerCase())).length;
    }
    if (lower.includes('thể tích') || lower.includes('ml') || lower.includes('lít')) {
      return ingredients.filter((i) => ['ml', 'lít', 'l'].includes(i.unit.toLowerCase())).length;
    }
    if (lower.includes('đong đếm') || lower.includes('muỗng') || lower.includes('chén') || lower.includes('bát')) {
      return ingredients.filter((i) => i.unit.toLowerCase().includes('muỗng') || i.unit.toLowerCase().includes('chén') || i.unit.toLowerCase().includes('bát')).length;
    }
    return ingredients.filter((i) => ['quả', 'trái', 'củ', 'tép', 'ổ', 'lát', 'miếng', 'gói', 'hộp', 'chai', 'lon', 'bó', 'nguyên con', 'cái'].some(u => i.unit.toLowerCase().includes(u))).length;
  };

  // Filter categories by tab type
  const recipeCats = categories.filter((c) => c.type !== 'ingredient' && c.type !== 'unit');
  const ingredientCats = categories.filter((c) => c.type === 'ingredient');
  const unitCats = categories.filter((c) => c.type === 'unit');

  // Distinct units extracted from ingredients list & unit categories
  const getUnitIngredientsMap = () => {
    const map: Record<string, IngredientItem[]> = {};

    // First collect all units used in ingredients
    ingredients.forEach((ing) => {
      const u = ing.unit?.trim();
      if (!u) return;
      if (!map[u]) map[u] = [];
      map[u].push(ing);
    });

    // Also include unit categories created manually if not present
    unitCats.forEach((cat) => {
      if (!map[cat.name]) {
        map[cat.name] = [];
      }
    });

    return map;
  };

  const unitMap = getUnitIngredientsMap();
  const sortedUnitNames = Object.keys(unitMap).sort((a, b) => {
    // Show units with ingredients first, then by count descending
    return unitMap[b].length - unitMap[a].length;
  });

  const displayedCategories =
    activeTab === 'recipe' ? recipeCats : activeTab === 'ingredient' ? ingredientCats : unitCats;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    let defaultIcon = 'Utensils';
    if (targetCatType === 'ingredient') defaultIcon = 'Carrot';
    if (targetCatType === 'unit') defaultIcon = 'Ruler';

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      iconName: defaultIcon,
      bgColor: selectedBgColor,
      recipeCount: 0,
      type: targetCatType,
    };

    onAddCategory(newCat);
    setNewCatName('');
    setIsAddModalOpen(false);
    setToastMsg(`Đã tạo thành công danh mục "${newCat.name}"! 🌸`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const confirmDeleteCategory = () => {
    if (!catToDelete) return;
    const catName = catToDelete.name;
    onDeleteCategory(catToDelete.id);
    setCatToDelete(null);
    setToastMsg(`Đã xóa danh mục "${catName}" rồi nha! 🗑️✨`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getTabLabel = (tab: 'recipe' | 'ingredient' | 'unit') => {
    if (tab === 'recipe') return 'Món ăn';
    if (tab === 'ingredient') return 'Nguyên liệu';
    return 'Đơn vị tính';
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* Toast notification banner */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-200 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Main Categories 3-Tab Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('recipe')}
          className={`flex-1 py-2 rounded-xl font-extrabold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'recipe'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-[#FF8FB8]" />
          <span>Món ăn ({recipeCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ingredient')}
          className={`flex-1 py-2 rounded-xl font-extrabold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ingredient'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Carrot className="w-3.5 h-3.5 text-amber-500" />
          <span>Nguyên liệu ({ingredientCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unit')}
          className={`flex-1 py-2 rounded-xl font-extrabold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'unit'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 text-sky-500" />
          <span>Đơn vị tính ({sortedUnitNames.length})</span>
        </button>
      </div>

      {/* Categories / Units List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activeTab === 'unit' ? (
          sortedUnitNames.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
              <Sparkles className="w-10 h-10 text-pink-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Chưa có đơn vị tính nào</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">Thêm nguyên liệu mới để tạo đơn vị tính nhé!</p>
              <button
                onClick={() => {
                  if (isAdmin) {
                    setTargetCatType('unit');
                    setIsAddModalOpen(true);
                  } else if (onOpenAdminLogin) {
                    onOpenAdminLogin();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#FF8FB8] text-white font-bold text-xs shadow-sm hover:opacity-90"
              >
                + Thêm đơn vị tính
              </button>
            </div>
          ) : (
            sortedUnitNames.map((unitName) => {
              const matchedIngs = unitMap[unitName] || [];
              const uLower = unitName.toLowerCase();
              
              let IconComp = Ruler;
              let bg = '#FFD9E8';
              if (uLower.includes('g') || uLower.includes('gram') || uLower.includes('kg') || uLower.includes('khối lượng')) {
                IconComp = Scale;
                bg = '#FFECA8';
              } else if (uLower.includes('ml') || uLower.includes('lít') || uLower.includes('l') || uLower.includes('thể tích')) {
                IconComp = Droplets;
                bg = '#AEE9FF';
              } else if (uLower.includes('muỗng') || uLower.includes('chén') || uLower.includes('bát') || uLower.includes('thìa')) {
                IconComp = UtensilsCrossed;
                bg = '#FFC8A2';
              } else if (['quả', 'trái', 'củ', 'tép', 'ổ', 'lát', 'miếng', 'gói', 'hộp', 'chai', 'lon', 'bó', 'nguyên con', 'cái'].some(u => uLower.includes(u))) {
                IconComp = Box;
                bg = '#D9F7BE';
              }

              // Check if matching custom unit category for delete option
              const matchingCat = unitCats.find(c => c.name.toLowerCase() === unitName.toLowerCase());

              return (
                <div
                  key={unitName}
                  className="p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{ backgroundColor: bg }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-800 shadow-2xs"
                      >
                        <IconComp className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <span>{unitName}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Đơn vị
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {matchedIngs.length > 0
                            ? `${matchedIngs.length} nguyên liệu trong kho dùng đơn vị này`
                            : 'Chưa có nguyên liệu nào gán'}
                        </p>
                      </div>
                    </div>

                    {matchingCat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAdmin) {
                            setCatToDelete(matchingCat);
                          } else if (onOpenAdminLogin) {
                            onOpenAdminLogin();
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Xóa đơn vị tính"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* List ingredients using this unit */}
                  {matchedIngs.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5 pl-15">
                      {matchedIngs.slice(0, 6).map((ing) => (
                        <span
                          key={ing.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-semibold text-slate-600 flex items-center gap-1"
                        >
                          <span>🥕</span>
                          <span>{ing.name}</span>
                        </span>
                      ))}
                      {matchedIngs.length > 6 && (
                        <span className="px-2 py-0.5 rounded-lg bg-pink-50 text-[11px] font-bold text-[#FF8FB8]">
                          +{matchedIngs.length - 6} nguyên liệu khác
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : displayedCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
            <Sparkles className="w-10 h-10 text-pink-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có danh mục nào ở đây</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Tạo danh mục mới để dễ quản lý nhé!</p>
            <button
              onClick={() => {
                if (isAdmin) {
                  setTargetCatType(activeTab);
                  setIsAddModalOpen(true);
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FF8FB8] text-white font-bold text-xs shadow-sm hover:opacity-90"
            >
              + Thêm danh mục {getTabLabel(activeTab)}
            </button>
          </div>
        ) : (
          displayedCategories.map((cat) => {
            const IconComponent =
              ICON_MAP[cat.iconName] ||
              (activeTab === 'unit' ? Ruler : activeTab === 'ingredient' ? Carrot : Utensils);

            const countText =
              activeTab === 'recipe'
                ? `${getRecipeCount(cat.name)} công thức món`
                : activeTab === 'ingredient'
                ? `${getIngredientCount(cat.name)} loại nguyên liệu`
                : `${getUnitUsageCount(cat.name)} nguyên liệu đang dùng`;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (activeTab === 'recipe') {
                    onSelectCategoryFilter(cat.name, 'recipe');
                  } else if (activeTab === 'ingredient') {
                    onSelectCategoryFilter(cat.name, 'ingredient');
                  }
                }}
                className="flex items-center justify-between p-3.5 rounded-[22px] bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    style={{ backgroundColor: cat.bgColor || '#FFD9E8' }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-800 shadow-2xs group-hover:scale-105 transition-transform"
                  >
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#FF8FB8] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{countText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAdmin) {
                        setCatToDelete(cat);
                      } else if (onOpenAdminLogin) {
                        onOpenAdminLogin();
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {(activeTab === 'recipe' || activeTab === 'ingredient') && (
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#FF8FB8] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Add Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (isAdmin) {
              setTargetCatType(activeTab);
              setIsAddModalOpen(true);
            } else if (onOpenAdminLogin) {
              onOpenAdminLogin();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-sm shadow-md shadow-pink-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Thêm danh mục {getTabLabel(activeTab)}</span>
        </button>
      </div>

      {/* Modal Add Category */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-pink-100">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
              <h3 className="font-bold text-slate-800 text-base">Thêm danh mục mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Loại danh mục
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetCatType('recipe')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      targetCatType === 'recipe'
                        ? 'bg-pink-50 border-[#FF8FB8] text-[#FF8FB8]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🍲 Món ăn
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCatType('ingredient')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      targetCatType === 'ingredient'
                        ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    🥕 Nguyên liệu
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCatType('unit')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      targetCatType === 'unit'
                        ? 'bg-sky-50 border-sky-400 text-sky-600'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    📏 Đơn vị tính
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    targetCatType === 'recipe'
                      ? 'Ví dụ: Món nướng, Món lẩu...'
                      : targetCatType === 'ingredient'
                      ? 'Ví dụ: Thịt tươi, Rau củ, Gia vị...'
                      : 'Ví dụ: Thể tích, Khối lượng, Đóng gói...'
                  }
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Màu nền đại diện
                </label>
                <div className="flex gap-2">
                  {['#FFD9E8', '#FFECA8', '#AEE9FF', '#D9F7BE', '#FFC8A2'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedBgColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${
                        selectedBgColor === color
                          ? 'border-[#FF8FB8] scale-110 shadow-sm'
                          : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#FF8FB8] text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Tạo danh mục</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUTE DELETE MODAL */}
      <CuteDeleteModal
        isOpen={!!catToDelete}
        itemName={catToDelete?.name}
        itemType="danh mục"
        onConfirm={confirmDeleteCategory}
        onClose={() => setCatToDelete(null)}
      />
    </div>
  );
};
