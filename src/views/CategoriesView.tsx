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
  Heart,
  AlertCircle,
} from 'lucide-react';
import { Category, IngredientItem, Recipe } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  recipes: Recipe[];
  ingredients: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onSelectCategoryFilter: (categoryName: string) => void;
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
  const [activeTab, setActiveTab] = useState<'recipe' | 'ingredient'>('recipe');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#FFD9E8');
  const [targetCatType, setTargetCatType] = useState<'recipe' | 'ingredient'>('recipe');

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
  };

  const getRecipeCount = (catName: string) => {
    return recipes.filter((r) => r.category === catName).length;
  };

  const getIngredientCount = (catName: string) => {
    return ingredients.filter((i) => i.category === catName).length;
  };

  // Filter categories by tab type
  const recipeCats = categories.filter((c) => c.type !== 'ingredient');
  const ingredientCats = categories.filter((c) => c.type === 'ingredient');

  const displayedCategories = activeTab === 'recipe' ? recipeCats : ingredientCats;

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      iconName: targetCatType === 'ingredient' ? 'Carrot' : 'Utensils',
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

      {/* Main Categories Tab Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('recipe')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'recipe'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Utensils className="w-4 h-4 text-[#FF8FB8]" />
          <span>Danh mục Món ăn ({recipeCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ingredient')}
          className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ingredient'
              ? 'bg-white text-slate-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Carrot className="w-4 h-4 text-amber-500" />
          <span>Danh mục Nguyên liệu ({ingredientCats.length})</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {displayedCategories.length === 0 ? (
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
              + Thêm danh mục mới
            </button>
          </div>
        ) : (
          displayedCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || (activeTab === 'ingredient' ? Carrot : Utensils);
            const count =
              activeTab === 'recipe' ? getRecipeCount(cat.name) : getIngredientCount(cat.name);

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (activeTab === 'recipe') {
                    onSelectCategoryFilter(cat.name);
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
                    <p className="text-xs text-slate-400 mt-0.5">
                      {count} {activeTab === 'recipe' ? 'công thức món' : 'loại nguyên liệu'}
                    </p>
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

                  {activeTab === 'recipe' && (
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
          <span>Thêm danh mục {activeTab === 'recipe' ? 'Món ăn' : 'Nguyên liệu'}</span>
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
                <div className="grid grid-cols-2 gap-2">
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={targetCatType === 'recipe' ? 'Ví dụ: Món nướng, Món lẩu...' : 'Ví dụ: Thịt tươi, Rau củ, Gia vị...'}
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

      {/* CUTE WARNING POPUP FOR DELETING CATEGORY */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-[360px] bg-white rounded-[32px] p-6 shadow-2xl border-2 border-pink-200 text-center animate-scale-up">
            {/* Cute floating icon header */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-100 to-rose-100 border-2 border-pink-200 mx-auto flex items-center justify-center text-3xl shadow-inner mb-3 animate-bounce">
              🐱
            </div>

            <h3 className="font-black text-slate-800 text-base mb-1">
              Hế lô bạn ơi! Bạn chắc chắn muốn xóa chứ? 🥺
            </h3>

            <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4">
              Danh mục <span className="font-extrabold text-[#FF8FB8]">"{catToDelete.name}"</span> đang được lưu trữ. Bạn xóa đi rồi là không khôi phục lại được đâu nè! 💔
            </p>

            <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 text-[11px] font-bold text-slate-600 mb-5 flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>
                {catToDelete.type === 'ingredient'
                  ? `Đang có ${getIngredientCount(catToDelete.name)} nguyên liệu thuộc nhóm này`
                  : `Đang có ${getRecipeCount(catToDelete.name)} công thức món ăn`}
              </span>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={confirmDeleteCategory}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vẫn xóa nha! (Tạm biệt)</span>
              </button>

              <button
                onClick={() => setCatToDelete(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1"
              >
                <span>🌸 Hủy nha, giữ lại nè!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
