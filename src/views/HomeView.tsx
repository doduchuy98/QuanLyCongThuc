import React from 'react';
import { Utensils, Carrot, LayoutGrid, RefreshCw, ChevronRight, ShoppingCart, BookOpen, Sparkles, ImageOff, MoreVertical } from 'lucide-react';
import { Category, Recipe } from '../types';

interface HomeViewProps {
  recipes: Recipe[];
  categories: Category[];
  totalIngredientsCount: number;
  shoppingListUnboughtCount?: number;
  onNavigateToRecipes: () => void;
  onNavigateToIngredients: () => void;
  onNavigateToCategories: () => void;
  onNavigateToShoppingList?: () => void;
  onSelectRecipe: (recipeId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipes,
  categories,
  totalIngredientsCount,
  shoppingListUnboughtCount = 0,
  onNavigateToRecipes,
  onNavigateToIngredients,
  onNavigateToCategories,
  onNavigateToShoppingList,
  onSelectRecipe,
}) => {
  const totalRecipes = recipes.length;
  const totalCategories = categories.length;
  const updatingCount = recipes.filter((r) => r.isActive).length;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#FFD9E8] via-[#FFF8FB] to-[#AEE9FF]/60 p-5 md:p-6 shadow-sm border border-pink-200/50">
        <div className="relative z-10 max-w-[220px] md:max-w-lg">
          <span className="inline-block px-2.5 py-1 rounded-full bg-white/80 text-[11px] font-bold text-[#FF8FB8] mb-1.5 shadow-2xs">
            Trợ lý làm bếp 🌟
          </span>
          <h2 className="text-lg md:text-xl font-black text-slate-800 leading-tight">
            Quản lý công thức món ăn & sốt
          </h2>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mt-1">
            Hiệu quả – Chính xác – Chuẩn định lượng & giá vốn
          </p>
        </div>

        {/* Decorative Dish Illustration Image */}
        <div className="absolute right-2 -bottom-2 w-28 h-28 md:w-36 md:h-36 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80"
            alt="Dish Illustration"
            className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white rotate-6"
          />
        </div>
      </div>

      {/* Smart Shopping List Featured Card Banner */}
      {onNavigateToShoppingList && (
        <button
          onClick={onNavigateToShoppingList}
          className="w-full p-4 rounded-[24px] bg-gradient-to-r from-pink-500 via-rose-500 to-[#FF8FB8] text-white shadow-md shadow-pink-200 flex items-center justify-between text-left hover:opacity-95 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/30">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight">Đi Chợ Thông Minh 🛒</h3>
                <span className="px-2 py-0.5 rounded-full bg-white text-pink-600 text-[10px] font-extrabold shadow-2xs">
                  Mới
                </span>
              </div>
              <p className="text-xs text-pink-100 font-semibold mt-0.5">
                {shoppingListUnboughtCount > 0
                  ? `Đang có ${shoppingListUnboughtCount} món nguyên liệu cần mua sắm`
                  : 'Gom nguyên liệu từ món ăn & lên danh sách đi chợ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-extrabold text-xs bg-white/20 px-3 py-2 rounded-xl backdrop-blur-md group-hover:bg-white/30 transition-all flex-shrink-0">
            <span>Mở danh sách</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* 4 Stats Cards Grid (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Tổng công thức */}
        <button
          onClick={onNavigateToRecipes}
          className="flex flex-col justify-between p-4 rounded-[20px] bg-[#D9F7BE]/40 border border-emerald-200/60 text-left hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Tổng công thức</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-800 tracking-tight">
              {totalRecipes}
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[11px] font-bold text-emerald-700/80">
              <span>công thức</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Card 2: Nguyên liệu */}
        <button
          onClick={onNavigateToIngredients}
          className="flex flex-col justify-between p-4 rounded-[20px] bg-[#FFECA8]/40 border border-amber-200/60 text-left hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Nguyên liệu</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Carrot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-800 tracking-tight">
              {totalIngredientsCount}
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[11px] font-bold text-amber-700/80">
              <span>loại</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Card 3: Danh mục */}
        <button
          onClick={onNavigateToCategories}
          className="flex flex-col justify-between p-4 rounded-[20px] bg-[#AEE9FF]/40 border border-sky-200/60 text-left hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Danh mục</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-700 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-sky-800 tracking-tight">
              {totalCategories}
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[11px] font-bold text-sky-700/80">
              <span>danh mục</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Card 4: Đang cập nhật / Hoạt động */}
        <button
          onClick={onNavigateToRecipes}
          className="flex flex-col justify-between p-4 rounded-[20px] bg-[#FFD9E8]/60 border border-pink-200 text-left hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Hoạt động</span>
            <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-700 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-pink-800 tracking-tight">
              {updatingCount}
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[11px] font-bold text-pink-700/80">
              <span>công thức</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* Section: Công thức mới cập nhật */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-800">Công thức mới cập nhật</h3>
          <button
            onClick={onNavigateToRecipes}
            className="text-xs font-bold text-[#FF8FB8] hover:underline"
          >
            Xem tất cả
          </button>
        </div>

        {/* Recipe Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recipes.slice(0, 4).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="flex items-center justify-between p-3 rounded-[20px] bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <ImageOff className="w-4 h-4 opacity-40 mb-0.5 text-slate-500" />
                    <span className="text-[8px] font-extrabold text-slate-500">No image</span>
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#FF8FB8] transition-colors">
                    {recipe.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cập nhật: {recipe.updatedAt}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRecipe(recipe.id);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
