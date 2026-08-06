import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  UserPlus,
  LogIn,
  X,
  KeyRound,
  ShieldAlert,
  Sparkles,
  User,
  ArrowRight,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { FinanceUser } from '../types';

interface FinanceAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: FinanceUser[];
  currentUser: FinanceUser | null;
  onLogin: (user: FinanceUser, inputPin: string) => boolean;
  onCreateAccount: (newUser: Omit<FinanceUser, 'id' | 'createdAt'>) => boolean;
  onNavigateToSettings?: () => void;
}

export const FinanceAuthModal: React.FC<FinanceAuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLogin,
  onCreateAccount,
  onNavigateToSettings,
}) => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [selectedUserId, setSelectedUserId] = useState<string>(
    currentUser?.id || users[0]?.id || ''
  );
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New account form state
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setErrorMsg('Vui lòng chọn tài khoản đăng nhập!');
      return;
    }

    if (!pin) {
      setErrorMsg('Vui lòng nhập mã PIN!');
      return;
    }

    const success = onLogin(targetUser, pin);
    if (success) {
      setPin('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('Mã PIN không chính xác. Vui lòng thử lại!');
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newName.trim()) {
      setErrorMsg('Vui lòng nhập tên hiển thị!');
      return;
    }
    if (!newUsername.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập!');
      return;
    }
    const cleanUsername = newUsername.trim().toLowerCase().replace(/\s+/g, '_');
    if (users.some((u) => u.username === cleanUsername)) {
      setErrorMsg('Tên đăng nhập này đã tồn tại! Vui lòng chọn tên khác.');
      return;
    }
    if (!newPin || newPin.length < 4) {
      setErrorMsg('Mã PIN phải bao gồm ít nhất 4 chữ số!');
      return;
    }

    const success = onCreateAccount({
      name: newName.trim(),
      username: cleanUsername,
      pin: newPin.trim(),
      avatarBg: ['#FF8FB8', '#4ADE80', '#60A5FA', '#F59E0B', '#A855F7'][
        Math.floor(Math.random() * 5)
      ],
    });

    if (success) {
      setNewName('');
      setNewUsername('');
      setNewPin('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('Tạo tài khoản thất bại! Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                <span>Đăng Nhập Sổ Thu Chi</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Dữ liệu thu chi được bảo mật riêng cho từng tài khoản
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50 p-1.5">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-indigo-950 shadow-2xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chọn tài khoản ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setMode('create');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
              mode === 'create'
                ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Account Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Chọn tài khoản đăng nhập
                </label>

                {users.length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-600">
                      Chưa có tài khoản nào
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nhấn vào tab "Tạo tài khoản mới" ở trên để khởi tạo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {users.map((user) => {
                      const isSelected = selectedUserId === user.id;
                      const isCurrent = currentUser?.id === user.id;

                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setErrorMsg(null);
                          }}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-2xs"
                              style={{
                                backgroundColor: user.avatarBg || '#FF8FB8',
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                                    Đang đăng nhập
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                @{user.username}
                              </p>
                            </div>
                          </div>

                          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                            {isSelected && (
                              <div className="w-3 h-3 rounded-full bg-indigo-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PIN Input */}
              {users.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Nhập mã PIN xác thực</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Mặc định: 1004
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Nhập mã PIN (VD: 1004)"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 tracking-widest placeholder-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={users.length === 0}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>Xác nhận & Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">
                  Tên hiển thị (Họ & Tên)
                </label>
                <input
                  type="text"
                  placeholder="VD: Đỗ Đức Huy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">
                  Tên đăng nhập (Username)
                </label>
                <input
                  type="text"
                  placeholder="VD: duchuy_2026"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 block">
                  Đặt mã PIN (4-6 chữ số)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="VD: 1004"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo tài khoản & Đăng nhập ngay</span>
              </button>
            </form>
          )}

          {/* Footer Navigation link */}
          {onNavigateToSettings && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Quản lý nâng cao?</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToSettings();
                }}
                className="font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Mở Cài đặt tài khoản</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
