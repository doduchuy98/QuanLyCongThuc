import React from 'react';
import { Utensils, LayoutGrid, RefreshCw, ChevronRight, Globe, ImageOff, MoreVertical, PiggyBank, ArrowRight } from 'lucide-react';
import { Category, Recipe } from '../types';

interface HomeViewProps {
  recipes: Recipe[];
  categories: Category[];
  totalIngredientsCount?: number;
  onNavigateToRecipes: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToBrowser?: () => void;
  onSwitchToExpense?: () => void;
  onSelectRecipe: (recipeId: string) => void;
  isAdmin?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipes,
  categories,
  onNavigateToRecipes,
  onNavigateToCategories,
  onNavigateToBrowser,
  onSwitchToExpense,
  onSelectRecipe,
  isAdmin,
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
            Hiệu quả – Chính xác – Chuẩn định lượng & quy trình
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

      {/* Web Browser Featured Card Banner */}
      {onNavigateToBrowser && (
        <button
          onClick={onNavigateToBrowser}
          className="w-full px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-[#FF8FB8] text-white shadow-sm shadow-pink-200 flex items-center justify-between text-left hover:opacity-95 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/25">
              <Globe className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight text-white truncate">
                  Trang Duyệt Web Bếp 🌐
                </h3>
              </div>
              <p className="text-[11px] text-pink-100 font-medium truncate mt-0.5">
                Tra cứu công thức, Cookpad, Món Ngon Mỗi Ngày & tìm kiếm món ăn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-1.5 rounded-xl backdrop-blur-md group-hover:bg-white/30 transition-all flex-shrink-0 ml-2">
            <span className="hidden sm:inline">Khám phá</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* Mode Switch Card Banner: Switch to Personal Expense Management (Chỉ Admin mới hiện) */}
      {isAdmin && onSwitchToExpense && (
        <button
          onClick={onSwitchToExpense}
          className="w-full px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md shadow-emerald-200 flex items-center justify-between text-left hover:opacity-95 transition-all group border border-emerald-400/30"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 border border-white/30 shadow-2xs">
              <PiggyBank className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight text-white truncate">
                  Quản Lý Chi Tiêu Cá Nhân 💳
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-black border border-white/20">
                  Mới
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium truncate mt-0.5">
                Ghi chép thu chi, quản lý ngân sách sinh hoạt & tiền chợ hàng ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black bg-white text-emerald-800 px-3 py-1.5 rounded-xl shadow-xs group-hover:scale-105 transition-all flex-shrink-0 ml-2">
            <span>Mở ngay</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-emerald-700" />
          </div>
        </button>
      )}

      {/* Section: Công thức mới cập nhật (Cuộn ngang) */}
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

        {/* Recipe Cards Horizontal Scrollable List */}
        <div className="flex overflow-x-auto gap-3 pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
          {recipes.slice(0, 10).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe.id)}
              className="w-[180px] sm:w-[200px] flex-shrink-0 snap-start bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-2"
            >
              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-100/80 flex-shrink-0">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <ImageOff className="w-5 h-5 opacity-40 mb-1 text-slate-500" />
                    <span className="text-[9px] font-extrabold text-slate-500">Chưa có ảnh</span>
                  </div>
                )}
                {recipe.category && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-bold rounded-lg truncate max-w-[80%]">
                    {recipe.category}
                  </span>
                )}
              </div>

              <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#FF8FB8] transition-colors line-clamp-2 leading-snug">
                    {recipe.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                  <span className="truncate">Cập nhật: {recipe.updatedAt}</span>
                  {recipe.rating ? (
                    <span className="font-bold text-amber-500 flex items-center gap-0.5 flex-shrink-0">
                      ★ {recipe.rating}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
