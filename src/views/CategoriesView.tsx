import React, { useState } from 'react';
import {
  LayoutGrid,
  Plus,
  Search,
  Edit2,
  Trash2,
  Folder,
  ChefHat,
  Carrot,
  Scale,
  Utensils,
  Coffee,
  IceCream,
  Soup,
  Cookie,
  Flame,
  Fish,
  Apple,
  Wheat,
  Beef,
  Milk,
  Droplets,
  Box,
  Sparkles,
  Heart,
  Tag,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { Category, IngredientItem, Recipe } from '../types';
import { CategoryModal } from '../components/CategoryModal';
import { CuteDeleteModal } from '../components/CuteDeleteModal';
import { matchesSearch } from '../utils/stringUtils';

interface CategoriesViewProps {
  categories: Category[];
  recipes: Recipe[];
  ingredients: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category, oldName?: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSelectCategoryFilter?: (categoryName: string, type: 'recipe' | 'ingredient') => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Utensils,
  Coffee,
  IceCream,
  Soup,
  Cookie,
  Flame,
  Fish,
  Beef,
  Carrot,
  Apple,
  Wheat,
  Milk,
  Scale,
  Droplets,
  UtensilsCrossed,
  Box,
  Sparkles,
  Tag,
  Heart,
  Star,
  Folder,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  recipes,
  ingredients,
  isAdmin,
  onOpenAdminLogin,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleProtectedAction = (action: () => void) => {
    if (!isAdmin && onOpenAdminLogin) {
      onOpenAdminLogin();
    } else {
      action();
    }
  };

  // Only filter categories for recipes
  const recipeCategories = categories.filter(
    (c) => !c.type || c.type === 'recipe'
  );

  const filteredCategories = recipeCategories.filter((c) => {
    return !searchQuery.trim() || matchesSearch(c.name, searchQuery);
  });

  // Compute recipe count dynamically for each category
  const getItemCount = (catName: string) => {
    return recipes.filter((r) => r.category === catName).length;
  };

  return (
    <div className="p-3.5 space-y-3 pb-28 animate-fade-in max-w-2xl mx-auto">
      {/* Sleek Top Action Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-9 pr-7 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:border-transparent transition-all shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() =>
            handleProtectedAction(() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            })
          }
          className="py-2 px-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs hover:opacity-95 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {filteredCategories.length === 0 ? (
          <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-5">
            <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Không tìm thấy danh mục món ăn</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Bấm "Thêm danh mục" để khởi tạo danh mục mới.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Folder;
            const count = getItemCount(cat.name);

            return (
              <div
                key={cat.id}
                className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-100 shadow-2xs hover:border-pink-200 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    if (onSelectCategoryFilter) {
                      onSelectCategoryFilter(cat.name, 'recipe');
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 shadow-2xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: cat.bgColor || '#FFECA8' }}
                  >
                    <IconComponent className="w-5 h-5 text-slate-800" />
                  </div>

                  <div className="min-w-0 flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-xs truncate group-hover:text-[#FF8FB8] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 shrink-0">
                      {count} món
                    </span>
                  </div>
                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      handleProtectedAction(() => {
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-600 flex items-center justify-center transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      handleProtectedAction(() => {
                        setDeletingCategory(cat);
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
        defaultType="recipe"
        onSave={(cat, oldName) => {
          if (editingCategory) {
            onUpdateCategory(cat, oldName);
          } else {
            onAddCategory(cat);
          }
        }}
      />

      {/* Cute Delete Modal */}
      <CuteDeleteModal
        isOpen={!!deletingCategory}
        itemName={deletingCategory?.name}
        itemType="danh mục"
        onConfirm={() => {
          if (deletingCategory) {
            onDeleteCategory(deletingCategory.id);
            setDeletingCategory(null);
          }
        }}
        onClose={() => setDeletingCategory(null)}
      />
    </div>
  );
};
