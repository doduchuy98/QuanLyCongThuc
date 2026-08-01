import React, { useState } from 'react';
import { KeyRound, Check, X, ShieldCheck } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onChangePin: (newPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onChangePin,
}) => {
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinInput !== currentPin) {
      setErrorMsg('Mã PIN hiện tại không chính xác!');
      return;
    }
    if (!newPinInput.trim() || newPinInput.length < 4) {
      setErrorMsg('Mã PIN mới phải từ 4 ký tự trở lên!');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setErrorMsg('Mã PIN mới và nhập lại PIN không trùng khớp!');
      return;
    }

    onChangePin(newPinInput);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
      setErrorMsg('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-pink-100 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-200">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800">Đổi Mã PIN Admin</h3>
          <p className="text-xs text-slate-500">Đặt mã PIN mới để bảo vệ quyền quản trị khi công khai web.</p>
        </div>

        {successMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold text-center space-y-1">
            <Check className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-sm font-extrabold">Đổi mã PIN thành công!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mã PIN cũ</label>
              <input
                type="password"
                placeholder="Nhập mã PIN hiện tại..."
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Mã PIN mới (Ít nhất 4 ký tự)</label>
              <input
                type="password"
                placeholder="Nhập mã PIN mới..."
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Xác nhận mã PIN mới</label>
              <input
                type="password"
                placeholder="Nhập lại mã PIN mới..."
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
              />
            </div>

            {errorMsg && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF8FB8] hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Lưu mã PIN mới
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
