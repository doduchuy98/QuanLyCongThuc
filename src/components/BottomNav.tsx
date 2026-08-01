import React from 'react';
import { Home, ChefHat, Carrot, LayoutGrid, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAddClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'recipes' as ActiveTab, label: 'Công thức', icon: ChefHat },
    { id: 'ingredients' as ActiveTab, label: 'Nguyên liệu', icon: Carrot },
    { id: 'categories' as ActiveTab, label: 'Danh mục', icon: LayoutGrid },
    { id: 'settings' as ActiveTab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full bg-white border-t border-pink-100 h-[72px] z-50 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(255,143,184,0.12)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 ${
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
            <span className="text-[11px] mt-0.5 tracking-tight leading-none">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 bg-[#FF8FB8] rounded-full mt-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
