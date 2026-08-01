import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChefHat,
  Volume2,
  Utensils,
  Maximize2,
  Flame,
  Award
} from 'lucide-react';
import { Recipe, CookingStep } from '../types';

interface CookingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  steps: CookingStep[];
  onToggleStepDone: (stepNum: number) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  isOpen,
  onClose,
  recipe,
  steps,
  onToggleStepDone,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [showIngredientsQuickView, setShowIngredientsQuickView] = useState<boolean>(false);

  // Embedded step timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [initialTimerSecs, setInitialTimerSecs] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isTimerFinished, setIsTimerFinished] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  // Swipe support
  const touchStartX = useRef<number | null>(null);

  // Extract timer minutes from step text
  const extractMinutes = (text: string): number => {
    const match = text.match(/(\d+)\s*(phút|p|min|m)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > 0 && parsed <= 300) return parsed;
    }
    return 5;
  };

  const currentStep = steps[currentStepIdx] || null;

  // Initialize step timer when step changes
  useEffect(() => {
    if (currentStep) {
      const mins = extractMinutes(`${currentStep.title} ${currentStep.description}`);
      const secs = mins * 60;
      setTimerSeconds(secs);
      setInitialTimerSecs(secs);
      setIsTimerRunning(false);
      setIsTimerFinished(false);
      stopAlarmSound();
    }
  }, [currentStepIdx, isOpen]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setIsTimerFinished(true);
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
  }, [isTimerRunning, timerSeconds]);

  // Sound generator
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
          osc.frequency.setValueAtTime(880, ctx.currentTime);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0 && currentStepIdx < steps.length - 1) {
        // Swipe left -> next
        setCurrentStepIdx((prev) => prev + 1);
      } else if (diffX < 0 && currentStepIdx > 0) {
        // Swipe right -> prev
        setCurrentStepIdx((prev) => prev - 1);
      }
    }
    touchStartX.current = null;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || steps.length === 0) return null;

  const totalSteps = steps.length;
  const progressPercent = Math.round(((currentStepIdx + 1) / totalSteps) * 100);
  const isLastStep = currentStepIdx === totalSteps - 1;
  const isFirstStep = currentStepIdx === 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden animate-fade-in select-none">
      {/* Top Bar Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white line-clamp-1">{recipe.title}</h2>
            <div className="flex items-center gap-2 text-xs text-pink-300 font-semibold">
              <span>Bước {currentStepIdx + 1} / {totalSteps}</span>
              <span>•</span>
              <span>Chế độ nấu ăn</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Ingredients Toggle */}
          <button
            onClick={() => setShowIngredientsQuickView(!showIngredientsQuickView)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showIngredientsQuickView
                ? 'bg-pink-500 text-white border-pink-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nguyên liệu</span>
          </button>

          {/* Close Cooking Mode */}
          <button
            onClick={() => {
              stopAlarmSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="Thoát chế độ nấu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Container - Touchable Swipe Area */}
      <div
        className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col justify-between max-w-2xl mx-auto w-full relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Ingredients Overlay Drawer */}
        {showIngredientsQuickView && (
          <div className="absolute inset-x-4 top-4 z-20 bg-slate-900 border border-pink-500/30 rounded-2xl p-4 shadow-2xl animate-fade-in max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-pink-300 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Danh sách nguyên liệu
              </h3>
              <button
                onClick={() => setShowIngredientsQuickView(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-slate-800/60 rounded-xl"
                >
                  <span className="text-slate-200 font-medium">{ing.ingredientName}</span>
                  <span className="text-pink-300 font-bold">
                    {ing.amount} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alarm Alert Ringing Banner */}
        {isTimerFinished && (
          <div className="p-4 bg-rose-900/90 border border-rose-500 rounded-2xl mb-4 flex items-center gap-3 animate-bounce">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white">ĐÃ HẾT GIỜ HẸN BƯỚC NÀY!</h4>
              <p className="text-xs text-rose-200">Kiểm tra ngay món ăn trên bếp nhé.</p>
            </div>
            <button
              onClick={() => {
                setIsTimerFinished(false);
                stopAlarmSound();
              }}
              className="px-3.5 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 shadow-md"
            >
              Tắt chuông
            </button>
          </div>
        )}

        {/* Step Header & Title */}
        {currentStep && (
          <div className="space-y-4 my-auto">
            {/* Step Number Tag */}
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-black text-xs uppercase tracking-wider">
                BƯỚC {currentStep.stepNumber}
              </span>

              {/* Completion Toggle */}
              <button
                onClick={() => onToggleStepDone(currentStep.stepNumber)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currentStep.isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {currentStep.isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã xong</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Đánh dấu xong</span>
                  </>
                )}
              </button>
            </div>

            {/* Step Title in Large Display Font */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-snug">
              {currentStep.title}
            </h1>

            {/* Step Description Extra Large Text */}
            <div className="p-5 sm:p-6 bg-slate-900/80 rounded-3xl border border-slate-800 text-slate-100 text-lg sm:text-xl font-medium leading-relaxed shadow-inner">
              {currentStep.description}
            </div>

            {/* Floating Step Integrated Timer Widget */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300 flex items-center justify-center">
                  <Timer className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                    Bộ hẹn giờ cho bước này
                  </span>
                  <span
                    className={`text-xl font-black font-mono tracking-tight ${
                      isTimerFinished
                        ? 'text-rose-400 animate-pulse'
                        : isTimerRunning
                        ? 'text-pink-300'
                        : 'text-white'
                    }`}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setIsTimerFinished(false);
                    setTimerSeconds(initialTimerSecs);
                    stopAlarmSound();
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold transition-colors"
                  title="Đặt lại"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (isTimerFinished) {
                      setIsTimerFinished(false);
                      stopAlarmSound();
                      setTimerSeconds(initialTimerSecs);
                    }
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-[#FF8FB8] text-white hover:bg-pink-600'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{timerSeconds === 0 ? 'Bắt đầu lại' : 'Chạy hẹn giờ'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion Congratulation Overlay if on last step and done */}
        {isLastStep && currentStep?.isDone && (
          <div className="mt-4 p-4 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-300">Chúc mừng bạn đã hoàn thành món ăn!</h4>
              <p className="text-xs text-slate-300">Tất cả các bước chế biến đã được hoàn thành xuất sắc.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Step Navigation Bar */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex items-center justify-between gap-3 z-10">
        <button
          onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
          disabled={isFirstStep}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Bước trước</span>
        </button>

        {/* Step Dots Indicators */}
        <div className="hidden sm:flex items-center gap-1.5 px-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentStepIdx
                  ? 'bg-pink-500 w-6'
                  : s.isDone
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (isLastStep) {
              stopAlarmSound();
              onClose();
            } else {
              setCurrentStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
            }
          }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg ${
            isLastStep
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110'
              : 'bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:brightness-110'
          }`}
        >
          <span>{isLastStep ? 'HOÀN THÀNH (THOÁT)' : 'Bước tiếp theo'}</span>
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
