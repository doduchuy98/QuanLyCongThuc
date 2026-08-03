import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { IngredientItem, Category } from '../types';
import { removeVietnameseTones, capitalizeWords } from '../utils/stringUtils';

interface AddIngredientViewProps {
  ingredientToEdit?: IngredientItem | null;
  ingredientCategories?: Category[];
  unitCategories?: Category[];
  existingIngredients?: IngredientItem[];
  onSave: (ingredient: IngredientItem) => void;
  onAddCategory?: (category: Category) => void;
  onCancel: () => void;
}

export const AddIngredientView: React.FC<AddIngredientViewProps> = ({
  ingredientToEdit,
  ingredientCategories = [],
  unitCategories = [],
  existingIngredients = [],
  onSave,
  onAddCategory,
  onCancel,
}) => {
  const [name, setName] = useState(ingredientToEdit?.name || '');
  const [unit, setUnit] = useState(ingredientToEdit?.unit || '');
  const [category, setCategory] = useState(
    ingredientToEdit?.category || (ingredientCategories.length > 0 ? ingredientCategories[0].name : '')
  );
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(ingredientToEdit?.pricePerUnit ?? '');
  const [note, setNote] = useState(ingredientToEdit?.note || '');
  const [imageUrl, setImageUrl] = useState(ingredientToEdit?.imageUrl || '');
  const [isActive, setIsActive] = useState(ingredientToEdit?.isActive ?? true);

  // Check duplicate ingredient name (accent & tone insensitive)
  const normalizedName = removeVietnameseTones(name.trim());
  const duplicateMatch = normalizedName
    ? existingIngredients.find(
        (item) => item.id !== ingredientToEdit?.id && removeVietnameseTones(item.name.trim()) === normalizedName
      )
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert('Vui lòng nhập tên nguyên liệu!');
      return;
    }

    if (!unit.trim()) {
      alert('Vui lòng nhập đơn vị tính!');
      return;
    }

    if (duplicateMatch) {
      alert(`⚠️ Nguyên liệu "${duplicateMatch.name}" đã tồn tại trong danh sách! (Đơn vị: ${duplicateMatch.unit}, Danh mục: ${duplicateMatch.category}). Vui lòng chọn tên khác.`);
      return;
    }

    const cleanUnit = unit.trim();
    if (cleanUnit && onAddCategory && !unitCategories.some((u) => u.name.toLowerCase() === cleanUnit.toLowerCase())) {
      onAddCategory({
        id: `ucat-${Date.now()}`,
        name: cleanUnit,
        type: 'unit',
        iconName: 'Ruler',
        bgColor: '#AEE9FF',
      });
    }

    const item: IngredientItem = {
      id: ingredientToEdit?.id || `ing-${Date.now()}`,
      name: trimmedName,
      unit: cleanUnit,
      category: category || (ingredientCategories[0]?.name || ''),
      pricePerUnit: pricePerUnit === '' ? undefined : Number(pricePerUnit),
      note,
      imageUrl,
      isActive,
    };

    onSave(item);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-28 animate-fade-in">
      {/* Duplicate Ingredient Warning Card */}
      {duplicateMatch && (
        <div className="p-4 bg-rose-50/90 border-2 border-rose-300 rounded-3xl flex items-start gap-3 text-rose-900 shadow-sm animate-fade-in">
          <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-rose-950 text-xs sm:text-sm">
                ⚠️ Nguyên liệu đã tồn tại!
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black">
                Bị trùng tên
              </span>
            </div>
            <p className="text-rose-800 font-semibold mt-1 leading-relaxed">
              Nguyên liệu <span className="font-black underline text-rose-950">"{duplicateMatch.name}"</span> đã có sẵn trong hệ thống danh mục.
            </p>
            <div className="mt-2 p-2 bg-white/80 rounded-xl border border-rose-200 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-700">
                Đơn vị: <span className="text-rose-950 font-extrabold">{duplicateMatch.unit}</span> • Loại: <span className="text-rose-950 font-extrabold">{duplicateMatch.category}</span>
              </span>
              {duplicateMatch.pricePerUnit ? (
                <span className="text-emerald-700 font-extrabold">{duplicateMatch.pricePerUnit.toLocaleString('vi-VN')}đ/{duplicateMatch.unit}</span>
              ) : (
                <span className="text-slate-400 font-normal">Chưa có giá</span>
              )}
            </div>
            <p className="text-[11px] text-rose-700 font-medium mt-1.5">
              💡 Vui lòng nhập tên khác hoặc hủy để quay lại danh sách nguyên liệu.
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-3.5 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tên nguyên liệu <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nhập tên nguyên liệu..."
            value={name}
            onChange={(e) => setName(capitalizeWords(e.target.value))}
            className={`w-full bg-slate-50 border rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
              duplicateMatch
                ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
                : 'border-slate-200 focus:ring-[#FF8FB8]'
            }`}
          />
          {duplicateMatch && (
            <div className="flex items-center gap-1.5 mt-1.5 text-rose-600 font-bold text-xs animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>Nguyên liệu "{duplicateMatch.name}" đã tồn tại trong danh sách!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đơn vị tính <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="ingredient-units-datalist"
              placeholder="Nhập đơn vị (VD: g, kg, ml, cái...)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
            />
            <datalist id="ingredient-units-datalist">
              {unitCategories.map((u) => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Danh mục nguyên liệu
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
            >
              {ingredientCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              {category && !ingredientCategories.some((c) => c.name === category) && (
                <option value={category}>{category}</option>
              )}
              {ingredientCategories.length === 0 && (
                <option value="">Chưa có danh mục</option>
              )}
            </select>
          </div>
        </div>

        {/* Price Section with Quick Converter */}
        <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-emerald-900">
              Đơn giá vốn (VNĐ / {unit || 'đơn vị'}) <span className="text-emerald-600 font-normal">(dùng tính giá vốn món)</span>
            </label>
            {pricePerUnit !== '' && Number(pricePerUnit) > 0 && (
              <span className="text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                {Number(pricePerUnit).toLocaleString('vi-VN')} đ / {unit}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              placeholder="VD: 260 (nghĩa là 260đ / 1 gram)"
              value={pricePerUnit}
              onChange={(e) => {
                const val = e.target.value;
                setPricePerUnit(val === '' ? '' : Number(val));
              }}
              className="w-full bg-white border border-emerald-200 rounded-2xl pl-3.5 pr-14 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-black text-emerald-600">
              VNĐ
            </span>
          </div>

          {/* Quick Price Calculator Tip */}
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200/60 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-emerald-800 flex items-center gap-1">
              💡 Mẹo tính nhanh đơn giá:
            </p>
            <p className="text-[10.5px] text-slate-500 leading-relaxed">
              Nếu bạn mua <span className="font-bold text-slate-700">1kg (1.000g)</span> giá <span className="font-bold text-slate-700">260.000đ</span> &rarr; nhập đơn giá là <span className="font-bold text-emerald-600">260</span> (260.000 / 1.000).
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Ghi chú
          </label>
          <textarea
            rows={2}
            placeholder="Nhập ghi chú (nếu có)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white resize-none"
          />
        </div>

        {/* Status Switch Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Trạng thái</span>
            <span className="text-[11px] text-slate-400">
              {isActive ? 'Hoạt động (Đang sử dụng)' : 'Ẩn'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isActive ? 'bg-[#FF8FB8]' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Lưu nguyên liệu</span>
        </button>
      </div>
    </form>
  );
};
