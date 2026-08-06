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
  ChevronDown,
  ChevronUp,
  History,
  Download,
  Upload,
  Database,
} from 'lucide-react';
import { ExpenseItem, AppMode, FinanceUser } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';
import { formatCurrency } from '../utils/costUtils';
import { UserCheck } from 'lucide-react';

interface ExpenseTrackerViewProps {
  expenses: ExpenseItem[];
  onAddExpense: (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateExpense?: (item: ExpenseItem) => void;
  onSwitchMode: (mode: AppMode) => void;
  currentUser?: FinanceUser | null;
  onOpenFinanceAuth?: () => void;
  onExportFinanceData?: () => void;
  onImportFinanceData?: (imported: ExpenseItem[], mode: 'merge' | 'replace') => void;
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
  currentUser,
  onOpenFinanceAuth,
  onExportFinanceData,
  onImportFinanceData,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'loan'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState<ExpenseItem | null>(null);

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let items: ExpenseItem[] = [];

        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && Array.isArray(parsed.expenses)) {
          items = parsed.expenses;
        } else {
          alert('Cấu trúc file sao lưu thu chi không hợp lệ!');
          return;
        }

        if (items.length === 0) {
          alert('File sao lưu không chứa bản ghi thu/chi nào!');
          return;
        }

        const isReplace = confirm(
          `Tìm thấy ${items.length} bản ghi thu/chi trong file sao lưu.\n\n` +
            `• Bấm [OK] để THAY THẾ toàn bộ dữ liệu thu/chi hiện tại.\n` +
            `• Bấm [Hủy/Cancel] để GỘP THÊM vào dữ liệu hiện tại.`
        );

        if (onImportFinanceData) {
          onImportFinanceData(items, isReplace ? 'replace' : 'merge');
          alert(`Đã ${isReplace ? 'khôi phục' : 'gộp thêm'} ${items.length} bản ghi thu/chi thành công!`);
        }
      } catch (err) {
        alert('Lỗi đọc file sao lưu. Vui lòng kiểm tra định dạng file JSON!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
    if (saved !== null && saved !== '2500000') {
      const parsed = parseFloat(saved);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });
  const [isEditLendingModalOpen, setIsEditLendingModalOpen] = useState(false);
  const [tempLendingInput, setTempLendingInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('app_lending_balance', lendingBalance.toString());
  }, [lendingBalance]);

  // Loan management state
  const [loanViewMode, setLoanViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [expandedPersons, setExpandedPersons] = useState<{ [key: string]: boolean }>({});

  // Repayment Modal State (Trả trước / Trả bớt)
  const [repaymentModalData, setRepaymentModalData] = useState<{
    personName: string;
    loanType: 'borrow' | 'lend';
    remainingAmount: number;
  } | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<string>('');
  const [repaymentDate, setRepaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [repaymentMethod, setRepaymentMethod] = useState<'cash' | 'transfer' | 'card'>('transfer');
  const [repaymentNote, setRepaymentNote] = useState<string>('');

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

  // All-time totals for current wallet balance
  const allTimeIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const allTimeExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Totals filtered by selected Month & Year
  const totalIncome = expenses
    .filter((e) => {
      if (e.type !== 'income') return false;
      const { year, month } = parseYearMonth(e.date);
      const matchesYear = selectedYearFilter === 'all' || year === selectedYearFilter;
      const matchesMonth = selectedMonthFilter === 'all' || month === selectedMonthFilter;
      return matchesYear && matchesMonth;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = expenses
    .filter((e) => {
      if (e.type !== 'expense') return false;
      const { year, month } = parseYearMonth(e.date);
      const matchesYear = selectedYearFilter === 'all' || year === selectedYearFilter;
      const matchesMonth = selectedMonthFilter === 'all' || month === selectedMonthFilter;
      return matchesYear && matchesMonth;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // 1. Khoản cho vay
  let totalLendOriginal = 0; // Tổng gốc tiền cho vay
  let totalLendRepaid = 0;   // Tổng tiền đã được trả trước / thu hồi

  // 2. Khoản đi vay
  let totalBorrowOriginal = 0; // Tổng gốc tiền đi vay
  let totalBorrowRepaid = 0;   // Tổng tiền đã đi trả nợ

  expenses.filter((e) => e.type === 'loan').forEach((item) => {
    if (item.loanType === 'lend') {
      if (item.isRepayment) {
        totalLendRepaid += item.amount;
      } else {
        totalLendOriginal += item.amount;
        if (item.isPaid) {
          totalLendRepaid += item.amount;
        }
      }
    } else if (item.loanType === 'borrow') {
      if (item.isRepayment) {
        totalBorrowRepaid += item.amount;
      } else {
        totalBorrowOriginal += item.amount;
        if (item.isPaid) {
          totalBorrowRepaid += item.amount;
        }
      }
    }
  });

  // Số dư cho vay còn lại từ giao dịch = max(0, Cho vay - Đã thu hồi)
  const netPendingLend = Math.max(0, totalLendOriginal - totalLendRepaid);

  // Số dư đi vay còn lại từ giao dịch = max(0, Đi vay - Đã trả)
  const netPendingBorrow = Math.max(0, totalBorrowOriginal - totalBorrowRepaid);

  // SỐ DƯ CHO VAY = Số dư cơ sở + Số dư cho vay chưa thu hồi
  const totalLendingDisplay = lendingBalance + netPendingLend;

  // SỐ DƯ HIỆN TẠI = (Thu nhập - Chi tiêu) - (Cho vay gốc - Cho vay đã thu hồi) + (Đi vay gốc - Đi vay đã trả)
  const netBalance =
    allTimeIncome -
    allTimeExpense -
    netPendingLend +
    netPendingBorrow;

  // Main Balance = Current Net Balance + Total Lending Balance
  const mainBalance = netBalance + totalLendingDisplay;

  // Grouped Loan Summaries by Person
  interface PersonLoanSummary {
    key: string;
    personName: string;
    loanType: 'borrow' | 'lend';
    totalOriginal: number;
    totalRepaid: number;
    netRemaining: number;
    isFullyPaid: boolean;
    items: ExpenseItem[];
  }

  const personLoanSummaries = React.useMemo(() => {
    const map = new Map<string, PersonLoanSummary>();

    const loanItems = expenses.filter((e) => e.type === 'loan');

    loanItems.forEach((item) => {
      const pName = (item.personName && item.personName.trim()) ? item.personName.trim() : 'Khách chưa đặt tên';
      const lType = item.loanType || 'lend';
      const key = `${pName}___${lType}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          personName: pName,
          loanType: lType,
          totalOriginal: 0,
          totalRepaid: 0,
          netRemaining: 0,
          isFullyPaid: false,
          items: [],
        });
      }

      const summary = map.get(key)!;
      summary.items.push(item);

      if (item.isRepayment) {
        summary.totalRepaid += item.amount;
      } else {
        summary.totalOriginal += item.amount;
        if (item.isPaid) {
          summary.totalRepaid += item.amount;
        }
      }
    });

    return Array.from(map.values()).map((summary) => {
      summary.items.sort((a, b) => b.date.localeCompare(a.date));

      const allMainPaid =
        summary.items.filter((i) => !i.isRepayment).length > 0 &&
        summary.items.filter((i) => !i.isRepayment).every((i) => i.isPaid);

      const remaining = Math.max(0, summary.totalOriginal - summary.totalRepaid);
      summary.netRemaining = allMainPaid ? 0 : remaining;
      summary.isFullyPaid = summary.netRemaining === 0 || allMainPaid;

      return summary;
    }).filter((s) => {
      if (!searchQuery) return true;
      return s.personName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [expenses, searchQuery]);

  // Handlers for Loan Card Actions
  const handleOpenVayThem = (summary: PersonLoanSummary) => {
    setType('loan');
    setLoanType(summary.loanType);
    setCategory(summary.loanType === 'lend' ? 'Cho vay' : 'Đi vay');
    setPersonName(summary.personName);
    setNote(summary.loanType === 'lend' ? 'Cho vay thêm' : 'Vay thêm');
    setAmount('');
    setIsAddModalOpen(true);
  };

  const handleOpenRepaymentModal = (summary: PersonLoanSummary) => {
    setRepaymentModalData({
      personName: summary.personName,
      loanType: summary.loanType,
      remainingAmount: summary.netRemaining,
    });
    setRepaymentAmount(summary.netRemaining > 0 ? summary.netRemaining.toString() : '');
    setRepaymentDate(new Date().toISOString().split('T')[0]);
    setRepaymentMethod('transfer');
    setRepaymentNote(summary.loanType === 'lend' ? 'Trả trước / Thu hồi nợ' : 'Trả trước / Thanh toán nợ');
  };

  const handleConfirmRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentModalData) return;

    const numAmount = parseFloat(repaymentAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Vui lòng nhập số tiền trả trước hợp lệ!');
      return;
    }

    onAddExpense({
      type: 'loan',
      loanType: repaymentModalData.loanType,
      isRepayment: true,
      personName: repaymentModalData.personName,
      amount: numAmount,
      category: repaymentModalData.loanType === 'lend' ? 'Cho vay' : 'Đi vay',
      note: repaymentNote.trim() || (repaymentModalData.loanType === 'lend' ? 'Trả trước / Thu hồi nợ' : 'Trả trước / Thanh toán nợ'),
      date: repaymentDate,
      paymentMethod: repaymentMethod,
    });

    // If repayment covers or exceeds remaining debt, mark unpaid loan items for this person as isPaid
    if (numAmount >= repaymentModalData.remainingAmount && onUpdateExpense) {
      const personItems = expenses.filter(
        (item) =>
          item.type === 'loan' &&
          item.personName === repaymentModalData.personName &&
          item.loanType === repaymentModalData.loanType &&
          !item.isRepayment &&
          !item.isPaid
      );
      personItems.forEach((item) => {
        onUpdateExpense({ ...item, isPaid: true });
      });
    }

    setRepaymentModalData(null);
    setRepaymentAmount('');
    setRepaymentNote('');
  };

  const handleSettleAllForPerson = (summary: PersonLoanSummary) => {
    if (!onUpdateExpense) return;
    const personItems = expenses.filter(
      (item) =>
        item.type === 'loan' &&
        item.personName === summary.personName &&
        item.loanType === summary.loanType &&
        !item.isPaid
    );
    personItems.forEach((item) => {
      onUpdateExpense({ ...item, isPaid: true });
    });
  };

  const toggleExpandPerson = (key: string) => {
    setExpandedPersons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

      {/* Account User Header Pill Bar */}
      {currentUser && (
        <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-xl font-black text-white text-xs flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: currentUser.avatarBg || '#FF8FB8' }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-800 text-xs truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-md shrink-0">
                  Sổ cá nhân
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                @{currentUser.username} • Dữ liệu lưu riêng biệt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onExportFinanceData && (
              <button
                onClick={onExportFinanceData}
                className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl border border-emerald-200/80 transition-all flex items-center gap-1 shrink-0"
                title="Sao lưu dữ liệu JSON"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Sao lưu</span>
              </button>
            )}

            {onImportFinanceData && (
              <label
                className="py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                title="Khôi phục dữ liệu từ JSON"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Khôi phục</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            )}

            {onOpenFinanceAuth && (
              <button
                onClick={onOpenFinanceAuth}
                className="py-1.5 px-2.5 sm:px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200/80 transition-all flex items-center gap-1 shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Đổi tài khoản</span>
              </button>
            )}
          </div>
        </div>
      )}

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
            <span>Cho vay: <strong className="text-amber-400 font-bold">{formatCurrency(totalLendingDisplay)}</strong></span>
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
              <span>Số dư cho vay</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HandCoins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-800 tracking-tight">
              {formatCurrency(totalLendingDisplay)}
            </div>
          </div>

          {/* Card 3: Tổng Thu Nhập */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2 hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>
                Tổng thu nhập
                {selectedMonthFilter !== 'all' && ` (Tháng ${parseInt(selectedMonthFilter, 10)})`}
                {selectedYearFilter !== 'all' && selectedMonthFilter === 'all' && ` (${selectedYearFilter})`}
              </span>
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
              <span>
                Tổng chi tiêu
                {selectedMonthFilter !== 'all' && ` (Tháng ${parseInt(selectedMonthFilter, 10)})`}
                {selectedYearFilter !== 'all' && selectedMonthFilter === 'all' && ` (${selectedYearFilter})`}
              </span>
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-nowrap overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'expense'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🔴 Chi tiêu
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🟢 Thu nhập
          </button>
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
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
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto flex-nowrap overflow-x-auto no-scrollbar">
              <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <span>{activeTab === 'loan' ? 'Lịch sử vay mượn' : 'Lịch sử giao dịch'}</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                  ({activeTab === 'loan' && loanViewMode === 'grouped' ? personLoanSummaries.length : filteredExpenses.length} {activeTab === 'loan' && loanViewMode === 'grouped' ? 'người' : 'giao dịch'})
                </span>
              </h3>

              {/* View Switcher for Loan Tab */}
              {activeTab === 'loan' && (
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold shrink-0 whitespace-nowrap">
                  <button
                    onClick={() => setLoanViewMode('grouped')}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      loanViewMode === 'grouped'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    👥 Theo người
                  </button>
                  <button
                    onClick={() => setLoanViewMode('flat')}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      loanViewMode === 'flat'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📋 Chi tiết
                  </button>
                </div>
              )}
            </div>

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

          {/* Render Grouped Person View if loan tab and loanViewMode === 'grouped' */}
          {activeTab === 'loan' && loanViewMode === 'grouped' ? (
            personLoanSummaries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <Handshake className="w-10 h-10 text-indigo-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Chưa có danh sách vay mượn nào</p>
                <p className="text-xs text-slate-400">
                  Nhấn nút "Thêm khoản vay" để ghi lại người vay hoặc cho mượn mới!
                </p>
                <button
                  onClick={handleOpenAddLoan}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm khoản vay đầu tiên</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {personLoanSummaries.map((summary) => {
                  const isLend = summary.loanType === 'lend';
                  const isExpanded = !!expandedPersons[summary.key];

                  return (
                    <div
                      key={summary.key}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-indigo-200"
                    >
                      {/* Header section */}
                      <div className="p-3.5 sm:p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-2xs ${
                              isLend
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {summary.personName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                                {summary.personName}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                                  isLend
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {isLend ? 'Cho vay' : 'Đi vay'}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <span>
                                {isLend ? 'Người mượn tiền của bạn' : 'Bạn mượn tiền người này'}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Status pill */}
                        <div className="flex items-center gap-2">
                          {summary.isFullyPaid ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã tất toán</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <HandCoins className="w-3.5 h-3.5 text-amber-600" />
                              <span>Còn nợ: {formatCurrency(summary.netRemaining)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metrics Breakdown */}
                      <div className="p-3 sm:p-4 grid grid-cols-3 gap-2 bg-white text-center border-b border-slate-100">
                        <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            Số tiền đã vay
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                            {formatCurrency(summary.totalOriginal)}
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                            Trả trước / Thu hồi
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                            {formatCurrency(summary.totalRepaid)}
                          </span>
                        </div>

                        <div
                          className={`p-2 sm:p-2.5 rounded-2xl border ${
                            summary.isFullyPaid
                              ? 'bg-slate-50 border-slate-100 text-slate-400'
                              : isLend
                              ? 'bg-amber-50/60 border-amber-100 text-amber-800'
                              : 'bg-indigo-50/60 border-indigo-100 text-indigo-800'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5">
                            Còn nợ lại
                          </span>
                          <span className="text-xs sm:text-sm font-black">
                            {formatCurrency(summary.netRemaining)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Controls */}
                      <div className="p-3 bg-slate-50/30 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Vay thêm */}
                          <button
                            onClick={() => handleOpenVayThem(summary)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Vay thêm</span>
                          </button>

                          {/* Trả trước */}
                          <button
                            onClick={() => handleOpenRepaymentModal(summary)}
                            disabled={summary.isFullyPaid}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                              summary.isFullyPaid
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Trả trước</span>
                          </button>

                          {/* Tất toán */}
                          {!summary.isFullyPaid && (
                            <button
                              onClick={() => handleSettleAllForPerson(summary)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all flex items-center gap-1"
                              title="Xác nhận tất toán toàn bộ số tiền còn nợ"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Tất toán</span>
                            </button>
                          )}
                        </div>

                        {/* Toggle Journal */}
                        <button
                          onClick={() => toggleExpandPerson(summary.key)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>Nhật ký ({summary.items.length})</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      {/* Expanded items list */}
                      {isExpanded && (
                        <div className="bg-slate-50/80 border-t border-slate-100 p-3 divide-y divide-slate-100/80">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            Lịch sử đợt vay & trả tiền của người này
                          </p>
                          {summary.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-2 flex items-center justify-between gap-2 hover:bg-white/60 rounded-xl px-2 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800">
                                    {item.note}
                                  </span>
                                  {item.isRepayment && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Trả trước
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {item.date} {item.paymentMethod ? `• ${item.paymentMethod === 'transfer' ? 'Chuyển khoản' : item.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}` : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-extrabold ${
                                    item.isRepayment
                                      ? 'text-emerald-600'
                                      : isLend
                                      ? 'text-amber-600'
                                      : 'text-indigo-600'
                                  }`}
                                >
                                  {item.isRepayment ? '+' : '-'}{formatCurrency(item.amount)}
                                </span>
                                <button
                                  onClick={() => setExpToDelete(item)}
                                  className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors"
                                  title="Xóa đợt này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Flat itemized list */
            filteredExpenses.length === 0 ? (
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
                      className="p-2.5 sm:p-3 flex items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors group overflow-hidden"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
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

                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden whitespace-nowrap">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                            {item.note || (isLoan ? item.personName : item.category)}
                          </h4>

                          {/* Person name if loan and different from note */}
                          {isLoan && item.personName && item.note !== item.personName && (
                            <span className="text-[11px] text-slate-500 font-medium truncate shrink-0 max-w-[90px] sm:max-w-none">
                              ({item.personName})
                            </span>
                          )}

                          {isLoan ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 whitespace-nowrap ${
                                item.isRepayment
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.loanType === 'borrow'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              }`}
                            >
                              {item.isRepayment ? 'Trả trước' : item.loanType === 'borrow' ? 'Đi vay' : 'Cho vay'}
                            </span>
                          ) : (
                            <span
                              className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold shrink-0 whitespace-nowrap ${
                                isInc
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {item.category}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0 hidden md:inline">
                            {item.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <div
                          className={`text-xs sm:text-sm font-extrabold text-right whitespace-nowrap shrink-0 ${
                            isInc || item.isRepayment
                              ? 'text-emerald-600'
                              : isLoan
                              ? item.loanType === 'borrow'
                                ? 'text-amber-600'
                                : 'text-indigo-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {isInc || item.isRepayment ? '+' : isLoan ? (item.loanType === 'borrow' ? '+' : '-') : '-'}{formatCurrency(item.amount)}
                        </div>

                        {/* Loan Settled Button */}
                        {isLoan && (
                          <div className="flex items-center shrink-0">
                            {item.isPaid ? (
                              <button
                                onClick={() => onUpdateExpense?.({ ...item, isPaid: false })}
                                className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-all flex items-center gap-1 shrink-0"
                                title="Bấm để chuyển về trạng thái Chưa trả"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Đã trả</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdateExpense?.({ ...item, isPaid: true })}
                                className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all flex items-center gap-1 shrink-0"
                                title="Đánh dấu đã trả khoản vay"
                              >
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Đã trả</span>
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => setExpToDelete(item)}
                          className="w-6 h-6 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100 shrink-0"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
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
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-4 pb-28 sm:pb-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-amber-100 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar mb-2 sm:mb-0">
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

              <div className="pt-2 sticky bottom-0 bg-white py-2 z-10 border-t border-slate-100">
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
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-4 pb-28 sm:pb-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-emerald-100 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar mb-2 sm:mb-0">
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
              <div className="pt-2 sticky bottom-0 bg-white py-2 z-10 border-t border-slate-100">
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

      {/* Modal Trả Trước / Thanh Toán Từng Phần */}
      {repaymentModalData && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-4 pb-28 sm:pb-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-100 space-y-3.5 max-h-[80vh] overflow-y-auto no-scrollbar mb-2 sm:mb-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Trả Trước Khoản Vay
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {repaymentModalData.personName} ({repaymentModalData.loanType === 'lend' ? 'Thu hồi nợ cho vay' : 'Thanh toán nợ đi vay'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRepaymentModalData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRepayment} className="space-y-3.5">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">Còn nợ hiện tại:</span>
                <span className="text-sm font-black text-amber-900">
                  {formatCurrency(repaymentModalData.remainingAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số tiền trả trước (đ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 500000"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày thanh toán
                  </label>
                  <input
                    type="date"
                    value={repaymentDate}
                    onChange={(e) => setRepaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình thức
                  </label>
                  <select
                    value={repaymentMethod}
                    onChange={(e) => setRepaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="transfer">Chuyển khoản</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú đợt trả
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trả trước đợt 1, CK MoMo..."
                  value={repaymentNote}
                  onChange={(e) => setRepaymentNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 sticky bottom-0 bg-white py-2 z-10 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRepaymentModalData(null)}
                  className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  Xác nhận trả trước
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
