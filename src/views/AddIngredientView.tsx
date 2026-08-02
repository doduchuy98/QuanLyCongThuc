import React, { useState } from 'react';
import { Upload, Check, Carrot, Sparkles, Search, Layers, AlertTriangle, AlertCircle } from 'lucide-react';
import { IngredientItem, Category } from '../types';
import { PRESET_INGREDIENTS_LIBRARY, PresetIngredient } from '../data/presetIngredients';
import { matchesSearch, removeVietnameseTones } from '../utils/stringUtils';

interface AddIngredientViewProps {
  ingredientToEdit?: IngredientItem | null;
  ingredientCategories?: Category[];
  existingIngredients?: IngredientItem[];
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
  existingIngredients = [],
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(ingredientToEdit?.name || '');
  const [unit, setUnit] = useState(ingredientToEdit?.unit || 'gram');
  const [category, setCategory] = useState(ingredientToEdit?.category || 'Thịt tươi');
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(ingredientToEdit?.pricePerUnit ?? '');
  const [note, setNote] = useState(ingredientToEdit?.note || '');
  const [imageUrl, setImageUrl] = useState(
    ingredientToEdit?.imageUrl || PRESET_INGREDIENT_IMAGES[0]
  );
  const [isActive, setIsActive] = useState(ingredientToEdit?.isActive ?? true);
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  // Preset library filter state
  const [libraryFilterCategory, setLibraryFilterCategory] = useState<string>('Tất cả');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  const libraryCategories = ['Tất cả', 'Thịt tươi', 'Rau củ & Rau thơm', 'Tinh bột', 'Gia vị', 'Đồ uống & Sữa'];

  // Check duplicate ingredient name (accent & tone insensitive)
  const normalizedName = removeVietnameseTones(name.trim());
  const duplicateMatch = normalizedName
    ? existingIngredients.find(
        (item) => item.id !== ingredientToEdit?.id && removeVietnameseTones(item.name.trim()) === normalizedName
      )
    : null;

  const filteredPresetIngredients = PRESET_INGREDIENTS_LIBRARY.filter((item) => {
    const matchesCat = libraryFilterCategory === 'Tất cả' || item.category === libraryFilterCategory;
    const matchesSearchQuery = matchesSearch(item.name, librarySearch);
    return matchesCat && matchesSearchQuery;
  });

  const handleSelectPreset = (preset: PresetIngredient) => {
    setName(preset.name);
    setUnit(preset.unit);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    if (preset.pricePerUnit !== undefined) setPricePerUnit(preset.pricePerUnit);
    if (preset.note) setNote(preset.note);

    const isDup = existingIngredients.some(
      (i) => i.id !== ingredientToEdit?.id && removeVietnameseTones(i.name.trim()) === removeVietnameseTones(preset.name.trim())
    );

    if (isDup) {
      setAutoFilledNotice(`⚠️ Nguyên liệu "${preset.name}" đã có trong danh sách nguyên liệu của bạn!`);
    } else {
      const priceText = preset.pricePerUnit ? ` • Giá: ${preset.pricePerUnit.toLocaleString('vi-VN')}đ/${preset.unit}` : '';
      setAutoFilledNotice(`Đã chọn tự động: "${preset.name}" (${preset.unit})${priceText} ✨`);
    }
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert('Vui lòng nhập tên nguyên liệu!');
      return;
    }

    if (duplicateMatch) {
      alert(`⚠️ Nguyên liệu "${duplicateMatch.name}" đã tồn tại trong danh sách! (Đơn vị: ${duplicateMatch.unit}, Danh mục: ${duplicateMatch.category}). Vui lòng chọn tên khác.`);
      return;
    }

    const item: IngredientItem = {
      id: ingredientToEdit?.id || `ing-${Date.now()}`,
      name: trimmedName,
      unit,
      category,
      pricePerUnit: pricePerUnit === '' ? undefined : Number(pricePerUnit),
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
          {filteredPresetIngredients.map((item, idx) => {
            const isAlreadyAdded = existingIngredients.some(
              (ex) => ex.id !== ingredientToEdit?.id && removeVietnameseTones(ex.name.trim()) === removeVietnameseTones(item.name.trim())
            );

            return (
              <div
                key={idx}
                onClick={() => handleSelectPreset(item)}
                className={`flex items-center gap-2 p-2 rounded-2xl bg-white border shadow-2xs hover:border-[#FF8FB8] hover:shadow-xs cursor-pointer transition-all active:scale-95 group relative overflow-hidden ${
                  isAlreadyAdded ? 'border-amber-200 bg-amber-50/20' : 'border-pink-100'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 justify-between">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#FF8FB8] transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className="text-[10px] text-slate-400 font-medium truncate">{item.unit}</p>
                    {isAlreadyAdded && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-black flex-shrink-0">
                        Đã có
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              <span className="text-slate-700">Đơn vị: <span className="text-rose-950 font-extrabold">{duplicateMatch.unit}</span> • Loại: <span className="text-rose-950 font-extrabold">{duplicateMatch.category}</span></span>
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
            {isCustomUnit ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  placeholder="Nhập đơn vị mới..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustomUnit(false)}
                  className="px-2.5 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
                  title="Chọn từ danh sách"
                >
                  Danh sách
                </button>
              </div>
            ) : (
              <select
                value={unit}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomUnit(true);
                  } else {
                    setUnit(e.target.value);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
              >
                <option value="gram">gram (g)</option>
                <option value="kg">kilogram (kg)</option>
                <option value="ml">milliliter (ml)</option>
                <option value="lít">lít (l)</option>
                <option value="muỗng cà phê">muỗng cà phê (tsp)</option>
                <option value="muỗng canh">muỗng canh (tbsp)</option>
                <option value="quả">quả / trái</option>
                <option value="củ">củ</option>
                <option value="tép">tép</option>
                <option value="ổ">ổ</option>
                <option value="bát">bát / chén</option>
                <option value="lát">lát</option>
                <option value="miếng">miếng</option>
                <option value="gói">gói</option>
                <option value="hộp">hộp</option>
                <option value="chai">chai</option>
                <option value="lon">lon</option>
                <option value="bó">bó</option>
                <option value="nguyên con">nguyên con</option>
                <option value="cái">cái</option>
                {unit && !['gram', 'kg', 'ml', 'lít', 'muỗng cà phê', 'muỗng canh', 'quả', 'củ', 'tép', 'ổ', 'bát', 'lát', 'miếng', 'gói', 'hộp', 'chai', 'lon', 'bó', 'nguyên con', 'cái'].includes(unit) && (
                  <option value={unit}>{unit}</option>
                )}
                <option value="__custom__">✍️ Tự nhập đơn vị khác...</option>
              </select>
            )}
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
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setPricePerUnit(260)}
                className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] hover:bg-emerald-200 transition-colors"
              >
                Gợi ý 260.000đ/kg &rarr; 260đ/g
              </button>
              <button
                type="button"
                onClick={() => setPricePerUnit(140)}
                className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] hover:bg-emerald-200 transition-colors"
              >
                Gợi ý 140.000đ/kg &rarr; 140đ/g
              </button>
            </div>
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
