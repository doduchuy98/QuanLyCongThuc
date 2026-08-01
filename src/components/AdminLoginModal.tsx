import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (pin: string) => boolean; // returns true if success
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Vui lòng nhập mã PIN!');
      return;
    }

    const success = onLogin(pin);
    if (success) {
      setPin('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Mã PIN không đúng! Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-pink-100 relative space-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#FF8FB8] to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-200">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Đăng Nhập Quyền Admin</h3>
          <p className="text-xs text-slate-500 leading-relaxed px-2">
            Khi triển khai trên Vercel, chế độ xem mặc định cho người dùng. Nhập mã PIN Admin để thực hiện các chỉnh sửa.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <span>Mã PIN xác thực</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={10}
                placeholder="Nhập mã PIN Admin..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all text-center tracking-widest"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center animate-shake">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#FF8FB8] to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-pink-200 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Mở khóa quyền Admin</span>
          </button>

          <p className="text-[10px] text-slate-400 text-center pt-1">
            Mã PIN được lưu trong cài đặt trình duyệt của Admin. Bạn có thể đổi mã PIN này trong phần Cài đặt.
          </p>
        </form>
      </div>
    </div>
  );
};
