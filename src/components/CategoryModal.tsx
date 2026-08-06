import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Utensils,
  Coffee,
  IceCream,
  Soup,
  Cookie,
  Flame,
  Fish,
  Apple,
  Carrot,
  Wheat,
  Beef,
  Milk,
  Scale,
  Droplets,
  Box,
  Sparkles,
  Heart,
  Tag,
  Star,
  Folder,
  UtensilsCrossed,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  defaultType?: 'recipe' | 'ingredient' | 'unit';
  onSave: (category: Category, oldName?: string) => void;
}

export const ICON_OPTIONS = [
  { name: 'Utensils', label: 'Dụng cụ / Món ăn', icon: Utensils },
  { name: 'Coffee', label: 'Cà phê / Đồ uống', icon: Coffee },
  { name: 'IceCream', label: 'Kem / Tráng miệng', icon: IceCream },
  { name: 'Soup', label: 'Súp / Khai vị', icon: Soup },
  { name: 'Cookie', label: 'Bánh / Ăn vặt', icon: Cookie },
  { name: 'Flame', label: 'Món nướng / Cay', icon: Flame },
  { name: 'Fish', label: 'Hải sản / Cá', icon: Fish },
  { name: 'Beef', label: 'Thịt tươi', icon: Beef },
  { name: 'Carrot', label: 'Rau củ', icon: Carrot },
  { name: 'Apple', label: 'Trái cây', icon: Apple },
  { name: 'Wheat', label: 'Tinh bột / Gạo', icon: Wheat },
  { name: 'Milk', label: 'Sữa & Đồ uống', icon: Milk },
  { name: 'Scale', label: 'Trọng lượng (gram/kg)', icon: Scale },
  { name: 'Droplets', label: 'Thể tích (ml/lít)', icon: Droplets },
  { name: 'UtensilsCrossed', label: 'Đơn vị thìa / chén', icon: UtensilsCrossed },
  { name: 'Box', label: 'Đơn vị cái / hộp', icon: Box },
  { name: 'Sparkles', label: 'Gia vị / Khác', icon: Sparkles },
  { name: 'Tag', label: 'Nhãn danh mục', icon: Tag },
  { name: 'Heart', label: 'Món yêu thích', icon: Heart },
  { name: 'Star', label: 'Đặc sản', icon: Star },
  { name: 'Folder', label: 'Thư mục', icon: Folder },
];

export const COLOR_PRESETS = [
  { hex: '#FFECA8', label: 'Vàng kem' },
  { hex: '#AEE9FF', label: 'Xanh dương nhạt' },
  { hex: '#FFD9E8', label: 'Hồng nhạt' },
  { hex: '#D9F7BE', label: 'Xanh lá mạ' },
  { hex: '#FFC8A2', label: 'Cam đào' },
  { hex: '#FFF0F5', label: 'Tím nhạt' },
  { hex: '#E8DEF8', label: 'Tím lavender' },
  { hex: '#E0F2FE', label: 'Xanh da trời' },
  { hex: '#FEE2E2', label: 'Đỏ nhạt' },
  { hex: '#F3F4F6', label: 'Xám trung tính' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  defaultType = 'recipe',
  onSave,
}) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Utensils');
  const [bgColor, setBgColor] = useState('#FFECA8');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setIconName(categoryToEdit.iconName || 'Utensils');
      setBgColor(categoryToEdit.bgColor || '#FFECA8');
    } else {
      setName('');
      setIconName('Utensils');
      setBgColor('#FFECA8');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    const created: Category = {
      id: categoryToEdit?.id || `cat-${Date.now()}`,
      name: name.trim(),
      type: 'recipe',
      iconName,
      bgColor,
      recipeCount: categoryToEdit?.recipeCount ?? 0,
      itemCount: categoryToEdit?.itemCount ?? 0,
    };

    onSave(created, categoryToEdit?.name);
    onClose();
  };

  const SelectedIconComp = ICON_OPTIONS.find((i) => i.name === iconName)?.icon || Tag;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-pink-100 animate-scale-up space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs border border-black/5"
              style={{ backgroundColor: bgColor }}
            >
              <SelectedIconComp className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {categoryToEdit ? 'Chỉnh sửa danh mục món ăn' : 'Thêm danh mục món ăn'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Danh mục phân loại công thức món ăn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 no-scrollbar flex-1">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nhập tên danh mục (Ví dụ: Món nướng, Trái cây, Tráng miệng...)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn biểu tượng (Icon)
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200/80 no-scrollbar">
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIconName(item.name)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FF8FB8] text-white shadow-xs scale-105'
                        : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-200/60'
                    }`}
                    title={item.label}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Màu nền thẻ danh mục
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = bgColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    type="button"
                    key={preset.hex}
                    onClick={() => setBgColor(preset.hex)}
                    style={{ backgroundColor: preset.hex }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform ${
                      isSelected
                        ? 'border-slate-800 scale-110 shadow-sm'
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={preset.label}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-800 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{categoryToEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
