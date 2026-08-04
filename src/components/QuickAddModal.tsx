import React from 'react';
import { ChefHat, LayoutGrid, Scale, Settings, X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: () => void;
  onAddCategory?: () => void;
  onOpenUnitConverter: () => void;
  onOpenSettings: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddRecipe,
  onAddCategory,
  onOpenUnitConverter,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:p-4 pb-28 sm:pb-6 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal content bottom sheet */}
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[32px] p-6 shadow-2xl z-10 border-t border-pink-100 animate-slide-up">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#FF8FB8] rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Tạo mới & Tiện ích</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => {
              onClose();
              onAddRecipe();
            }}
            className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-[#FFD9E8] to-[#FFF0F5] border border-pink-200/50 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF8FB8] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <ChefHat className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Thêm công thức</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Tạo món ăn mới</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenUnitConverter();
            }}
            className="flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br from-[#D9F7BE]/60 to-[#F6FFED] border border-emerald-200/50 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Quy đổi đơn vị</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Quy đổi định lượng</span>
          </button>
        </div>

        {/* Settings row button */}
        <button
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">Cài đặt & Sao lưu dữ liệu</span>
          </div>
          <span className="text-xs text-[#FF8FB8] font-bold">Mở ngay &rarr;</span>
        </button>
      </div>
    </div>
  );
};
