import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Wifi,
  WifiOff,
  CheckCircle2,
  Lock,
  KeyRound,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  Cloud,
  Trash2,
  Sparkles,
  Database,
} from 'lucide-react';
import { Category, ExpenseItem, IngredientItem, Recipe } from '../types';
import { useOffline } from '../hooks/useOffline';
import { testFirestoreConnection } from '../services/firestoreSync';

interface SettingsViewProps {
  recipes: Recipe[];
  ingredients: IngredientItem[];
  categories: Category[];
  expenses?: ExpenseItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onLogoutAdmin?: () => void;
  onOpenChangePin?: () => void;
  onResetData: () => void;
  onClearExpenseData?: () => void;
  onImportData: (data: { recipes: Recipe[]; ingredients: IngredientItem[]; categories: Category[] }) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  recipes,
  ingredients,
  categories,
  expenses = [],
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenChangePin,
  onResetData,
  onClearExpenseData,
  onImportData,
}) => {
  const { isOffline, swRegistered, cacheStatus, cacheAllRecipesOffline } = useOffline();
  const [cacheSuccessMsg, setCacheSuccessMsg] = useState(false);

  // Firestore Test State
  const [isTestingFs, setIsTestingFs] = useState(false);
  const [fsTestResult, setFsTestResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
  } | null>(null);

  const handleTestFirestore = async () => {
    setIsTestingFs(true);
    setFsTestResult(null);
    const result = await testFirestoreConnection();
    setFsTestResult(result);
    setIsTestingFs(false);
  };

  const handleManualCacheSync = async () => {
    const success = await cacheAllRecipesOffline({ recipes, ingredients, categories });
    if (success) {
      setCacheSuccessMsg(true);
      setTimeout(() => setCacheSuccessMsg(false), 3000);
    }
  };

  const handleExportJson = () => {
    const data = {
      recipes,
      ingredients,
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cong-thuc-mon-an-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExpenseCsv = () => {
    if (!expenses || expenses.length === 0) {
      alert('Chưa có lịch sử chi tiêu nào để xuất!');
      return;
    }

    const headers = ['Mã giao dịch', 'Ngày', 'Loại', 'Danh mục', 'Ghi chú', 'Số tiền (VNĐ)', 'Hình thức thanh toán'];

    const rows = expenses.map((item) => {
      const typeText = item.type === 'income' ? 'Thu nhập' : 'Chi tiêu';
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
    a.download = `lich-su-chi-tieu-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.recipes && parsed.ingredients && parsed.categories) {
          onImportData(parsed);
          alert('Khôi phục dữ liệu công thức thành công!');
        } else {
          alert('File JSON không hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in max-w-lg mx-auto">
      {/* Compact App Info Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#FF8FB8] flex items-center justify-center font-bold text-lg border border-pink-100 shrink-0">
            🍲
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-xs">Cài Đặt Hệ Thống</h2>
            <p className="text-[11px] text-slate-400 font-medium">Quản lý bởi Đỗ Đức Huy</p>
          </div>
        </div>

        <div
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shrink-0 ${
            isAdmin
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isAdmin ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
          <span>{isAdmin ? 'Quyền Admin' : 'Khách'}</span>
        </div>
      </div>

      {/* Admin Auth Control */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Tài khoản Admin
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {isAdmin ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
          </span>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenChangePin}
              className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Đổi mã PIN</span>
            </button>
            <button
              onClick={onLogoutAdmin}
              className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAdminLogin}
            className="w-full py-2.5 px-3 bg-[#FF8FB8] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Đăng nhập Admin (Nhập PIN)</span>
          </button>
        )}
      </div>

      {/* Sync & Offline Status */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Đồng bộ & Mạng
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Cloud Sync Button */}
          <button
            onClick={handleTestFirestore}
            disabled={isTestingFs}
            className="p-2.5 bg-slate-50 hover:bg-pink-50/60 rounded-xl border border-slate-200/80 flex items-center gap-2 text-left transition-colors"
          >
            <Cloud className="w-4 h-4 text-[#FF8FB8] shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-700 block truncate">Firebase Cloud</span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {isTestingFs ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </span>
            </div>
          </button>

          {/* Cache Button */}
          <button
            onClick={handleManualCacheSync}
            className="p-2.5 bg-slate-50 hover:bg-pink-50/60 rounded-xl border border-slate-200/80 flex items-center gap-2 text-left transition-colors"
          >
            <Database className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-slate-700 block truncate">Cache Offline</span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                {cacheStatus === 'caching' ? 'Đang lưu...' : 'Lưu vào bộ nhớ'}
              </span>
            </div>
          </button>
        </div>

        {fsTestResult && (
          <div
            className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 ${
              fsTestResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {fsTestResult.success ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span className="truncate">{fsTestResult.message}</span>
          </div>
        )}

        {cacheSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã lưu thành công dữ liệu Offline!</span>
          </div>
        )}
      </div>

      {/* Data Management Actions */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
          Quản lý dữ liệu
        </span>

        <div className="space-y-1.5 text-xs">
          <button
            onClick={handleExportExpenseCsv}
            className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between text-slate-700 font-bold"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Xuất lịch sử thu chi (CSV)</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Excel
            </span>
          </button>

          <button
            onClick={handleExportJson}
            className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-[#FF8FB8] transition-colors flex items-center justify-between text-slate-700 font-bold"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-[#FF8FB8] shrink-0" />
              <span>Xuất công thức (JSON)</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Tải về
            </span>
          </button>

          <label className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-800 transition-colors flex items-center justify-between text-slate-700 font-bold cursor-pointer">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Nhập công thức (JSON)</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Chọn file
            </span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử giao dịch và dữ liệu sổ tay thu chi?')) {
                if (onClearExpenseData) {
                  onClearExpenseData();
                } else {
                  localStorage.removeItem('app_expenses');
                  localStorage.removeItem('app_lending_balance');
                }
                alert('Đã xóa toàn bộ dữ liệu thu chi thành công!');
              }
            }}
            className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-600 transition-colors flex items-center justify-between font-bold"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Xóa lịch sử thu chi</span>
            </div>
            <span className="text-[10px] font-bold text-rose-500 bg-white px-2 py-0.5 rounded-md border border-rose-200">
              Xóa
            </span>
          </button>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn đặt lại tất cả dữ liệu về mặc định ban đầu?')) {
                onResetData();
                alert('Đã khôi phục dữ liệu ban đầu!');
              }
            }}
            className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-between font-bold"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Khôi phục dữ liệu mẫu</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Đặt lại
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
