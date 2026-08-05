import React, { useState } from 'react';
import { Upload, Plus, Trash2, Check, Sparkles, Search, Carrot, X, ImageOff } from 'lucide-react';
import { Category, IngredientItem, Recipe, RecipeIngredient, CookingStep } from '../types';
import { matchesSearch, removeVietnameseTones, capitalizeWords } from '../utils/stringUtils';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface AddEditRecipeViewProps {
  recipeToEdit?: Recipe | null;
  categories: Category[];
  availableIngredients: IngredientItem[];
  onSave: (recipe: Recipe) => void;
  onSaveIngredient?: (ingredient: IngredientItem) => void;
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
  onSaveIngredient,
  onCancel,
}) => {
  const recipeCategories = categories.filter(
    (c) => c.type === 'recipe' || (!c.type && c.type !== 'ingredient' && c.type !== 'unit')
  );
  const unitCategories = categories.filter((c) => c.type === 'unit');

  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [category, setCategory] = useState(
    recipeToEdit?.category || recipeCategories[0]?.name || ''
  );
  const [description, setDescription] = useState(recipeToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(recipeToEdit?.imageUrl || '');
  const [isActive, setIsActive] = useState(recipeToEdit?.isActive ?? true);
  const [portionLabel, setPortionLabel] = useState(recipeToEdit?.portionLabel || '1 phần');
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
      { ingredientId: availableIngredients[0]?.id || 'ing-1', ingredientName: availableIngredients[0]?.name || 'Thịt bò', amount: 100, unit: 'gram' },
    ]
  );

  const [steps, setSteps] = useState<CookingStep[]>(
    recipeToEdit?.steps || []
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
    const exists = ingredients.some(
      (i) => i.ingredientId === ingItem.id || removeVietnameseTones(i.ingredientName) === removeVietnameseTones(ingItem.name)
    );
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
    setIngredients([
      ...ingredients,
      {
        ingredientId: '',
        ingredientName: '',
        amount: 1,
        unit: 'gram',
      },
    ]);
  };

  const handleIngredientNameChange = (index: number, nameValue: string) => {
    const formattedName = capitalizeWords(nameValue);
    const updated = [...ingredients];
    updated[index].ingredientName = formattedName;

    const norm = removeVietnameseTones(formattedName.trim());
    const matched = norm
      ? availableIngredients.find(
          (i) => removeVietnameseTones(i.name.trim()) === norm
        )
      : null;

    if (matched) {
      updated[index].ingredientId = matched.id;
      if (!updated[index].unit || updated[index].unit === 'gram') {
        updated[index].unit = matched.unit;
      }
    } else {
      updated[index].ingredientId = '';
    }

    setIngredients(updated);
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    (updated[index] as any)[field] = field === 'ingredientName' ? capitalizeWords(value) : value;
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
        title: `Bước ${nextNum}`,
        description: '',
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

    const processedIngredients: RecipeIngredient[] = [];

    for (const ing of ingredients) {
      const trimmedName = ing.ingredientName.trim();
      if (!trimmedName) continue;

      const normName = removeVietnameseTones(trimmedName);
      const existingMaster = availableIngredients.find(
        (i) => removeVietnameseTones(i.name.trim()) === normName
      );

      let finalIngId = ing.ingredientId;

      if (existingMaster) {
        finalIngId = existingMaster.id;
      } else {
        // Auto add new ingredient to master ingredient list
        const newMasterIng: IngredientItem = {
          id: `ing-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          name: trimmedName,
          unit: ing.unit.trim() || 'gram',
          category: 'Khác',
          isActive: true,
        };

        if (onSaveIngredient) {
          onSaveIngredient(newMasterIng);
        }
        finalIngId = newMasterIng.id;
      }

      processedIngredients.push({
        ingredientId: finalIngId,
        ingredientName: trimmedName,
        amount: Number(ing.amount) || 1,
        unit: ing.unit.trim() || 'gram',
        note: ing.note,
      });
    }

    if (processedIngredients.length === 0) {
      alert('Vui lòng nhập ít nhất 1 nguyên liệu cho món ăn!');
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
      ingredients: processedIngredients,
      steps,
      prepTimeMinutes: recipeToEdit?.prepTimeMinutes || 20,
      cookTimeMinutes: recipeToEdit?.cookTimeMinutes || 30,
    };

    onSave(newRecipe);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-28 animate-fade-in">
      {/* Ultra-Minimalist Image Section */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            Ảnh món ăn <span className="text-slate-400 font-normal">(Tùy chọn)</span>
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa ảnh</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Square Thumbnail Preview / Placeholder */}
          <div className="relative w-12 h-12 rounded-xl bg-pink-50/80 border border-pink-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="w-5 h-5 text-pink-300" />
            )}
          </div>

          {/* Minimal Upload Button & URL Input */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <label className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#FF8FB8] rounded-xl text-xs font-bold border border-pink-100 cursor-pointer flex items-center gap-1.5 transition-colors flex-shrink-0 active:scale-95">
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tải ảnh</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <input
              type="text"
              placeholder="Hoặc dán URL liên kết ảnh..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white truncate"
            />
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
            {recipeCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            {category && !recipeCategories.some((c) => c.name === category) && (
              <option value={category}>{category}</option>
            )}
            {recipeCategories.length === 0 && (
              <option value="">Chưa có danh mục món ăn</option>
            )}
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
              onClick={handleAddIngredientRow}
              className="text-xs font-bold text-[#FF8FB8] hover:underline"
            >
              + Thêm dòng
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {ingredients.map((ing, idx) => {
            return (
              <div
                key={idx}
                className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2 shadow-2xs"
              >
                {/* Main Inputs Row - Name, Amount, Unit */}
                <div className="flex items-center gap-1.5">
                  {/* Ingredient Name Input with Auto-complete Datalist */}
                  <div className="flex-1 min-w-0 relative">
                    <input
                      type="text"
                      list={`available-ingredients-list-${idx}`}
                      placeholder="Tên nguyên liệu..."
                      value={ing.ingredientName}
                      onChange={(e) => handleIngredientNameChange(idx, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                    />
                    <datalist id={`available-ingredients-list-${idx}`}>
                      {availableIngredients.map((i) => (
                        <option key={i.id} value={i.name}>
                          {i.category ? `${i.category} • ` : ''}Đơn vị: {i.unit}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Quantity Input */}
                  <div className="w-16 flex-shrink-0">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="SL"
                      value={ing.amount === 0 ? '' : ing.amount}
                      onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-1.5 py-1.5 text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                    />
                  </div>

                  {/* Unit Input */}
                  <div className="w-24 flex-shrink-0 relative">
                    <input
                      type="text"
                      list={`common-units-list-${idx}`}
                      placeholder="Đơn vị..."
                      value={ing.unit}
                      onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
                    />
                    <datalist id={`common-units-list-${idx}`}>
                      {Array.from(new Set([...unitCategories.map((u) => u.name), ...COMMON_UNITS])).map((u) => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                  </div>

                  {/* Delete Row Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ type: 'ingredient', index: idx, name: ing.ingredientName || 'nguyên liệu này' })}
                    className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Xóa dòng nguyên liệu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
          {steps.length === 0 ? (
            <div className="p-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Chưa có bước nào. Nhấp <strong className="text-[#FF8FB8] cursor-pointer" onClick={handleAddStep}>"+ Thêm bước"</strong> để tạo mới quy trình.
              </p>
            </div>
          ) : (
            steps.map((st, idx) => (
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
          )))}
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
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 text-center flex-shrink-0 p-0.5">
                          <ImageOff className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[7.5px] font-black tracking-tighter text-slate-400 uppercase leading-none mt-0.5">No image</span>
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
