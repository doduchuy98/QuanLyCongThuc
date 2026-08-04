import React, { useState, useEffect } from 'react';
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
  HandCoins,
  Pencil,
  Coins,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Handshake,
} from 'lucide-react';
import { ExpenseItem, AppMode } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';
import { formatCurrency } from '../utils/costUtils';

interface ExpenseTrackerViewProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense?: (item: ExpenseItem) => void;
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

const LOAN_CATEGORIES = [
  { name: 'Cho vay', icon: HandCoins, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { name: 'Đi vay', icon: Coins, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'Tạm ứng', icon: CreditCard, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { name: 'Nợ cá nhân', icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Khác', icon: HelpCircle, color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
  onSwitchMode,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'loan'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState<ExpenseItem | null>(null);

  // Helper to parse year and month from date string
  const parseYearMonth = (dateStr: string) => {
    if (!dateStr) return { year: '', month: '' };
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        return { year: parts[0], month: parts[1].padStart(2, '0') };
      }
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return { year: parts[2], month: parts[1].padStart(2, '0') };
      }
    }
    return { year: '', month: '' };
  };

  // Extract available years from expenses
  const availableYears: string[] = Array.from(
    new Set<string>(
      expenses
        .map((e) => parseYearMonth(e.date).year)
        .filter((y): y is string => Boolean(y) && y.length === 4)
    )
  ).sort((a: string, b: string) => b.localeCompare(a));

  const currentYear = new Date().getFullYear().toString();
  if (!availableYears.includes(currentYear)) {
    availableYears.unshift(currentYear);
  }

  // Lending Balance State (Money lent to others)
  const [lendingBalance, setLendingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('app_lending_balance');
    return saved !== null ? parseFloat(saved) || 0 : 2500000;
  });
  const [isEditLendingModalOpen, setIsEditLendingModalOpen] = useState(false);
  const [tempLendingInput, setTempLendingInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('app_lending_balance', lendingBalance.toString());
  }, [lendingBalance]);

  // Form State
  const [type, setType] = useState<'expense' | 'income' | 'loan'>('expense');
  const [loanType, setLoanType] = useState<'borrow' | 'lend'>('lend');
  const [personName, setPersonName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Ăn uống');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('transfer');

  const handleTypeChange = (newType: 'expense' | 'income' | 'loan') => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('Ăn uống');
    } else if (newType === 'income') {
      setCategory('Lương & Thưởng');
    } else {
      setCategory('Cho vay');
      setLoanType('lend');
    }
  };

  const handleOpenAddLoan = () => {
    setType('loan');
    setLoanType('lend');
    setCategory('Cho vay');
    setPersonName('');
    setIsAddModalOpen(true);
  };

  // Calculate totals
  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Current Net Balance = Income - Expense
  const netBalance = totalIncome - totalExpense;

  // Main Balance = Current Net Balance + Lending Balance
  const mainBalance = netBalance + lendingBalance;

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesTab = activeTab === 'all' || e.type === activeTab;
    const matchesQuery =
      e.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.personName && e.personName.toLowerCase().includes(searchQuery.toLowerCase()));

    const { year, month } = parseYearMonth(e.date);
    const matchesYear = selectedYearFilter === 'all' || year === selectedYearFilter;
    const matchesMonth = selectedMonthFilter === 'all' || month === selectedMonthFilter;

    return matchesTab && matchesQuery && matchesYear && matchesMonth;
  });

  // Calculate expenses by category for breakdown chart (based on filtered list or all)
  const categoryTotals: { [cat: string]: number } = {};
  filteredExpenses
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

  const handleExportCsv = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      alert('Không có dữ liệu giao dịch để xuất!');
      return;
    }

    const headers = ['Mã giao dịch', 'Ngày', 'Loại', 'Danh mục', 'Ghi chú', 'Đối tác', 'Trạng thái', 'Số tiền (VNĐ)', 'Hình thức thanh toán'];

    const rows = filteredExpenses.map((item) => {
      const typeText =
        item.type === 'income'
          ? 'Thu nhập'
          : item.type === 'expense'
          ? 'Chi tiêu'
          : item.loanType === 'borrow'
          ? 'Đi vay'
          : 'Cho vay';

      const statusText = item.type === 'loan' ? (item.isPaid ? 'Đã trả' : 'Chưa trả') : 'Hoàn tất';

      const payText =
        item.paymentMethod === 'cash'
          ? 'Tiền mặt'
          : item.paymentMethod === 'card'
          ? 'Thẻ'
          : 'Chuyển khoản';

      return [
        `"${(item.id || '').replace(/"/g, '""')}"`,
        `"${(item.date || '').replace(/"/g, '""')}"`,
        `"${typeText}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${(item.note || '').replace(/"/g, '""')}"`,
        `"${(item.personName || '').replace(/"/g, '""')}"`,
        `"${statusText}"`,
        item.amount,
        `"${payText}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = `lich-su-giao-dich-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      note: note.trim() || (type === 'expense' ? 'Chi tiêu cá nhân' : type === 'income' ? 'Thu nhập' : (loanType === 'lend' ? 'Cho vay' : 'Đi vay')),
      date,
      paymentMethod,
      loanType: type === 'loan' ? loanType : undefined,
      isPaid: type === 'loan' ? false : undefined,
      personName: type === 'loan' ? personName.trim() : undefined,
    });

    // Reset Form
    setAmount('');
    setNote('');
    setPersonName('');
    setIsAddModalOpen(false);
  };

  const handleSaveLendingBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempLendingInput.replace(/[^0-9]/g, ''));
    setLendingBalance(isNaN(val) ? 0 : val);
    setIsEditLendingModalOpen(false);
  };

  const getCategoryIcon = (catName: string) => {
    const foundExp = EXPENSE_CATEGORIES.find((c) => c.name === catName);
    if (foundExp) return foundExp.icon;
    const foundInc = INCOME_CATEGORIES.find((c) => c.name === catName);
    if (foundInc) return foundInc.icon;
    const foundLoan = LOAN_CATEGORIES.find((c) => c.name === catName);
    if (foundLoan) return foundLoan.icon;
    return Tag;
  };

  return (
    <div className="p-4 space-y-5 pb-28 max-w-5xl mx-auto animate-fade-in">

      {/* Financial Overview Cards Section */}
      <div className="space-y-3">
        {/* Main Balance Hero Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Số dư chính (Tổng tài sản)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              {formatCurrency(mainBalance)}
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-300 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <span>Hiện tại: <strong className="text-emerald-400 font-bold">{formatCurrency(netBalance)}</strong></span>
            <span className="text-slate-500">•</span>
            <span>Cho vay: <strong className="text-amber-400 font-bold">{formatCurrency(lendingBalance)}</strong></span>
          </div>
        </div>

        {/* 4 Minimal Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Số dư hiện tại */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Số dư hiện tại</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
              {formatCurrency(netBalance)}
            </div>
          </div>

          {/* Card 2: Số dư cho vay */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span>Số dư cho vay</span>
                <button
                  onClick={() => {
                    setTempLendingInput(lendingBalance.toString());
                    setIsEditLendingModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded-md transition-colors"
                  title="Chỉnh sửa số dư cho vay"
                >
                  <Pencil className="w-2.5 h-2.5 inline mr-0.5" />
                  Sửa
                </button>
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HandCoins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-800 tracking-tight">
              {formatCurrency(lendingBalance)}
            </div>
          </div>

          {/* Card 3: Tổng Thu Nhập */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tổng thu nhập</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 tracking-tight">
              +{formatCurrency(totalIncome)}
            </div>
          </div>

          {/* Card 4: Tổng Chi Tiêu */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tổng chi tiêu</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-600 tracking-tight">
              -{formatCurrency(totalExpense)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Bar & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap sm:flex-nowrap">
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
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'loan'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🤝 Vay Mượn
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={activeTab === 'loan' ? "Tìm theo tên người vay, ghi chú..." : "Tìm kiếm giao dịch, ghi chú..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {activeTab === 'loan' ? (
            <button
              onClick={handleOpenAddLoan}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm khoản vay</span>
            </button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Content Layout: Transaction List & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction History (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>{activeTab === 'loan' ? 'Lịch sử vay mượn' : 'Lịch sử giao dịch'}</span>
              <span className="text-xs font-semibold text-slate-400">
                ({filteredExpenses.length} {activeTab === 'loan' ? 'khoản' : 'giao dịch'})
              </span>
            </h3>

            {/* Time Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 shadow-2xs px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                
                {/* Month Select */}
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="all">Tất cả tháng</option>
                  <option value="01">Tháng 1</option>
                  <option value="02">Tháng 2</option>
                  <option value="03">Tháng 3</option>
                  <option value="04">Tháng 4</option>
                  <option value="05">Tháng 5</option>
                  <option value="06">Tháng 6</option>
                  <option value="07">Tháng 7</option>
                  <option value="08">Tháng 8</option>
                  <option value="09">Tháng 9</option>
                  <option value="10">Tháng 10</option>
                  <option value="11">Tháng 11</option>
                  <option value="12">Tháng 12</option>
                </select>

                <span className="text-slate-300">/</span>

                {/* Year Select */}
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="all">Tất cả năm</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleExportCsv}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
                title="Xuất lịch sử giao dịch ra file CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất CSV</span>
              </button>

              {(selectedMonthFilter !== 'all' || selectedYearFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedMonthFilter('all');
                    setSelectedYearFilter('all');
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  title="Xóa lọc thời gian"
                >
                  <X className="w-3 h-3" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center space-y-2">
              <PiggyBank className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {activeTab === 'loan' ? 'Chưa có khoản vay mượn nào' : 'Chưa có giao dịch nào'}
              </p>
              <p className="text-xs text-slate-400">
                {activeTab === 'loan'
                  ? 'Nhấn nút "Thêm khoản vay" để ghi lại khoản vay hoặc cho mượn mới!'
                  : 'Nhấn nút "Thêm Thu/Chi" để ghi lại khoản thu chi mới!'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredExpenses.map((item) => {
                const Icon = getCategoryIcon(item.category);
                const isInc = item.type === 'income';
                const isLoan = item.type === 'loan';

                return (
                  <div
                    key={item.id}
                    className="p-3 sm:p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                          isInc
                            ? 'bg-emerald-100 text-emerald-700'
                            : isLoan
                            ? item.loanType === 'borrow'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0 overflow-hidden whitespace-nowrap">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate whitespace-nowrap">
                            {item.note}
                          </h4>

                          {isLoan ? (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 whitespace-nowrap ${
                                item.loanType === 'borrow'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              }`}
                            >
                              {item.loanType === 'borrow' ? 'Đi vay' : 'Cho vay'}
                            </span>
                          ) : (
                            <span
                              className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 whitespace-nowrap ${
                                isInc
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.category}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0 hidden md:inline">
                            {item.date}
                          </span>
                        </div>

                        {/* Person / Partner name if loan */}
                        {isLoan && item.personName && (
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3 text-slate-400 inline" />
                            <span>Người giao dịch: <strong>{item.personName}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div
                        className={`text-xs sm:text-sm font-extrabold text-right whitespace-nowrap ${
                          isInc
                            ? 'text-emerald-600'
                            : isLoan
                            ? item.loanType === 'borrow'
                              ? 'text-amber-600'
                              : 'text-indigo-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {isInc ? '+' : isLoan ? (item.loanType === 'borrow' ? '+' : '-') : '-'}{formatCurrency(item.amount)}
                      </div>

                      {/* Loan Settled Button */}
                      {isLoan && (
                        <div className="flex items-center gap-1">
                          {item.isPaid ? (
                            <button
                              onClick={() => onUpdateExpense?.({ ...item, isPaid: false })}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-all flex items-center gap-1"
                              title="Bấm để chuyển về trạng thái Chưa trả"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã trả</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateExpense?.({ ...item, isPaid: true })}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all flex items-center gap-1"
                              title="Đánh dấu đã trả khoản vay"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Đã trả khoản vay</span>
                            </button>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setExpToDelete(item)}
                        className="w-7 h-7 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

      {/* EDIT LENDING BALANCE MODAL */}
      {isEditLendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Cập nhật Số dư cho vay</h3>
              </div>
              <button
                onClick={() => setIsEditLendingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLendingBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số tiền bạn cho người khác mượn (VNĐ)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">
                    ₫
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Nhập số tiền..."
                    value={tempLendingInput}
                    onChange={(e) => setTempLendingInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {tempLendingInput && (
                  <p className="text-[11px] font-bold text-amber-700 mt-1">
                    = {formatCurrency(parseFloat(tempLendingInput) || 0)}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed">
                💡 <strong>Số dư chính</strong> sẽ tự động tính = <strong>Số dư hiện tại</strong> + <strong>Số dư cho vay</strong>.
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Cập nhật số dư</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TRANSACTION / LOAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-emerald-100 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {type === 'loan' ? 'Tạo Ghi Chép Vay Mượn' : 'Ghi chép Thu / Chi mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* Type Switcher (3 Tabs) */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px]">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Chi Tiêu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Thu Nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('loan')}
                  className={`py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1 ${
                    type === 'loan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Vay Mượn</span>
                </button>
              </div>

              {/* Sub-Loan Direction Switcher if Loan */}
              {type === 'loan' && (
                <div className="grid grid-cols-2 gap-2 bg-indigo-50/80 p-1.5 rounded-2xl border border-indigo-100">
                  <button
                    type="button"
                    onClick={() => {
                      setLoanType('lend');
                      setCategory('Cho vay');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                      loanType === 'lend'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>Cho vay (Người khác nợ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoanType('borrow');
                      setCategory('Đi vay');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                      loanType === 'borrow'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Đi vay (Mình nợ)</span>
                  </button>
                </div>
              )}

              {/* Person / Partner Name Input if Loan */}
              {type === 'loan' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {loanType === 'lend' ? 'Người mượn tiền' : 'Người cho vay tiền'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Anh Nam, Bạn An, Ngân hàng..."
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

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
                    placeholder="Ví dụ: 1000000"
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
                  {(type === 'expense'
                    ? EXPENSE_CATEGORIES
                    : type === 'income'
                    ? INCOME_CATEGORIES
                    : LOAN_CATEGORIES
                  ).map((c) => (
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
                  placeholder={
                    type === 'loan'
                      ? 'Ví dụ: Cho mượn mua điện thoại, Vay đóng tiền nhà...'
                      : 'Ví dụ: Cơm trưa, Đi chợ mua rau, Lương tháng...'
                  }
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
                  className={`w-full py-3 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                    type === 'loan'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{type === 'loan' ? 'Lưu Khoản Vay Mượn' : 'Lưu Giao Dịch'}</span>
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
