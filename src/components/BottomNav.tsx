import React from 'react';
import { Home, ChefHat, Settings, Wallet, Plus, Lock } from 'lucide-react';
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
}) => {
  const leftTabs = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: Home },
    { id: 'recipes' as ActiveTab, label: 'Công thức', icon: ChefHat },
  ];

  const rightTabs = [
    { id: 'browser' as ActiveTab, label: 'Thu/Chi', icon: Wallet },
    { id: 'settings' as ActiveTab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 max-w-[420px] w-[calc(100%-24px)] z-50 transition-all duration-300">
      {/* Liquid Glass Outer Floating Container */}
      <div className="relative w-full h-[68px] rounded-[30px] bg-white/45 backdrop-blur-2xl backdrop-saturate-200 border border-white/70 shadow-[0_16px_40px_-10px_rgba(255,143,184,0.35),0_0_1px_1px_rgba(255,255,255,0.8),inset_0_2px_4px_0_rgba(255,255,255,0.8),inset_0_-2px_4px_0_rgba(0,0,0,0.03)] flex items-center justify-between px-2.5 overflow-visible">
        {/* Liquid Specular Reflection Edge Lines */}
        <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
        <div className="absolute inset-0 rounded-[30px] bg-gradient-to-tr from-white/30 via-pink-100/10 to-white/40 pointer-events-none" />

        {/* Left Tabs */}
        <div className="flex items-center justify-around flex-1 gap-1 z-10">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center h-12 px-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-white/90 via-pink-100/40 to-white/70 border border-pink-300/60 text-[#FF4785] font-black shadow-[0_4px_14px_rgba(255,71,133,0.18),inset_0_1px_2px_rgba(255,255,255,0.9)] scale-105 backdrop-blur-xl'
                    : 'text-slate-500/80 hover:text-slate-800 hover:bg-white/40 font-semibold'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-all duration-300 ${
                    isActive ? 'scale-110 stroke-[2.5] drop-shadow-[0_2px_6px_rgba(255,71,133,0.35)]' : 'stroke-[1.8]'
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

        {/* Center Floating Liquid Crystal Gem Add Button */}
        <div className="relative -top-4 flex flex-col items-center px-1 z-20">
          {/* Subtle Outer Liquid Glow Halo */}
          <div className="absolute inset-0 w-13 h-13 rounded-full bg-pink-400/30 blur-md animate-pulse pointer-events-none" />

          <button
            onClick={() => {
              if (isAdmin) {
                onQuickAddClick?.();
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="group relative w-13 h-13 rounded-full bg-gradient-to-br from-[#FFAEC9] via-[#FF6295] to-[#FF2E70] text-white flex items-center justify-center shadow-[0_12px_28px_-4px_rgba(255,71,133,0.55),inset_0_2px_4px_rgba(255,255,255,0.95)] border-2 border-white/90 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Thêm nhanh"
            title="Thêm nhanh"
          >
            {/* Specular sheen curve inside button */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-9 h-4 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-t-full pointer-events-none" />
            <Plus className="w-6 h-6 stroke-[2.8] transition-transform duration-300 group-hover:rotate-90 drop-shadow-xs" />
          </button>
          <span className="text-[10px] text-pink-600 font-extrabold mt-0.5 drop-shadow-2xs">Thêm</span>
        </div>

        {/* Right Tabs */}
        <div className="flex items-center justify-around flex-1 gap-1 z-10">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center h-12 px-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-white/90 via-pink-100/40 to-white/70 border border-pink-300/60 text-[#FF4785] font-black shadow-[0_4px_14px_rgba(255,71,133,0.18),inset_0_1px_2px_rgba(255,255,255,0.9)] scale-105 backdrop-blur-xl'
                    : 'text-slate-500/80 hover:text-slate-800 hover:bg-white/40 font-semibold'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-4.5 h-4.5 transition-all duration-300 ${
                      isActive ? 'scale-110 stroke-[2.5] drop-shadow-[0_2px_6px_rgba(255,71,133,0.35)]' : 'stroke-[1.8]'
                    }`}
                  />
                  {!isAdmin && (
                    <span className="absolute -top-1 -right-2 w-3 h-3 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center border border-white text-[8px] shadow-xs">
                      <Lock className="w-2 h-2 stroke-[2.5]" />
                    </span>
                  )}
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


