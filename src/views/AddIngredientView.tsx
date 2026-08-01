import React, { useState } from 'react';
import { Upload, Check, Carrot, Sparkles, Search, Layers } from 'lucide-react';
import { IngredientItem, Category } from '../types';
import { PRESET_INGREDIENTS_LIBRARY, PresetIngredient } from '../data/presetIngredients';

interface AddIngredientViewProps {
  ingredientToEdit?: IngredientItem | null;
  ingredientCategories?: Category[];
  onSave: (ingredient: IngredientItem) => void;
  onCancel: () => void;
}

const PRESET_INGREDIENT_IMAGES = [
  'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80',
];

export const AddIngredientView: React.FC<AddIngredientViewProps> = ({
  ingredientToEdit,
  ingredientCategories = [],
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(ingredientToEdit?.name || '');
  const [unit, setUnit] = useState(ingredientToEdit?.unit || 'gram');
  const [category, setCategory] = useState(ingredientToEdit?.category || 'Thịt tươi');
  const [note, setNote] = useState(ingredientToEdit?.note || '');
  const [imageUrl, setImageUrl] = useState(
    ingredientToEdit?.imageUrl || PRESET_INGREDIENT_IMAGES[0]
  );
  const [isActive, setIsActive] = useState(ingredientToEdit?.isActive ?? true);

  // Preset library filter state
  const [libraryFilterCategory, setLibraryFilterCategory] = useState<string>('Tất cả');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  const libraryCategories = ['Tất cả', 'Thịt tươi', 'Rau củ & Rau thơm', 'Tinh bột', 'Gia vị', 'Đồ uống & Sữa'];

  const filteredPresetIngredients = PRESET_INGREDIENTS_LIBRARY.filter((item) => {
    const matchesCat = libraryFilterCategory === 'Tất cả' || item.category === libraryFilterCategory;
    const matchesSearch = item.name.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPreset = (preset: PresetIngredient) => {
    setName(preset.name);
    setUnit(preset.unit);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    if (preset.note) setNote(preset.note);

    setAutoFilledNotice(`Đã chọn tự động: "${preset.name}" (${preset.unit}) ✨`);
    setTimeout(() => setAutoFilledNotice(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên nguyên liệu!');
      return;
    }

    const item: IngredientItem = {
      id: ingredientToEdit?.id || `ing-${Date.now()}`,
      name,
      unit,
      category,
      note,
      imageUrl,
      isActive,
    };

    onSave(item);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-28 animate-fade-in">
      {/* Toast Notice */}
      {autoFilledNotice && (
        <div className="p-3 bg-pink-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-between animate-fade-in">
          <span>{autoFilledNotice}</span>
          <button type="button" onClick={() => setAutoFilledNotice(null)} className="text-pink-100 font-black">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: QUICK SELECT PRESET INGREDIENT LIST (GỢI Ý DANH SÁCH NGUYÊN LIỆU) */}
      <div className="bg-gradient-to-br from-pink-50/80 via-white to-amber-50/60 p-4 rounded-3xl border border-pink-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Danh sách nguyên liệu để chọn nhanh</h3>
              <p className="text-[11px] text-slate-500">Chạm vào nguyên liệu bên dưới để tự động điền</p>
            </div>
          </div>
        </div>

        {/* Search inside preset library */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm nguyên liệu mẫu..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {libraryCategories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setLibraryFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                libraryFilterCategory === cat
                  ? 'bg-[#FF8FB8] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-pink-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Preset Ingredients */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1 pt-1">
          {filteredPresetIngredients.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectPreset(item)}
              className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-pink-100 shadow-2xs hover:border-[#FF8FB8] hover:shadow-xs cursor-pointer transition-all active:scale-95 group"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF8FB8] transition-colors">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">{item.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Image Box */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Ảnh nguyên liệu
        </label>
        <div className="relative w-full h-36 rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/40 overflow-hidden flex flex-col items-center justify-center p-3 text-center cursor-pointer group hover:bg-pink-50 transition-colors">
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <Upload className="w-7 h-7 text-[#FF8FB8] mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs text-slate-700">Thêm ảnh nguyên liệu</span>
            </div>
          )}
        </div>

        {/* Preset ingredient photo selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-2">
          {PRESET_INGREDIENT_IMAGES.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setImageUrl(img)}
              className={`w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-all ${
                imageUrl === img ? 'border-[#FF8FB8] scale-105 shadow-sm' : 'border-transparent opacity-60'
              }`}
            >
              <img src={img} alt="Preset" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

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
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Đơn vị tính <span className="text-rose-500">*</span>
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
            >
              <option value="gram">gram (g)</option>
              <option value="kg">kilogram (kg)</option>
              <option value="ml">milliliter (ml)</option>
              <option value="lít">lít (l)</option>
              <option value="muỗng cà phê">muỗng cà phê (tsp)</option>
              <option value="muỗng canh">muỗng canh (tbsp)</option>
              <option value="chén / bát">chén / bát</option>
              <option value="quả">quả / trái</option>
              <option value="cái">cái</option>
              <option value="ổ">ổ</option>
              <option value="bó">bó</option>
              <option value="tép">tép</option>
              <option value="củ">củ</option>
            </select>
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
              <option value="Thịt tươi">Thịt tươi</option>
              <option value="Rau củ & Rau thơm">Rau củ & Rau thơm</option>
              <option value="Tinh bột">Tinh bột</option>
              <option value="Gia vị">Gia vị</option>
              <option value="Đồ uống & Sữa">Đồ uống & Sữa</option>
              <option value="Khác">Khác</option>
            </select>
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
