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
import { Category, Recipe } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface CategoriesViewProps {
  categories: Category[];
  recipes: Recipe[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onSelectCategoryFilter: (categoryName: string) => void;
  onAddCategory: (newCat: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  recipes,
  isAdmin,
  onOpenAdminLogin,
  onSelectCategoryFilter,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#FFD9E8');

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

  // Filter categories for recipes/dishes
  const recipeCats = categories.filter((c) => c.type !== 'ingredient' && c.type !== 'unit');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      iconName: 'Utensils',
      bgColor: selectedBgColor,
      recipeCount: 0,
      type: 'recipe',
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

      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-3xl border border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF8FB8] text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Danh Mục Món Ăn</h2>
            <p className="text-xs text-slate-500">Quản lý và phân loại công thức chế biến</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-white text-xs font-extrabold text-[#FF8FB8] border border-pink-200/60 shadow-2xs">
          {recipeCats.length} danh mục
        </span>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {recipeCats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6 col-span-full">
            <Sparkles className="w-10 h-10 text-pink-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Chưa có danh mục nào</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">Tạo danh mục mới để phân loại món ăn nhé!</p>
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAddModalOpen(true);
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FF8FB8] text-white font-bold text-xs shadow-sm hover:opacity-90"
            >
              + Thêm danh mục món ăn
            </button>
          </div>
        ) : (
          recipeCats.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Utensils;
            const countText = `${getRecipeCount(cat.name)} công thức món`;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategoryFilter(cat.name)}
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

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#FF8FB8] group-hover:translate-x-1 transition-all" />
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
              setIsAddModalOpen(true);
            } else if (onOpenAdminLogin) {
              onOpenAdminLogin();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-sm shadow-md shadow-pink-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Thêm danh mục món ăn</span>
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
                  Tên danh mục món ăn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Món nướng, Món lẩu, Món chay..."
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
