import React, { useState } from 'react';
import { X, Scale, ArrowRightLeft, Info } from 'lucide-react';
import { CONVERSION_RULES } from '../data/mockData';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [amount, setAmount] = useState<number>(1);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentRule = CONVERSION_RULES[selectedRuleIndex];
  const convertedValue = (amount * currentRule.factor).toLocaleString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D9F7BE] text-emerald-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Công cụ quy đổi đơn vị</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rule selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Chọn công thức quy đổi:
          </label>
          <select
            value={selectedRuleIndex}
            onChange={(e) => setSelectedRuleIndex(Number(e.target.value))}
            className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
          >
            {CONVERSION_RULES.map((rule, idx) => (
              <option key={idx} value={idx}>
                {rule.fromUnit} &rarr; {rule.toUnit}
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-gradient-to-br from-[#FFF8FB] to-[#FFD9E8]/30 rounded-2xl p-4 border border-pink-200/60 mb-5">
          <div className="grid grid-cols-11 gap-2 items-center text-center">
            {/* Input amount */}
            <div className="col-span-5 text-left">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Số lượng ({currentRule.fromUnit})
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-pink-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-[#FF8FB8]"
              />
            </div>

            {/* Equals Icon */}
            <div className="col-span-1 flex justify-center text-[#FF8FB8]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>

            {/* Result */}
            <div className="col-span-5 text-right">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Kết quả ({currentRule.toUnit})
              </label>
              <div className="bg-white border border-emerald-300 rounded-xl px-3 py-2 font-bold text-emerald-600 text-base truncate">
                {convertedValue}
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-xs font-medium text-slate-600 flex items-center justify-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentRule.note}</span>
          </div>
        </div>

        {/* Quick Reference Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Bảng tra cứu quy đổi nhanh
          </h3>
          <div className="space-y-1.5 text-xs">
            {CONVERSION_RULES.map((r, i) => (
              <div
                key={i}
                onClick={() => setSelectedRuleIndex(i)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedRuleIndex === i
                    ? 'bg-pink-100/80 border-pink-300 font-bold text-slate-900'
                    : 'bg-slate-50 border-slate-200/70 hover:bg-pink-50 text-slate-700'
                }`}
              >
                <span>
                  1 {r.fromUnit}
                </span>
                <span className="text-pink-600 font-semibold">
                  = {r.factor.toLocaleString('vi-VN')} {r.toUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
