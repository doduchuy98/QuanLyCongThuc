import React, { useState } from 'react';
import { Upload, Plus, Trash2, Check, Sparkles, Search, Carrot, X, ImageOff, Coins } from 'lucide-react';
import { Category, IngredientItem, Recipe, RecipeIngredient, CookingStep } from '../types';
import { calculateRecipeTotalCost, getIngredientCostDetails, formatCurrency } from '../utils/costUtils';
import { matchesSearch } from '../utils/stringUtils';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface AddEditRecipeViewProps {
  recipeToEdit?: Recipe | null;
  categories: Category[];
  availableIngredients: IngredientItem[];
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

const PRESET_DISH_IMAGES = [
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626804475297-41608e074eb1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
];

const COMMON_UNITS = [
  'gram',
  'kg',
  'ml',
  'lít',
  'muỗng cà phê',
  'muỗng canh',
  'quả',
  'củ',
  'tép',
  'ổ',
  'bát',
  'chén',
  'lát',
  'miếng',
  'gói',
  'hộp',
  'chai',
  'lon',
  'bó',
  'nguyên con',
  'cái'
];

export const AddEditRecipeView: React.FC<AddEditRecipeViewProps> = ({
  recipeToEdit,
  categories,
  availableIngredients,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [category, setCategory] = useState(recipeToEdit?.category || categories[0]?.name || 'Món chính');
  const [description, setDescription] = useState(recipeToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(recipeToEdit?.imageUrl || '');
  const [isActive, setIsActive] = useState(recipeToEdit?.isActive ?? true);
  const [portionLabel, setPortionLabel] = useState(recipeToEdit?.portionLabel || '1 phần');
  const [customUnitRows, setCustomUnitRows] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'ingredient' | 'step'; index: number; name: string } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh tối đa là 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    recipeToEdit?.ingredients || [
      { ingredientId: availableIngredients[0]?.id || 'ing-1', ingredientName: availableIngredients[0]?.name || 'Thịt bò tái', amount: 100, unit: 'gram' },
    ]
  );

  const [steps, setSteps] = useState<CookingStep[]>(
    recipeToEdit?.steps || [
      { stepNumber: 1, title: 'Sơ chế nguyên liệu', description: 'Rửa sạch nguyên liệu và xắt nhỏ.', isDone: false },
      { stepNumber: 2, title: 'Nấu nướng', description: 'Nấu theo trình tự nhiệt độ phù hợp.', isDone: false },
    ]
  );

  // Ingredient picker modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('Tất cả');

  const ingredientCategories = ['Tất cả', ...Array.from(new Set(availableIngredients.map((i) => i.category || 'Khác')))];

  const filteredAvailableIngredients = availableIngredients.filter((ing) => {
    const matchesCat = pickerCategoryFilter === 'Tất cả' || ing.category === pickerCategoryFilter;
    const matchesQuery = matchesSearch(ing.name, pickerSearch) || matchesSearch(ing.category, pickerSearch);
    return matchesCat && matchesQuery;
  });

  const handleSelectFromPicker = (ingItem: IngredientItem) => {
    // Check if already in list
    const exists = ingredients.some((i) => i.ingredientId === ingItem.id);
    if (exists) {
      alert(`Nguyên liệu "${ingItem.name}" đã có trong danh sách rồi nè!`);
      return;
    }

    setIngredients([
      ...ingredients,
      {
        ingredientId: ingItem.id,
        ingredientName: ingItem.name,
        amount: ingItem.unit === 'gram' || ingItem.unit === 'ml' ? 100 : 1,
        unit: ingItem.unit,
      },
    ]);

    setIsPickerOpen(false);
  };

  const handleAddIngredientRow = () => {
    const firstIng = availableIngredients[0];
    setIngredients([
      ...ingredients,
      {
        ingredientId: firstIng?.id || `ing-${Date.now()}`,
        ingredientName: firstIng?.name || 'Nguyên liệu mới',
        amount: 50,
        unit: firstIng?.unit || 'gram',
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    if (field === 'ingredientId') {
      const found = availableIngredients.find((i) => i.id === value);
      if (found) {
        updated[index].ingredientId = found.id;
        updated[index].ingredientName = found.name;
        updated[index].unit = found.unit;
      }
    } else {
      (updated[index] as any)[field] = value;
    }
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    setSteps([
      ...steps,
      {
        stepNumber: nextNum,
        title: `Bước ${nextNum}: Quy trình tiếp theo`,
        description: 'Nhập hướng dẫn...',
        isDone: false,
      },
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof CookingStep, value: any) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên công thức món ăn!');
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

    const newRecipe: Recipe = {
      id: recipeToEdit?.id || `rec-${Date.now()}`,
      title,
      category,
      imageUrl,
      description,
      isActive,
      updatedAt: formattedDate,
      portionLabel,
      ingredients,
      steps,
      prepTimeMinutes: recipeToEdit?.prepTimeMinutes || 20,
      cookTimeMinutes: recipeToEdit?.cookTimeMinutes || 30,
    };

    onSave(newRecipe);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-28 animate-fade-in">
      {/* Upload Image Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Ảnh món ăn
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa ảnh (No image)</span>
            </button>
          )}
        </div>

        <div className="relative w-full h-44 rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/40 overflow-hidden flex flex-col items-center justify-center p-3 text-center group hover:bg-pink-50 transition-colors">
          {imageUrl ? (
            <div className="relative w-full h-full">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
              <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded-2xl">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">Thay đổi ảnh</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center text-slate-400 cursor-pointer w-full h-full">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-[#FF8FB8] mb-1.5 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-700">Tải ảnh lên từ máy / điện thoại</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Nhấp vào đây để chọn file ảnh (Nếu không tải sẽ để "No image")</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* URL input and preset image options */}
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Hoặc dán URL liên kết ảnh (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">Ảnh mẫu:</span>
            {PRESET_DISH_IMAGES.map((img, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setImageUrl(img)}
                className={`w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${
                  imageUrl === img ? 'border-[#FF8FB8] scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tên công thức <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nhập tên công thức món ăn"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Danh mục món ăn <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white"
          >
            {categories.filter(c => c.type !== 'ingredient').map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mô tả món ăn
          </label>
          <textarea
            rows={2}
            placeholder="Nhập mô tả ngắn về công thức món ăn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white resize-none"
          />
        </div>

        {/* Status Switch Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Trạng thái</span>
            <span className="text-[11px] text-slate-400">
              {isActive ? 'Hoạt động (Hiển thị)' : 'Ẩn (Tắt)'}
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

      {/* Ingredients List Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Thành phần nguyên liệu
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-xs font-bold text-[#FF8FB8] hover:bg-pink-100 transition-colors flex items-center gap-1"
            >
              <Carrot className="w-3.5 h-3.5" />
              <span>Chọn từ danh sách</span>
            </button>
            <button
              type="button"
              onClick={handleAddIngredientRow}
              className="text-xs font-bold text-[#FF8FB8] hover:underline"
            >
              + Thêm dòng
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {ingredients.map((ing, idx) => {
            const costDetails = getIngredientCostDetails(ing, availableIngredients);
            const masterItem = availableIngredients.find((i) => i.id === ing.ingredientId || i.name === ing.ingredientName);
            const masterUnit = masterItem?.unit || 'gram';

            return (
              <div
                key={idx}
                className="p-2.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs"
              >
                {/* Main Inputs Row - Compact Single Line */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={ing.ingredientId}
                    onChange={(e) => handleUpdateIngredient(idx, 'ingredientId', e.target.value)}
                    className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] truncate"
                  >
                    {availableIngredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                  </select>

                  <div className="w-14 flex-shrink-0">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="SL"
                      value={ing.amount === 0 ? '' : ing.amount}
                      onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-1 py-1.5 text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                    />
                  </div>

                  {/* Compact Unit Selector */}
                  <div className="w-22 flex-shrink-0 relative">
                    {customUnitRows[idx] ? (
                      <div className="flex items-center gap-0.5">
                        <input
                          type="text"
                          placeholder="Đơn vị..."
                          value={ing.unit}
                          onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-1 py-1 text-[11px] font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setCustomUnitRows((prev) => ({ ...prev, [idx]: false }))}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-0.5"
                          title="Chọn từ danh sách"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <select
                        value={ing.unit}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomUnitRows((prev) => ({ ...prev, [idx]: true }));
                          } else {
                            handleUpdateIngredient(idx, 'unit', e.target.value);
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-1.5 py-1.5 text-[11px] font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] truncate"
                      >
                        {(() => {
                          const optionsSet = new Set<string>(COMMON_UNITS);
                          if (masterUnit) optionsSet.add(masterUnit);
                          if (ing.unit) optionsSet.add(ing.unit);

                          return Array.from(optionsSet).map((u) => (
                            <option key={u} value={u}>
                              {u} {u === masterUnit ? '(gốc)' : ''}
                            </option>
                          ));
                        })()}
                        <option value="__custom__">✍️ Tự nhập...</option>
                      </select>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'ingredient', index: idx, name: ing.ingredientName || 'nguyên liệu này' })}
                    className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Xóa dòng nguyên liệu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Note / Prep instructions row */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10.5px] font-bold text-slate-400 flex-shrink-0">Ghi chú:</span>
                  <input
                    type="text"
                    placeholder="Ghi chú sơ chế (vd: bằm nhỏ, xắt mỏng, bỏ hạt...)"
                    value={ing.note || ''}
                    onChange={(e) => handleUpdateIngredient(idx, 'note', e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#FF8FB8]"
                  />
                </div>

                {/* Calculated Cost & Unit conversion details Footer */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 px-0.5">
                  <div className="flex items-center gap-1.5 text-[10.5px]">
                    {costDetails.isConverted ? (
                      <span className="bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-md text-[10px] border border-sky-300/70 flex items-center gap-1">
                        <span>⚡ Quy đổi:</span>
                        <span>{ing.amount} {ing.unit} = {costDetails.convertedAmount} {costDetails.masterUnit}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Giá gốc: {costDetails.masterPrice.toLocaleString('vi-VN')}đ/{costDetails.masterUnit}
                      </span>
                    )}
                  </div>

                  <span className="font-black text-emerald-600 text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 ml-auto">
                    = {formatCurrency(costDetails.cost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Total Cost Calculation Banner */}
        {(() => {
          const tempRecipe: Recipe = {
            id: 'temp',
            title: '',
            category: '',
            imageUrl: '',
            description: '',
            isActive: true,
            updatedAt: '',
            portionLabel: portionLabel || '1 phần',
            ingredients,
            steps: [],
          };
          const estimatedCost = calculateRecipeTotalCost(tempRecipe, availableIngredients);
          return (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Ước tính giá vốn nguyên liệu:</span>
              </span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/60">
                {formatCurrency(estimatedCost)}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Cooking Steps Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Các bước quy trình chế biến
          </h3>
          <button
            type="button"
            onClick={handleAddStep}
            className="text-xs font-bold text-[#FF8FB8] hover:underline"
          >
            + Thêm bước
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((st, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FF8FB8] bg-pink-100 px-2 py-0.5 rounded-md">
                  Bước {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ type: 'step', index: idx, name: st.title || `Bước ${idx + 1}` })}
                  className="text-rose-400 hover:text-rose-600 text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Tiêu đề bước..."
                value={st.title}
                onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              />

              <textarea
                rows={2}
                placeholder="Mô tả chi tiết bước..."
                value={st.description}
                onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-700 resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>Lưu công thức món ăn</span>
        </button>
      </div>

      {/* INGREDIENT PICKER MODAL */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-[430px] bg-white rounded-t-[32px] p-5 shadow-2xl z-10 border-t border-pink-100 animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-3">
              <div className="flex items-center gap-2">
                <Carrot className="w-5 h-5 text-[#FF8FB8]" />
                <h3 className="font-extrabold text-slate-800 text-base">Chọn nguyên liệu</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm tên nguyên liệu..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3">
              {ingredientCategories.map((cat) => (
                <button
                  type="button"
                  key={String(cat)}
                  onClick={() => setPickerCategoryFilter(String(cat))}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    pickerCategoryFilter === cat
                      ? 'bg-[#FF8FB8] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List of Ingredients */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar pb-4">
              {filteredAvailableIngredients.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-slate-400">
                  Không tìm thấy nguyên liệu phù hợp
                </div>
              ) : (
                filteredAvailableIngredients.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromPicker(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-pink-50 border border-slate-200/70 hover:border-pink-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                          {item.name[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#FF8FB8]">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {item.category || 'Nguyên liệu'} • Đơn vị: {item.unit}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 group-hover:border-[#FF8FB8] group-hover:bg-[#FF8FB8] group-hover:text-white text-[11px] font-bold text-slate-700 transition-all">
                      + Chọn
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUTE DELETE MODAL */}
      <CuteDeleteModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name}
        itemType={deleteTarget?.type === 'ingredient' ? 'dòng nguyên liệu' : 'bước quy trình'}
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'ingredient') {
              handleRemoveIngredient(deleteTarget.index);
            } else {
              handleRemoveStep(deleteTarget.index);
            }
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </form>
  );
};
