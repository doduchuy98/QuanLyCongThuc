import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  BookOpen,
  Sparkles,
  Tag,
  Coins,
  Share2,
  PlusCircle,
  ChevronRight,
  RefreshCw,
  Info,
  Carrot,
} from 'lucide-react';
import { ShoppingListItem, IngredientItem, Recipe } from '../types';
import { formatCurrency } from '../utils/costUtils';
import { matchesSearch } from '../utils/stringUtils';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface ShoppingListViewProps {
  shoppingList: ShoppingListItem[];
  allIngredients?: IngredientItem[];
  recipes?: Recipe[];
  onToggleItem: (id: string) => void;
  onUpdateAmount: (id: string, delta: number) => void;
  onAddItem: (item: Omit<ShoppingListItem, 'id' | 'createdAt'>) => void;
  onDeleteItem: (id: string) => void;
  onClearBought: () => void;
  onClearAll: () => void;
  onOpenBatchAddRecipeModal: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  allIngredients = [],
  recipes = [],
  onToggleItem,
  onUpdateAmount,
  onAddItem,
  onDeleteItem,
  onClearBought,
  onClearAll,
  onOpenBatchAddRecipeModal,
}) => {
  // Local states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unbought' | 'bought'>('all');

  // Manual Add Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState('gram');
  const [newItemCategory, setNewItemCategory] = useState('Rau củ & Thực phẩm');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemNote, setNewItemNote] = useState('');

  // Auto-complete suggestion selection
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Copy Feedback Toast
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Delete Confirm Modal State
  const [itemToDelete, setItemToDelete] = useState<ShoppingListItem | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [isClearBoughtConfirmOpen, setIsClearBoughtConfirmOpen] = useState(false);

  // Aggregated Stats
  const totalItemsCount = shoppingList.length;
  const boughtCount = shoppingList.filter((item) => item.isBought).length;
  const unboughtCount = totalItemsCount - boughtCount;
  const completionPercentage = totalItemsCount > 0 ? Math.round((boughtCount / totalItemsCount) * 100) : 0;

  // Estimated Cost Calculation
  const unboughtCost = useMemo(() => {
    return shoppingList
      .filter((item) => !item.isBought)
      .reduce((sum, item) => sum + (item.pricePerUnit || 0) * item.amount, 0);
  }, [shoppingList]);

  const totalCost = useMemo(() => {
    return shoppingList.reduce((sum, item) => sum + (item.pricePerUnit || 0) * item.amount, 0);
  }, [shoppingList]);

  // Categories extraction for filtering
  const categoriesList = useMemo(() => {
    const cats = shoppingList.map((i) => i.category).filter(Boolean) as string[];
    return ['Tất cả', ...Array.from(new Set(cats))];
  }, [shoppingList]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return shoppingList.filter((item) => {
      const matchesQuery = matchesSearch(item.name, searchQuery) ||
        (item.recipeSource && matchesSearch(item.recipeSource, searchQuery)) ||
        matchesSearch(item.category, searchQuery);
      const matchesCategory = selectedCategoryFilter === 'Tất cả' || item.category === selectedCategoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unbought' && !item.isBought) ||
        (statusFilter === 'bought' && item.isBought);

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [shoppingList, searchQuery, selectedCategoryFilter, statusFilter]);

  // Handle ingredient suggestion pick
  const handlePickIngredientSuggestion = (ing: IngredientItem) => {
    setNewItemName(ing.name);
    setNewItemUnit(ing.unit);
    if (ing.category) setNewItemCategory(ing.category);
    if (ing.pricePerUnit) setNewItemPrice(ing.pricePerUnit.toString());
    setShowSuggestions(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    // Find matching global ingredient if price not explicitly entered
    const priceVal = newItemPrice.trim() !== '' ? parseFloat(newItemPrice) : undefined;

    onAddItem({
      name: newItemName.trim(),
      amount: Math.max(0.01, newItemAmount),
      unit: newItemUnit.trim() || 'đơn vị',
      category: newItemCategory,
      pricePerUnit: priceVal,
      isBought: false,
      note: newItemNote.trim() || undefined,
    });

    // Reset Form
    setNewItemName('');
    setNewItemAmount(1);
    setNewItemPrice('');
    setNewItemNote('');
    setIsFormOpen(false);
  };

  // Copy Shopping List to Clipboard
  const handleCopyShoppingList = () => {
    if (shoppingList.length === 0) return;

    let text = `🛒 DANH SÁCH ĐI CHỢ - BẾP NHÀ HUY 🛒\n`;
    text += `📅 Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}\n`;
    text += `-----------------------------------\n\n`;

    // Group items by category
    const grouped: { [cat: string]: ShoppingListItem[] } = {};
    shoppingList.forEach((item) => {
      const cat = item.category || 'Khác';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
      text += `📌 ${cat.toUpperCase()}:\n`;
      items.forEach((item) => {
        const checkMark = item.isBought ? '[x]' : '[ ]';
        const costStr = item.pricePerUnit ? ` (~${formatCurrency(item.pricePerUnit * item.amount)})` : '';
        const sourceStr = item.recipeSource ? ` (${item.recipeSource})` : '';
        text += `${checkMark} ${item.name}: ${item.amount} ${item.unit}${costStr}${sourceStr}\n`;
      });
      text += `\n`;
    });

    if (unboughtCost > 0) {
      text += `-----------------------------------\n`;
      text += `💰 Ước tính số tiền cần mang theo: ${formatCurrency(unboughtCost)}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopyToast('Đã sao chép danh sách đi chợ vào khay nhớ tạm! 📋');
    setTimeout(() => setCopyToast(null), 3000);
  };

  const ingredientSuggestions = useMemo(() => {
    if (!newItemName.trim()) return [];
    return allIngredients.filter((i) =>
      matchesSearch(i.name, newItemName)
    ).slice(0, 5);
  }, [allIngredients, newItemName]);

  return (
    <div className="p-4 space-y-4 pb-28 max-w-4xl mx-auto select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span>{copyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Feature Banner */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#FF8FB8] via-[#FF6B9D] to-[#FF8FB8] p-5 sm:p-6 text-white shadow-md shadow-pink-200/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
              Danh sách mua sắm thông minh ✨
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Đi Chợ Chuẩn Định Lượng & Giá Vốn
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 font-semibold max-w-md">
              Tự động gom nguyên liệu từ các món ăn, tính tổng tiền dự kiến và theo dõi danh mục mua sắm dễ dàng.
            </p>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenBatchAddRecipeModal}
              className="px-4 py-2.5 rounded-2xl bg-white text-pink-600 font-extrabold text-xs shadow-md hover:bg-pink-50 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>Gom từ Công Thức</span>
            </button>

            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2.5 rounded-2xl bg-pink-900/30 text-white font-extrabold text-xs hover:bg-pink-900/40 border border-white/30 backdrop-blur-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isFormOpen ? 'Đóng form' : 'Thêm thủ công'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Summary Stats Bar inside Banner */}
        <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold text-pink-100 uppercase">Cần mua</span>
            <div className="text-lg font-black text-white">{unboughtCount} món</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <span className="text-[10px] font-extrabold text-pink-100 uppercase">Đã mua</span>
            <div className="text-lg font-black text-emerald-200">{boughtCount} món</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 col-span-2 sm:col-span-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold text-pink-100 uppercase mb-1">
              <span>Ước tính tiền cần mang</span>
              <span className="text-amber-200 font-black text-xs">
                {unboughtCost > 0 ? formatCurrency(unboughtCost) : '0 VNĐ'}
              </span>
            </div>
            {/* Completion Progress Bar */}
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Item Add Form Collapsible */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleManualSubmit}
            className="p-4 bg-white rounded-3xl border-2 border-pink-200 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-pink-500" />
                <span>Thêm nguyên liệu cần mua thủ công</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">Tùy chỉnh cá nhân</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Item Name with auto-complete */}
              <div className="relative space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Tên nguyên liệu / món *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thịt bò tươi, Rau muống..."
                  value={newItemName}
                  onChange={(e) => {
                    setNewItemName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#FF8FB8]"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && ingredientSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-2xl shadow-xl border border-pink-100 p-1 space-y-1 max-h-40 overflow-y-auto">
                    {ingredientSuggestions.map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => handlePickIngredientSuggestion(ing)}
                        className="w-full px-3 py-2 rounded-xl text-left hover:bg-pink-50 text-xs font-bold text-slate-700 flex items-center justify-between"
                      >
                        <span>{ing.name}</span>
                        <span className="text-[10px] text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">
                          {ing.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Số lượng</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#FF8FB8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Đơn vị tính</label>
                  <input
                    type="text"
                    placeholder="gram, kg, quả..."
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#FF8FB8]"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Phân loại danh mục</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#FF8FB8]"
                >
                  <option value="Rau củ & Rau thơm">Rau củ & Rau thơm</option>
                  <option value="Thịt tươi">Thịt tươi</option>
                  <option value="Hải sản tươi">Hải sản tươi</option>
                  <option value="Gia vị & Nước sốt">Gia vị & Nước sốt</option>
                  <option value="Thực phẩm khô / trứng">Thực phẩm khô / trứng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              {/* Price Per Unit (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Đơn giá tham khảo (VNĐ/đơn vị)</label>
                <input
                  type="number"
                  placeholder="Ví dụ: 150 (VNĐ/gram)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#FF8FB8]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#FF8FB8] hover:bg-[#FF6B9D] text-white font-extrabold text-xs shadow-md shadow-pink-200 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vào danh sách</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters & Control Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
        {/* Search & Main Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm món trong danh sách đi chợ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#FF8FB8]"
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              onClick={handleCopyShoppingList}
              disabled={shoppingList.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-slate-200/70 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40"
              title="Sao chép danh sách đi chợ gửi Zalo/Mess"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép</span>
            </button>

            {boughtCount > 0 && (
              <button
                onClick={() => setIsClearBoughtConfirmOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Dọn món đã mua ({boughtCount})</span>
              </button>
            )}

            {totalItemsCount > 0 && (
              <button
                onClick={() => setIsClearAllConfirmOpen(true)}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Tab Switcher (Tất cả / Cần mua / Đã mua) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({totalItemsCount})
            </button>

            <button
              onClick={() => setStatusFilter('unbought')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'unbought'
                  ? 'bg-[#FF8FB8] text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cần mua ({unboughtCount})
            </button>

            <button
              onClick={() => setStatusFilter('bought')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'bought'
                  ? 'bg-emerald-500 text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã mua ({boughtCount})
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            Tự động sắp xếp theo nhóm
          </span>
        </div>

        {/* Category Filter Chips */}
        {categoriesList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-800 text-white shadow-2xs scale-102'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-pink-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty-shopping-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 mx-auto flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 stroke-[1.75]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700 text-sm">
                  {totalItemsCount === 0
                    ? 'Chưa có nguyên liệu nào trong danh sách đi chợ'
                    : 'Không tìm thấy mục phù hợp với bộ lọc'}
                </h3>
                <p className="text-xs text-slate-400">
                  {totalItemsCount === 0
                    ? 'Bấm nút "Gom từ Công Thức" hoặc thêm thủ công để bắt đầu đi chợ nhé!'
                    : 'Thử thay đổi từ khóa hoặc bộ lọc danh mục nhé!'}
                </p>
              </div>

              {totalItemsCount === 0 && (
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={onOpenBatchAddRecipeModal}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Chọn công thức để đi chợ</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const estimatedItemCost = (item.pricePerUnit || 0) * item.amount;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 ${
                    item.isBought
                      ? 'bg-slate-50/80 border-slate-200/60 opacity-60'
                      : 'bg-white border-slate-100 shadow-2xs hover:shadow-md hover:border-pink-200'
                  }`}
                >
                  {/* Left Checkbox & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleItem(item.id)}
                      className={`w-7 h-7 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${
                        item.isBought
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'border-2 border-slate-300 bg-white hover:border-[#FF8FB8]'
                      }`}
                    >
                      {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`font-extrabold text-sm text-slate-800 transition-all ${
                            item.isBought ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.name}
                        </h4>

                        {item.category && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100 font-bold text-[10px] flex-shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Recipe Source or Notes */}
                      {item.recipeSource && (
                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                          Món: <span className="text-slate-600">{item.recipeSource}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Amount Stepper & Price */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Amount badge & Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => onUpdateAmount(item.id, -1)}
                        className="w-6 h-6 rounded-xl bg-white text-slate-600 hover:text-pink-600 font-extrabold flex items-center justify-center shadow-2xs text-xs"
                      >
                        -
                      </button>

                      <span className="text-xs font-black text-slate-800 px-1 min-w-[45px] text-center">
                        {item.amount} {item.unit}
                      </span>

                      <button
                        type="button"
                        onClick={() => onUpdateAmount(item.id, 1)}
                        className="w-6 h-6 rounded-xl bg-white text-slate-600 hover:text-pink-600 font-extrabold flex items-center justify-center shadow-2xs text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Tag if available */}
                    {estimatedItemCost > 0 && (
                      <div className="hidden sm:block text-right min-w-[80px]">
                        <span className="text-xs font-black text-slate-700 block">
                          ~{formatCurrency(estimatedItemCost)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatCurrency(item.pricePerUnit || 0)}/{item.unit}
                        </span>
                      </div>
                    )}

                    {/* Delete Item Button */}
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="w-8 h-8 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Delete Item Modal */}
      <CuteDeleteModal
        isOpen={!!itemToDelete}
        itemName={itemToDelete?.name}
        itemType="món trong danh sách đi chợ"
        onConfirm={() => {
          if (itemToDelete) onDeleteItem(itemToDelete.id);
        }}
        onClose={() => setItemToDelete(null)}
      />

      {/* Clear All Modal */}
      <CuteDeleteModal
        isOpen={isClearAllConfirmOpen}
        title="Bạn có chắc muốn xóa toàn bộ danh sách đi chợ?"
        description="Toàn bộ danh sách mua sắm hiện tại sẽ bị xóa sạch nha!"
        onConfirm={onClearAll}
        onClose={() => setIsClearAllConfirmOpen(false)}
      />

      {/* Clear Bought Modal */}
      <CuteDeleteModal
        isOpen={isClearBoughtConfirmOpen}
        title="Dọn dẹp các món đã mua?"
        description={`Sẽ xóa ${boughtCount} món bạn đã đánh dấu mua xong để danh sách gọn gàng hơn nhé!`}
        onConfirm={onClearBought}
        onClose={() => setIsClearBoughtConfirmOpen(false)}
      />
    </div>
  );
};
