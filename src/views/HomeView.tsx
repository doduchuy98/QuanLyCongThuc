import React, { useState, useEffect } from 'react';
import { Utensils, LayoutGrid, RefreshCw, ChevronRight, ImageOff, MoreVertical, PiggyBank, ArrowRight, Wallet, Edit2, User, Sparkles, Check, Search, X, Clock } from 'lucide-react';
import { Category, Recipe } from '../types';
import { matchesSearch } from '../utils/stringUtils';

interface HomeViewProps {
  recipes: Recipe[];
  categories: Category[];
  totalIngredientsCount?: number;
  onNavigateToRecipes: (categoryName?: string) => void;
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
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('app_user_name') || '';
  });
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatVietnameseDateTime = (d: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[d.getDay()];
    const dateStr = d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return `${dayName}, ${dateStr} • ${timeStr}`;
  };

  useEffect(() => {
    const savedName = localStorage.getItem('app_user_name');
    if (!savedName) {
      setIsNameModalOpen(true);
    } else {
      setUserName(savedName);
    }
  }, []);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputName.trim();
    if (trimmed) {
      localStorage.setItem('app_user_name', trimmed);
      setUserName(trimmed);
      setIsNameModalOpen(false);
    }
  };

  const handleOpenEditName = () => {
    setInputName(userName);
    setIsNameModalOpen(true);
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((r) => {
    if (!searchQuery.trim()) return true;
    const matchesTitle = matchesSearch(r.title, searchQuery);
    const matchesCategory = matchesSearch(r.category, searchQuery);
    const matchesIngredient = r.ingredients?.some((ing) => matchesSearch(ing.ingredientName, searchQuery));
    return matchesTitle || matchesCategory || matchesIngredient;
  });

  // Collect all category names (both from categories array and from recipes)
  const recipeCategories = categories.filter((c) => !c.type || c.type === 'recipe');
  const allCatNamesSet = new Set<string>();

  recipeCategories.forEach((c) => {
    if (c.name) allCatNamesSet.add(c.name);
  });

  filteredRecipes.forEach((r) => {
    if (r.category && r.category.trim()) {
      allCatNamesSet.add(r.category.trim());
    }
  });

  const categoryList = Array.from(allCatNamesSet);

  // Group filtered recipes by category, filtering out any categories with 0 recipes
  const groupedCategories = categoryList
    .map((catName) => {
      const catRecipes = filteredRecipes.filter(
        (r) =>
          r.category === catName ||
          categories.find((c) => c.id === r.category)?.name === catName
      );
      return {
        name: catName,
        recipes: catRecipes,
      };
    })
    .filter((group) => group.recipes.length > 0);

  // Uncategorized recipes if any
  const uncategorizedRecipes = filteredRecipes.filter((r) => !r.category || !r.category.trim());
  if (uncategorizedRecipes.length > 0) {
    groupedCategories.push({
      name: 'Chưa phân loại',
      recipes: uncategorizedRecipes,
    });
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#FFD9E8] via-[#FFF8FB] to-[#AEE9FF]/60 p-5 md:p-6 shadow-sm border border-pink-200/50">
        <div className="relative z-10 max-w-[240px] md:max-w-lg">
          {/* Live Clock & Full Date */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-slate-700 shadow-2xs mb-2 border border-pink-100/80">
            <Clock className="w-3.5 h-3.5 text-[#FF8FB8] shrink-0" />
            <span className="truncate">{formatVietnameseDateTime(now)}</span>
          </div>

          <div className="flex items-center gap-2 group">
            <h2 className="text-lg md:text-xl font-black text-slate-800 leading-tight">
              Xin chào, {userName || 'bạn'}! 👋
            </h2>
            <button
              onClick={handleOpenEditName}
              title="Đổi tên"
              className="p-1 rounded-lg text-slate-400 hover:text-[#FF8FB8] hover:bg-white/60 transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mt-1">
            Quản lý công thức bởi Đỗ Đức Huy
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

      {/* Recipe Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Bạn muốn tìm công thức nào"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-10 py-3 text-xs md:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:border-transparent shadow-2xs transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* First-time Access Name Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#FF8FB8] flex items-center justify-center mx-auto shadow-sm">
              <User className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-800">Chào mừng bạn! 👋</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Nhập tên của bạn để ứng dụng chào đón bạn mỗi khi sử dụng nhé:
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3 pt-1">
              <input
                type="text"
                autoFocus
                placeholder="Ví dụ: Huy, Chi, Chef..."
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all text-center"
              />

              <div className="flex gap-2">
                {userName && (
                  <button
                    type="button"
                    onClick={() => setIsNameModalOpen(false)}
                    className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!inputName.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-[#FF8FB8] hover:bg-pink-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content: Search Results mode OR Category Grouped mode */}
      {searchQuery.trim() !== '' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>Kết quả tìm kiếm</span>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#FF8FB8] text-[10px] font-extrabold">
                {filteredRecipes.length} công thức
              </span>
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
            >
              Xóa lọc
            </button>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-3 shadow-2xs">
              <Utensils className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-extrabold text-slate-700 text-sm">
                Không tìm thấy công thức nào phù hợp với &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs text-slate-400">Thử tìm kiếm với tên công thức, nguyên liệu hoặc danh mục khác.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors shadow-2xs"
              >
                Xóa từ khóa tìm kiếm
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe.id)}
                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex items-center gap-3.5"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-100/80 flex-shrink-0">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageOff className="w-4 h-4 opacity-40 mb-0.5 text-slate-500" />
                        <span className="text-[8px] font-extrabold text-slate-500">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Info Content */}
                  <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#FF8FB8] transition-colors truncate">
                        {recipe.title}
                      </h4>
                      {recipe.category && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200/60 truncate max-w-[140px]">
                          {recipe.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Cập nhật: {recipe.updatedAt}</span>
                      {recipe.rating ? (
                        <span className="font-bold text-amber-500 flex items-center gap-0.5">
                          ★ {recipe.rating}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF8FB8] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : groupedCategories.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-3 shadow-2xs">
          <Utensils className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-extrabold text-slate-700 text-sm">Chưa có công thức món ăn nào</h3>
          <p className="text-xs text-slate-400">Hãy thêm công thức đầu tiên của bạn để bắt đầu!</p>
          <button
            onClick={() => onNavigateToRecipes()}
            className="px-4 py-2 bg-[#FF8FB8] text-white font-bold text-xs rounded-xl hover:bg-pink-500 transition-colors shadow-2xs"
          >
            Đến trang Công thức
          </button>
        </div>
      ) : (
        groupedCategories.map((group) => (
          <div key={group.name} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-800">{group.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                  {group.recipes.length} món
                </span>
              </div>
              <button
                onClick={() => onNavigateToRecipes(group.name)}
                className="text-xs font-bold text-[#FF8FB8] hover:underline flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recipe Cards Horizontal Scrollable List for this Category */}
            <div className="flex overflow-x-auto gap-3 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
              {group.recipes.map((recipe) => (
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
        ))
      )}
    </div>
  );
};
