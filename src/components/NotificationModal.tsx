import React from 'react';
import { X, Bell, Check, Trash2, Plus, Pencil, Utensils, ShoppingCart, PiggyBank, Sparkles, CheckCheck } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onSelectRecipe?: (recipeId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
  onSelectRecipe,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'add':
        return <Plus className="w-4 h-4 text-emerald-600" />;
      case 'edit':
        return <Pencil className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'shopping':
        return <ShoppingCart className="w-4 h-4 text-purple-600" />;
      case 'expense':
        return <PiggyBank className="w-4 h-4 text-indigo-600" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-[#FF8FB8]" />;
    }
  };

  const getBadgeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'add':
        return 'bg-emerald-100 border-emerald-200';
      case 'edit':
        return 'bg-blue-100 border-blue-200';
      case 'delete':
        return 'bg-rose-100 border-rose-200';
      case 'shopping':
        return 'bg-purple-100 border-purple-200';
      case 'expense':
        return 'bg-indigo-100 border-indigo-200';
      case 'system':
      default:
        return 'bg-pink-100 border-pink-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/80 via-white to-purple-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF8FB8] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm">Thông báo hoạt động</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FF8FB8] text-white text-[10px] font-black">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Lịch sử thêm, chỉnh sửa & cập nhật công thức</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`font-bold flex items-center gap-1 transition-colors ${
                unreadCount > 0 ? 'text-[#FF8FB8] hover:text-pink-600' : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>

            <button
              onClick={onClearAll}
              className="font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-[#FF8FB8] flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 opacity-60" />
              </div>
              <h4 className="font-bold text-slate-700 text-xs">Chưa có thông báo nào</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Mọi hoạt động thêm công thức, chỉnh sửa hoặc thao tác hệ thống sẽ được ghi nhận tại đây!
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkAsRead(n.id);
                  if (n.recipeId && onSelectRecipe) {
                    onSelectRecipe(n.recipeId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3 ${
                  !n.isRead
                    ? 'bg-gradient-to-r from-pink-50/60 to-purple-50/30 border-pink-200/80 shadow-2xs'
                    : 'bg-white border-slate-100 hover:bg-slate-50/80'
                }`}
              >
                {/* Icon Badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${getBadgeStyle(n.type)}`}>
                  {getIcon(n.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${!n.isRead ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{n.message}</p>
                </div>

                {/* Unread Dot or Delete Button */}
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#FF8FB8] shrink-0" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                    title="Xóa thông báo này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
