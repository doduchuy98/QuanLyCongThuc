import React, { useState, useEffect } from 'react';
import { Download, Upload, RotateCcw, Smartphone, ShieldCheck, HardDrive, Wifi, WifiOff, Database, Sparkles, CheckCircle2, Lock, KeyRound, Globe, FileSpreadsheet, Server, RefreshCw, Copy, Check, AlertTriangle, Cloud, ExternalLink } from 'lucide-react';
import { Category, ExpenseItem, IngredientItem, Recipe } from '../types';
import { useOffline } from '../hooks/useOffline';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';
import { testSupabaseConnection, SUPABASE_INIT_SQL } from '../services/supabaseSync';
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
  onImportData,
}) => {
  const { isOffline, swRegistered, cacheStatus, cacheAllRecipesOffline } = useOffline();
  const [cacheSuccessMsg, setCacheSuccessMsg] = useState(false);

  // Supabase Config State
  const [sbUrlInput, setSbUrlInput] = useState('');
  const [sbKeyInput, setSbKeyInput] = useState('');
  const [isSbConfigured, setIsSbConfigured] = useState(false);
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [sbTestResult, setSbTestResult] = useState<{
    success?: boolean;
    message?: string;
    missingTables?: string[];
    details?: string;
  } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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

  useEffect(() => {
    const config = getSupabaseConfig();
    setSbUrlInput(config.url);
    setSbKeyInput(config.key);
    setIsSbConfigured(config.isConfigured);
  }, []);

  const handleSaveSupabaseConfig = () => {
    saveSupabaseConfig(sbUrlInput, sbKeyInput);
    const updated = getSupabaseConfig();
    setIsSbConfigured(updated.isConfigured);
    alert('Đã lưu cấu hình Supabase! Vui lòng bấm "Kiểm tra kết nối" bên dưới.');
  };

  const handleClearSupabaseConfig = () => {
    clearSupabaseConfig();
    setSbUrlInput('');
    setSbKeyInput('');
    setIsSbConfigured(false);
    setSbTestResult(null);
    alert('Đã xóa cấu hình Supabase.');
  };

  const handleRunTestSupabase = async () => {
    setIsTestingSb(true);
    setSbTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setSbTestResult(res);
    } catch (err: any) {
      setSbTestResult({
        success: false,
        message: `Lỗi kết nối: ${err.message || String(err)}`,
      });
    } finally {
      setIsTestingSb(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_INIT_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
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

    // \uFEFF Byte Order Mark for UTF-8 compatibility with Excel
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
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* App Info Header */}
      <div className="bg-gradient-to-r from-[#FFD9E8] via-[#FFF8FB] to-[#AEE9FF]/60 p-4 rounded-3xl border border-pink-200/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#FF8FB8] flex items-center justify-center font-extrabold text-xl shadow-sm border border-pink-100">
            🍲
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm">Quản Lý Công Thức Món Ăn</h2>
            <p className="text-xs text-slate-500 mt-0.5">Website Công thức & Tính Giá vốn món ăn</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 ${
          isAdmin ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isAdmin ? 'Quyền Admin' : 'Khách (Người dùng)'}</span>
        </div>
      </div>

      {/* Admin Mode Management Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF8FB8]" />
            <span>Phân quyền Quản trị Admin</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Vercel Deployment Mode</span>
        </div>

        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
          {isAdmin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900">Đã kích hoạt quyền Admin</h4>
                    <p className="text-[11px] text-emerald-700">Bạn có toàn quyền Thêm / Sửa / Xóa công thức & giá vốn.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenChangePin}
                  className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Đổi mã PIN Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="flex-1 py-2.5 px-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất Admin</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-900 text-xs leading-relaxed space-y-1">
                <p className="font-extrabold flex items-center gap-1">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>Chế độ Người dùng (Chỉ đọc)</span>
                </p>
                <p className="text-[11px] text-amber-800 font-medium">
                  Người dùng xem công thức, tra cứu chi phí, tính định lượng mà không thể xóa hay sửa dữ liệu gốc của bạn.
                </p>
              </div>

              <button
                onClick={onOpenAdminLogin}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FF8FB8] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Đăng nhập Admin (Nhập mã PIN)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Worker Offline Cache Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Bộ nhớ Cache Ngoại tuyến (Service Worker)
          </h3>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Ngoại tuyến (Offline)' : 'Trực tuyến (Online)'}</span>
          </div>
        </div>

        <div className="p-3.5 bg-gradient-to-r from-pink-50 via-purple-50 to-sky-50 rounded-2xl border border-pink-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Database className="w-4 h-4 text-[#FF8FB8]" />
            <span>Trạng thái Cache: {swRegistered ? 'Sẵn sàng dùng Offline' : 'Kích hoạt Service Worker'}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toàn bộ công thức, hình ảnh và 'Chế độ nấu ăn' được tự động lưu trữ trong Cache trình duyệt. Bạn có thể tra cứu và bật hẹn giờ ngay cả khi vào bếp không có WiFi hoặc mạng di động.
          </p>

          <button
            onClick={handleManualCacheSync}
            className="mt-2 w-full py-2.5 px-3 bg-[#FF8FB8] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{cacheStatus === 'caching' ? 'Đang cập nhật Cache...' : 'Lưu tất cả công thức vào Cache Offline'}</span>
          </button>

          {cacheSuccessMsg && (
            <div className="p-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đã lưu thành công {recipes.length} công thức vào Cache Offline!</span>
            </div>
          )}
        </div>
      </div>

      {/* Firebase Firestore Realtime Cloud Sync Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-[#FF8FB8]" />
            <span>Đồng bộ Đám mây Firebase Firestore</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã kích hoạt</span>
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed text-xs">
            Hệ thống đang tự động đồng bộ 2 chiều (Realtime) dữ liệu <strong>Công thức, Nguyên liệu, Danh mục, Danh sách mua sắm, Chi tiêu</strong> thông qua <strong>Google Firebase Firestore</strong>. Tất cả thay đổi trên điện thoại hoặc máy tính đều được cập nhật ngay lập tức.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleTestFirestore}
              disabled={isTestingFs}
              className="w-full py-2.5 px-3 bg-[#FF8FB8] hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingFs ? 'animate-spin' : ''}`} />
              <span>{isTestingFs ? 'Đang kiểm tra kết nối Firestore...' : 'Kiểm tra trạng thái kết nối Firebase Firestore'}</span>
            </button>

            {fsTestResult && (
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  fsTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-extrabold flex items-center gap-1.5">
                  {fsTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{fsTestResult.success ? 'Kết nối Firebase Firestore thành công!' : 'Phát hiện sự cố'}</span>
                </div>
                <p className="text-[11px] font-medium">{fsTestResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supabase Realtime Cloud Sync Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Đồng bộ Đám mây Supabase</span>
          </h3>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
            isSbConfigured ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {isSbConfigured ? 'Đã bật' : 'Chưa cấu hình'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Tự động đồng bộ dữ liệu công thức, nguyên liệu và chi tiêu giữa nhiều thiết bị theo thời gian thực (Realtime).
          </p>

          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyz.supabase.co"
                value={sbUrlInput}
                onChange={(e) => setSbUrlInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Supabase Anon API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={sbKeyInput}
                onChange={(e) => setSbKeyInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveSupabaseConfig}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lưu thông tin</span>
              </button>

              {isSbConfigured && (
                <button
                  onClick={handleClearSupabaseConfig}
                  className="py-2 px-3 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-all"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTestSupabase}
                disabled={isTestingSb || !isSbConfigured}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSb ? 'animate-spin' : ''}`} />
                <span>{isTestingSb ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối Supabase'}</span>
              </button>

              <button
                onClick={() => setShowSqlModal(true)}
                className="py-2.5 px-3 bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Server className="w-3.5 h-3.5 text-sky-600" />
                <span>SQL Khởi tạo</span>
              </button>
            </div>

            {sbTestResult && (
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                  sbTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-extrabold flex items-center gap-1.5">
                  {sbTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  )}
                  <span>{sbTestResult.success ? 'Kết nối thành công!' : 'Phát hiện sự cố đồng bộ'}</span>
                </div>
                <p className="text-[11px] font-medium">{sbTestResult.message}</p>
                {sbTestResult.missingTables && sbTestResult.missingTables.length > 0 && (
                  <div className="pt-1">
                    <button
                      onClick={() => setShowSqlModal(true)}
                      className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Server className="w-3 h-3" />
                      <span>Bấm vào đây để sao chép SQL tạo các bảng còn thiếu</span>
                    </button>
                  </div>
                )}
                {sbTestResult.details && (
                  <p className="text-[10px] text-slate-500 font-mono bg-white/70 p-1.5 rounded-lg border border-slate-200">
                    {sbTestResult.details}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Restore Data Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Sao lưu & Dữ liệu
        </h3>

        <div className="space-y-2">
          <button
            onClick={handleExportExpenseCsv}
            className="w-full p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 hover:bg-emerald-100/80 transition-colors flex items-center justify-between text-emerald-900 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="text-xs font-bold block">Xuất dữ liệu chi tiêu (CSV - Excel)</span>
                <span className="text-[10px] text-emerald-700 font-medium">Hỗ trợ tiếng Việt đầy đủ ({expenses.length} giao dịch)</span>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
              Tải CSV
            </span>
          </button>

          <button
            onClick={handleExportJson}
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-pink-50 hover:border-pink-200 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-[#FF8FB8]" />
              <span className="text-xs font-bold text-slate-700">Xuất dữ liệu công thức (JSON)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Tải xuống</span>
          </button>

          <label className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-pink-50 hover:border-pink-200 transition-colors flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-700">Nhập dữ liệu công thức (JSON)</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Chọn file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn đặt lại tất cả dữ liệu về mặc định ban đầu?')) {
                onResetData();
                alert('Đã khôi phục dữ liệu ban đầu!');
              }
            }}
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-colors flex items-center justify-between text-rose-600"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs font-bold">Khôi phục dữ liệu mẫu ban đầu</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-400">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Cloud Integration Info */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Tích hợp Google Workspace
        </h3>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <HardDrive className="w-4 h-4 text-amber-500" />
            <span>Google Drive & Sheets Sync Ready</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ứng dụng hỗ trợ đồng bộ công thức và danh sách nguyên liệu trực tiếp vào file Google Sheets cá nhân và sao lưu ảnh lên Google Drive của bạn.
          </p>
        </div>
      </div>

      {/* PWA / App Info */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 space-y-2 text-xs text-slate-500 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Smartphone className="w-4 h-4 text-emerald-500" />
          <span>Website Mobile Đáp Ứng</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Webapp thiết kế tối ưu giao diện Mobile First cho màn hình Safari, Chrome, Edge trên tất cả các thiết bị smartphone.
        </p>
      </div>

      {/* Modal hướng dẫn SQL khởi tạo Supabase */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  SQL Khởi tạo bảng Supabase
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mở <strong className="text-emerald-700">Supabase Dashboard</strong> &gt; Chọn dự án &gt; <strong className="text-slate-800">SQL Editor</strong> &gt; dán đoạn mã bên dưới và bấm <strong className="text-emerald-700">RUN</strong> để khởi tạo 5 bảng dữ liệu &amp; mở quyền truy cập:
            </p>

            <div className="relative bg-slate-900 text-emerald-400 p-3.5 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
              <pre>{SUPABASE_INIT_SQL}</pre>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopySql}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Đã sao chép SQL!' : 'Sao chép đoạn SQL'}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(false)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
