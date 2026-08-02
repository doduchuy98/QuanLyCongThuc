import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, X } from 'lucide-react';

interface CuteDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemType?: string; // e.g. "công thức món", "nguyên liệu", "danh mục", "đơn vị tính"
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const CuteDeleteModal: React.FC<CuteDeleteModalProps> = ({
  isOpen,
  title = "Hế lô bạn ơi! Bạn có chắc muốn xóa chứ? 🥺",
  itemName,
  itemType = "mục này",
  description,
  onConfirm,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[360px] bg-white rounded-[32px] p-6 shadow-2xl border-2 border-pink-200 text-center"
          >
            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cute floating icon header with bounce */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-100 via-rose-100 to-amber-100 border-2 border-pink-200 mx-auto flex items-center justify-center text-3xl shadow-inner mb-3 animate-bounce">
              🐱
            </div>

            <h3 className="font-black text-slate-800 text-base mb-1.5 px-2 leading-snug">
              {title}
            </h3>

            <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-4 px-1">
              {description ? (
                description
              ) : itemName ? (
                <>
                  {itemType.charAt(0).toUpperCase() + itemType.slice(1)}{' '}
                  <span className="font-black text-[#FF8FB8]">"{itemName}"</span>{' '}
                  sẽ bị xóa vĩnh viễn và không thể khôi phục lại được đâu nha! 💔
                </>
              ) : (
                `Hành động này sẽ xóa vĩnh viễn ${itemType} và không khôi phục được đâu nè! 💔`
              )}
            </p>

            <div className="bg-pink-50/70 p-2.5 rounded-2xl border border-pink-100 text-[11px] font-bold text-slate-600 mb-5 flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 flex-shrink-0" />
              <span>Nhớ suy nghĩ kỹ trước khi quyết định nha~</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vẫn xóa nha! (Tạm biệt) 🗑️</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1"
              >
                <span>🌸 Hủy nha, giữ lại nè!</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
