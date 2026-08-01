import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, X, Plus, Minus, Timer, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface KitchenTimerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialMinutes?: number;
}

export const KitchenTimer: React.FC<KitchenTimerProps> = ({
  isOpen,
  onClose,
  initialTitle = 'Bộ hẹn giờ nấu ăn',
  initialMinutes = 5,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const [timeLeft, setTimeLeft] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>(initialTitle);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  // Custom input state
  const [customMin, setCustomMin] = useState<number>(initialMinutes);
  const [customSec, setCustomSec] = useState<number>(0);

  // Audio Context ref for synthesized alarm sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // Update when initialMinutes or initialTitle change when opening
  useEffect(() => {
    if (isOpen) {
      const secs = initialMinutes * 60;
      setTotalSeconds(secs);
      setTimeLeft(secs);
      setCustomMin(initialMinutes);
      setCustomSec(0);
      setTimerLabel(initialTitle);
      setIsFinished(false);
    }
  }, [isOpen, initialMinutes, initialTitle]);

  // Timer countdown tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playAlarmSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Clean up alarm sound on unmount/close
  useEffect(() => {
    return () => {
      stopAlarmSound();
    };
  }, []);

  // Web Audio Beep Generator for clean sound without external assets
  const playAlarmSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }

      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Repeat beep every 0.8 seconds
        let count = 0;
        alarmIntervalRef.current = window.setInterval(() => {
          if (count >= 10) {
            stopAlarmSound();
            return;
          }
          count++;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }, 800);
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const handleStartPause = () => {
    if (isFinished) {
      setIsFinished(false);
      stopAlarmSound();
      setTimeLeft(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    stopAlarmSound();
    setTimeLeft(totalSeconds);
  };

  const handleAddMinutes = (mins: number) => {
    const newSecs = Math.max(0, timeLeft + mins * 60);
    setTimeLeft(newSecs);
    setTotalSeconds((prev) => Math.max(prev, newSecs));
  };

  const handleSelectPreset = (mins: number) => {
    const secs = mins * 60;
    setTotalSeconds(secs);
    setTimeLeft(secs);
    setCustomMin(mins);
    setCustomSec(0);
    setIsFinished(false);
    stopAlarmSound();
  };

  const handleApplyCustomTime = () => {
    const total = (Number(customMin) || 0) * 60 + (Number(customSec) || 0);
    if (total > 0) {
      setTotalSeconds(total);
      setTimeLeft(total);
      setIsFinished(false);
      stopAlarmSound();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress percentage for SVG ring
  const progressPercent = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-linear-to-r from-pink-50 via-white to-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF8FB8] text-white flex items-center justify-center shadow-xs">
              <Timer className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{timerLabel}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Hẹn giờ nấu ăn thông minh</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopAlarmSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Alarm Ringing Banner */}
          {isFinished && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-rose-800">ĐÃ HẾT GIỜ NẤU!</h4>
                <p className="text-[11px] text-rose-600 font-medium">Món ăn của bạn đã hoàn thành thời gian hẹn.</p>
              </div>
              <button
                onClick={() => {
                  setIsFinished(false);
                  stopAlarmSound();
                }}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-xs"
              >
                Tắt chuông
              </button>
            </div>
          )}

          {/* Central Circular Display */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* SVG Circular Progress Bar */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-100"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`transition-all duration-500 ${
                    isFinished
                      ? 'stroke-rose-500'
                      : isRunning
                      ? 'stroke-[#FF8FB8]'
                      : 'stroke-amber-400'
                  }`}
                  strokeWidth="7"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Digital Time Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`text-3xl font-black tracking-tight font-mono ${
                    isFinished
                      ? 'text-rose-600 animate-pulse'
                      : isRunning
                      ? 'text-slate-800'
                      : 'text-slate-700'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {isRunning ? 'Đang đếm ngược' : isFinished ? 'Đã xong!' : 'Sẵn sàng'}
                </span>
              </div>
            </div>

            {/* Quick Time Adjustment Buttons (+1m, +5m) */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleAddMinutes(-1)}
                disabled={timeLeft <= 60}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <Minus className="w-3.5 h-3.5" /> 1 phút
              </button>
              <button
                onClick={() => handleAddMinutes(1)}
                className="px-3 py-1.5 rounded-xl bg-pink-50 text-[#FF8FB8] text-xs font-bold hover:bg-pink-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 1 phút
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                className="px-3 py-1.5 rounded-xl bg-pink-50 text-[#FF8FB8] text-xs font-bold hover:bg-pink-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 5 phút
              </button>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold transition-all"
              title="Đặt lại"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartPause}
              className={`flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 ${
                isRunning ? 'bg-amber-500' : 'bg-[#FF8FB8]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>TẠM DỪNG</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>{timeLeft === 0 ? 'BẮT ĐẦU LẠI' : 'BẮT ĐẦU HẸN GIỜ'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Mốc thời gian phổ biến:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10, 15, 20, 30, 45].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectPreset(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    totalSeconds === m * 60 && !isRunning
                      ? 'bg-[#FF8FB8] text-white border-[#FF8FB8] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-pink-50 hover:border-pink-200'
                  }`}
                >
                  {m} phút
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time Input */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Nhập thời gian tùy chỉnh:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={customMin}
                  onChange={(e) => setCustomMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-slate-800"
                />
                <span className="text-xs text-slate-500 font-semibold">Phút</span>
              </div>

              <div className="flex-1 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSec}
                  onChange={(e) => setCustomSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-12 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-slate-800"
                />
                <span className="text-xs text-slate-500 font-semibold">Giây</span>
              </div>

              <button
                onClick={handleApplyCustomTime}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
