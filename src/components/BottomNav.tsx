import React from 'react';
import { Home, ChefHat, Carrot, ShoppingCart, Plus } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAddClick?: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  shoppingListUnboughtCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAddClick,
  isAdmin,
  onOpenAdminLogin,
  shoppingListUnboughtCount = 0,
}) => {
  const leftTabs = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'recipes' as ActiveTab, label: 'Công thức', icon: ChefHat },
  ];

  const rightTabs = [
    { id: 'shopping_list' as ActiveTab, label: 'Đi chợ', icon: ShoppingCart, badge: shoppingListUnboughtCount },
    { id: 'ingredients' as ActiveTab, label: 'Nguyên liệu', icon: Carrot },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white/95 backdrop-blur-md border-t border-pink-100/80 h-[68px] z-50 flex items-center justify-between px-3 shadow-[0_-4px_25px_rgba(255,143,184,0.15)]">
      {/* Left Tabs */}
      <div className="flex items-center justify-around flex-1">
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#FF8FB8] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                }`}
              />
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-[#FF8FB8] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Center + Quick Add Button */}
      <div className="relative -top-4 flex flex-col items-center px-1">
        <button
          onClick={() => {
            if (isAdmin) {
              onQuickAddClick?.();
            } else if (onOpenAdminLogin) {
              onOpenAdminLogin();
            }
          }}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#FF8FB8] to-[#FF6B9D] text-white flex items-center justify-center shadow-lg shadow-pink-300/60 hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-white"
          aria-label="Thêm nhanh"
          title="Thêm nhanh"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
        <span className="text-[10px] text-pink-500 font-bold mt-0.5">Thêm</span>
      </div>

      {/* Right Tabs */}
      <div className="flex items-center justify-around flex-1">
        {rightTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasBadge = (tab.badge ?? 0) > 0;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#FF8FB8] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                  }`}
                />
                {hasBadge && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-[#FF8FB8] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

