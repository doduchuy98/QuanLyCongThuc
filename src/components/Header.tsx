import React from 'react';
import { ArrowLeft, Menu, Search, MoreVertical, Check, Pencil, Bell, Scale } from 'lucide-react';

interface HeaderProps {
  title: string;
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
  showScale?: boolean;
  onScaleClick?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
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
  showScale,
  onScaleClick,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-pink-100/60 px-4 h-14 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate max-w-[200px]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {showScale && (
          <button
            onClick={onScaleClick}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-pink-50 active:scale-95 transition-all"
            title="Quy đổi đơn vị"
          >
            <Scale className="w-5 h-5 text-pink-500" />
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
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
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
    </header>
  );
};
