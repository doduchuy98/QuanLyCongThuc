import React from 'react';
import { ArrowLeft, Menu, Search, MoreVertical, Check, Pencil, Bell, Carrot, Sparkles, ShieldCheck, Lock, Cloud, Utensils, PiggyBank } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  title: string;
  marqueeText?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showMore?: boolean;
  onMoreClick?: () => void;
  showCheck?: boolean;
  onCheckClick?: () => void;
  showEdit?: boolean;
  onEditClick?: () => void;
  showBell?: boolean;
  onBellClick?: () => void;
  unreadCount?: number;
  showScale?: boolean;
  onScaleClick?: () => void;
  rightAction?: React.ReactNode;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
  isCloudSynced?: boolean;
  appMode?: AppMode;
  onToggleAppMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  marqueeText = 'Website lưu công thức món ăn & sổ thu chi cá nhân bởi Đỗ Đức Huy <3',
  showBack,
  onBack,
  showSearch,
  onSearchClick,
  showMenu,
  onMenuClick,
  showMore,
  onMoreClick,
  showCheck,
  onCheckClick,
  showEdit,
  onEditClick,
  showBell,
  onBellClick,
  unreadCount = 0,
  showScale,
  onScaleClick,
  rightAction,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  isCloudSynced = true,
  appMode = 'kitchen',
  onToggleAppMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-pink-100/80 shadow-xs transition-all">
      {/* Top Scrolling Marquee Banner */}
      <div className="w-full bg-gradient-to-r from-[#FF8FB8] via-[#FF6B9D] to-[#FF8FB8] text-white text-[11px] font-bold py-1.5 overflow-hidden shadow-2xs border-b border-pink-200/40">
        <div className="animate-marquee flex gap-10 whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
            {marqueeText}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
            {marqueeText}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
            {marqueeText}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
            {marqueeText}
          </span>
        </div>
      </div>

      <div className="px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all flex-shrink-0"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          {showMenu && (
            <button
              onClick={onMenuClick}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all flex-shrink-0"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate">
            {title}
          </h1>
        </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">


        {/* Cloud Online Sync Badge */}
        {isCloudSynced && (
          <div
            title="Dữ liệu đã tự động đồng bộ Cloud Firestore"
            className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 text-[10px] font-extrabold shadow-2xs"
          >
            <Cloud className="w-3 h-3 text-sky-500 animate-pulse" />
            <span>Cloud Sync</span>
          </div>
        )}

        {/* Admin Badge / Login Toggle */}
        {isAdmin ? (
          <button
            onClick={onLogoutAdmin}
            title="Nhấn để thoát quyền Admin"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold hover:bg-emerald-100 transition-all shadow-2xs"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>ADMIN</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            title="Đăng nhập quyền Admin"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/80 text-[10px] font-bold transition-all"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Admin</span>
          </button>
        )}

        {showScale && (
          <button
            onClick={onScaleClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-emerald-50 active:scale-95 transition-all"
            title="Quản lý nguyên liệu & Bảng tính"
          >
            <Carrot className="w-5 h-5 text-emerald-600" />
          </button>
        )}

        {showSearch && (
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            aria-label="Tìm kiếm"
          >
            <Search className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {showBell && (
          <button
            onClick={onBellClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all relative"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 bg-[#FF8FB8] text-white text-[9px] font-black rounded-full min-w-[16px] text-center leading-none shadow-2xs border border-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {showEdit && (
          <button
            onClick={onEditClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {showCheck && (
          <button
            onClick={onCheckClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all"
            aria-label="Lưu"
          >
            <Check className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {showMore && (
          <button
            onClick={onMoreClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            aria-label="Thêm tùy chọn"
          >
            <MoreVertical className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {rightAction}
      </div>
    </div>
  </header>
  );
};
