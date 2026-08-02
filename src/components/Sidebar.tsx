import React from 'react';
import { Home, ChefHat, Carrot, LayoutGrid, Settings, Plus, Scale, ShieldCheck, Lock, Sparkles, Heart, ShoppingCart } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  recipesCount: number;
  ingredientsCount: number;
  categoriesCount: number;
  shoppingListUnboughtCount?: number;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
  onQuickAddClick?: () => void;
  onOpenUnitConverter?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  recipesCount,
  ingredientsCount,
  categoriesCount,
  shoppingListUnboughtCount,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onQuickAddClick,
  onOpenUnitConverter,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home, count: null },
    { id: 'recipes' as ActiveTab, label: 'Công thức', icon: ChefHat, count: recipesCount },
    { id: 'shopping_list' as ActiveTab, label: 'Đi chợ thông minh', icon: ShoppingCart, count: shoppingListUnboughtCount ?? null },
    { id: 'ingredients' as ActiveTab, label: 'Nguyên liệu', icon: Carrot, count: ingredientsCount },
    { id: 'categories' as ActiveTab, label: 'Danh mục', icon: LayoutGrid, count: categoriesCount },
    { id: 'settings' as ActiveTab, label: 'Cài đặt & Dữ liệu', icon: Settings, count: null },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between bg-white border-r border-pink-100/80 p-5 flex-shrink-0 min-h-full select-none shadow-sm">
      {/* Top Header & Branding */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF8FB8] to-[#FF6B9D] text-white flex items-center justify-center shadow-md shadow-pink-200">
            <ChefHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 text-base tracking-tight leading-snug flex items-center gap-1">
              <span>Bếp Nhà Huy</span>
              <Sparkles className="w-3.5 h-3.5 text-pink-400 fill-pink-400 inline" />
            </h1>
            <p className="text-[11px] font-semibold text-slate-400">
              Công thức & Giá vốn món ăn
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF8FB8] text-white shadow-md shadow-pink-200 scale-102'
                    : 'text-slate-600 hover:bg-pink-50/70 hover:text-pink-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={() => {
              if (isAdmin) {
                onQuickAddClick?.();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-300/40 hover:opacity-95 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm mới công thức</span>
          </button>

          <button
            onClick={onOpenUnitConverter}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/70 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Scale className="w-4 h-4 text-sky-500" />
            <span>Quy đổi đơn vị tính</span>
          </button>
        </div>
      </div>

      {/* Bottom Admin Card & Footer */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        {isAdmin ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  Quyền Admin
                </p>
                <p className="text-[11px] font-bold text-emerald-600">
                  Toàn quyền chỉnh sửa
                </p>
              </div>
            </div>
            <button
              onClick={onLogoutAdmin}
              className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              Thoát
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-pink-50 hover:border-pink-200 transition-all flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 group-hover:bg-pink-100 group-hover:text-pink-600 flex items-center justify-center transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider group-hover:text-pink-600">
                  Chế độ Khách
                </p>
                <p className="text-[11px] font-bold text-slate-700 group-hover:text-pink-700">
                  Nhấn để đăng nhập Admin
                </p>
              </div>
            </div>
          </button>
        )}

        <div className="text-center">
          <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
            <span>Phát triển bởi Đỗ Đức Huy</span>
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400 inline" />
          </p>
        </div>
      </div>
    </aside>
  );
};
