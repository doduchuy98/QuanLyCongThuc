import React from 'react';
import { Home, ChefHat, LayoutGrid, Globe, Plus } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAddClick?: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAddClick,
  isAdmin,
  onOpenAdminLogin,
}) => {
  const leftTabs = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'recipes' as ActiveTab, label: 'Công thức', icon: ChefHat },
  ];

  const rightTabs = [
    { id: 'browser' as ActiveTab, label: 'Duyệt web', icon: Globe },
    { id: 'categories' as ActiveTab, label: 'Danh mục', icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 max-w-[420px] w-[calc(100%-24px)] z-50 transition-all duration-300">
      {/* Liquid Glass Outer Floating Container */}
      <div className="relative w-full h-[66px] rounded-[28px] bg-white/60 backdrop-blur-xl backdrop-saturate-200 border border-white/80 shadow-[0_12px_40px_-8px_rgba(255,143,184,0.28),inset_0_1.5px_2px_0_rgba(255,255,255,0.9)] flex items-center justify-between px-2.5 overflow-visible">
        {/* Top Liquid Specular Reflection Edge */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-full pointer-events-none" />

        {/* Left Tabs */}
        <div className="flex items-center justify-around flex-1 gap-1">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center h-12 px-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-pink-500/15 via-rose-400/20 to-pink-500/10 border border-pink-300/50 text-[#FF4785] font-black shadow-xs scale-105 backdrop-blur-md'
                    : 'text-slate-500/80 hover:text-slate-800 hover:bg-white/40 font-semibold'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-all duration-300 ${
                    isActive ? 'scale-110 stroke-[2.5] drop-shadow-[0_2px_6px_rgba(255,71,133,0.3)]' : 'stroke-[1.8]'
                  }`}
                />
                <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-[#FF4785] rounded-full shadow-[0_0_8px_#FF4785] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Center Floating Liquid Gem Add Button */}
        <div className="relative -top-4 flex flex-col items-center px-1">
          <button
            onClick={() => {
              if (isAdmin) {
                onQuickAddClick?.();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="group relative w-13 h-13 rounded-full bg-gradient-to-br from-[#FF9EBF] via-[#FF6B9D] to-[#FF3B7B] text-white flex items-center justify-center shadow-[0_10px_25px_-4px_rgba(255,107,157,0.55),inset_0_1px_2px_rgba(255,255,255,0.8)] border-2 border-white/90 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Thêm nhanh"
            title="Thêm nhanh"
          >
            {/* Specular sheen curve inside button */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none" />
            <Plus className="w-6 h-6 stroke-[2.8] transition-transform duration-300 group-hover:rotate-90 drop-shadow-xs" />
          </button>
          <span className="text-[10px] text-pink-600 font-extrabold mt-0.5 drop-shadow-2xs">Thêm</span>
        </div>

        {/* Right Tabs */}
        <div className="flex items-center justify-around flex-1 gap-1">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center h-12 px-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-pink-500/15 via-rose-400/20 to-pink-500/10 border border-pink-300/50 text-[#FF4785] font-black shadow-xs scale-105 backdrop-blur-md'
                    : 'text-slate-500/80 hover:text-slate-800 hover:bg-white/40 font-semibold'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4.5 h-4.5 transition-all duration-300 ${
                      isActive ? 'scale-110 stroke-[2.5] drop-shadow-[0_2px_6px_rgba(255,71,133,0.3)]' : 'stroke-[1.8]'
                    }`}
                  />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1.5 h-1.5 bg-[#FF4785] rounded-full shadow-[0_0_8px_#FF4785] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};


