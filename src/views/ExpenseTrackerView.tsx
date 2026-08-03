import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  X,
  Check,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  HeartPulse,
  Gift,
  Briefcase,
  HelpCircle,
  PiggyBank,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ExpenseItem, AppMode } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';
import { formatCurrency } from '../utils/costUtils';

interface ExpenseTrackerViewProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onSwitchMode: (mode: AppMode) => void;
}

const EXPENSE_CATEGORIES = [
  { name: 'Ăn uống', icon: Utensils, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Đi chợ & Siêu thị', icon: ShoppingBag, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Di chuyển', icon: Car, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'Hóa đơn & Tiền nhà', icon: Home, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'Mua sắm', icon: ShoppingBag, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Giải trí & Cà phê', icon: Coffee, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Sức khỏe & Y tế', icon: HeartPulse, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { name: 'Khác', icon: HelpCircle, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const INCOME_CATEGORIES = [
  { name: 'Lương & Thưởng', icon: Briefcase, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'Kinh doanh & Bán hàng', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Thu nhập khác', icon: Gift, color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onSwitchMode,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState<ExpenseItem | null>(null);

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Ăn uống');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('transfer');

  // Calculate totals
  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesTab = activeTab === 'all' || e.type === activeTab;
    const matchesQuery =
      e.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  // Calculate expenses by category for breakdown chart
  const categoryTotals: { [cat: string]: number } = {};
  expenses
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    onAddExpense({
      type,
      amount: numAmount,
      category,
      note: note.trim() || (type === 'expense' ? 'Chi tiêu cá nhân' : 'Thu nhập'),
      date,
      paymentMethod,
    });

    // Reset Form
    setAmount('');
    setNote('');
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (catName: string) => {
    const foundExp = EXPENSE_CATEGORIES.find((c) => c.name === catName);
    if (foundExp) return foundExp.icon;
    const foundInc = INCOME_CATEGORIES.find((c) => c.name === catName);
    if (foundInc) return foundInc.icon;
    return Tag;
  };

  return (
    <div className="p-4 space-y-5 pb-28 max-w-5xl mx-auto animate-fade-in">
      {/* Top App Mode Switch Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xs">
            <PiggyBank className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-400/30 text-emerald-100 font-extrabold text-[10px] border border-white/20 uppercase tracking-wide">
                Đang mở
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                Quản Lý Chi Tiêu Cá Nhân
              </h2>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5">
              Sổ thu chi thông minh, quản lý ngân sách & tiết kiệm hàng tháng
            </p>
          </div>
        </div>

        {/* MODE SWITCH BUTTON */}
        <button
          onClick={() => onSwitchMode('kitchen')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white text-slate-800 hover:bg-slate-100 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 group"
        >
          <Utensils className="w-4 h-4 text-[#FF8FB8] group-hover:rotate-12 transition-transform" />
          <span>Chuyển sang Quản lý Bếp 🍳</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Balance Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold mb-1">
            <span>Số dư hiện tại</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {formatCurrency(netBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Tích lũy từ thu nhập & chi tiêu
          </p>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Income Card */}
        <div className="p-4 rounded-3xl bg-white border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>Tổng Thu Nhập</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-600">
            +{formatCurrency(totalIncome)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Lương, thưởng & khoản thu khác
          </p>
        </div>

        {/* Total Expense Card */}
        <div className="p-4 rounded-3xl bg-white border border-rose-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span>Tổng Chi Tiêu</span>
            <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-rose-600">
            -{formatCurrency(totalExpense)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Đi chợ, ăn uống & sinh hoạt
          </p>
        </div>
      </div>

      {/* Main Action Bar & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔴 Chi tiêu
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🟢 Thu nhập
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch, ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => {
              setType('expense');
              setCategory('Ăn uống');
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thu/Chi</span>
          </button>
        </div>
      </div>

      {/* Content Layout: Transaction List & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction History (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>Lịch sử giao dịch</span>
              <span className="text-xs font-semibold text-slate-400">
                ({filteredExpenses.length} giao dịch)
              </span>
            </h3>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center space-y-2">
              <PiggyBank className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Chưa có giao dịch nào</p>
              <p className="text-xs text-slate-400">Nhấn nút "Thêm Thu/Chi" để ghi lại khoản thu chi mới!</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredExpenses.map((item) => {
                const Icon = getCategoryIcon(item.category);
                const isInc = item.type === 'income';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                          isInc
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                            {item.note}
                          </h4>
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold ${
                              isInc
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-0.5">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>
                            {item.paymentMethod === 'cash'
                              ? '💵 Tiền mặt'
                              : item.paymentMethod === 'card'
                              ? '💳 Thẻ'
                              : '🏦 Chuyển khoản'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`text-sm sm:text-base font-extrabold text-right ${
                          isInc ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isInc ? '+' : '-'}{formatCurrency(item.amount)}
                      </div>

                      <button
                        onClick={() => setExpToDelete(item)}
                        className="w-8 h-8 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expense Category Breakdown (1 Col) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 px-1">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Phân bổ chi tiêu</span>
          </h3>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            {Object.keys(categoryTotals).length === 0 ? (
              <p className="text-xs text-slate-400 font-medium text-center py-4">
                Chưa có dữ liệu chi tiêu để thống kê
              </p>
            ) : (
              Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([catName, catAmount]) => {
                  const pct = totalExpense > 0 ? Math.round((catAmount / totalExpense) * 100) : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{catName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-900">{formatCurrency(catAmount)}</span>
                          <span className="text-slate-400 text-[10px]">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Ghi chép Thu / Chi mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('Ăn uống');
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Khoản Chi Tiêu</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('Lương & Thưởng');
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Khoản Thu Nhập</span>
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số tiền (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">
                    ₫
                  </span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="Ví dụ: 100000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                {amount && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    = {formatCurrency(parseFloat(amount) || 0)}
                  </p>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú / Diễn giải
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cơm trưa, Đi chợ mua rau, Lương tháng..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date & Payment Method */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thanh toán
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="transfer">Chuyển khoản</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ tín dụng</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Lưu Giao Dịch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <CuteDeleteModal
        isOpen={!!expToDelete}
        itemName={expToDelete?.note}
        itemType="giao dịch"
        onConfirm={() => {
          if (expToDelete) onDeleteExpense(expToDelete.id);
          setExpToDelete(null);
        }}
        onClose={() => setExpToDelete(null)}
      />
    </div>
  );
};
