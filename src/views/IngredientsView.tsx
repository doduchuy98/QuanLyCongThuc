import React, { useState } from 'react';
import { Search, Filter, Plus, ChevronRight, Carrot, Trash2 } from 'lucide-react';
import { IngredientItem } from '../types';
import { CuteDeleteModal } from '../components/CuteDeleteModal';

interface IngredientsViewProps {
  ingredients: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onAddIngredient: () => void;
  onSelectIngredient: (ing: IngredientItem) => void;
  onDeleteIngredient: (ingId: string) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  isAdmin,
  onOpenAdminLogin,
  onAddIngredient,
  onSelectIngredient,
  onDeleteIngredient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Tất cả');
  const [ingToDelete, setIngToDelete] = useState<IngredientItem | null>(null);

  const filtered = ingredients.filter((ing) => {
    const matchesSearch = ing.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUnit =
      selectedUnitFilter === 'Tất cả' || ing.unit === selectedUnitFilter;
    return matchesSearch && matchesUnit;
  });

  const ingredientsWithPriceCount = ingredients.filter(i => i.pricePerUnit !== undefined && i.pricePerUnit > 0).length;

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
      {/* Price Info Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white p-3.5 rounded-2xl border border-emerald-200/60 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            💵
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-emerald-950">Quản Lý Giá Vốn Nguyên Liệu</h4>
            <p className="text-[11px] text-emerald-700">Đã cập nhật giá: <span className="font-bold">{ingredientsWithPriceCount} / {ingredients.length}</span> nguyên liệu</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isAdmin) {
              onAddIngredient();
            } else if (onOpenAdminLogin) {
              onOpenAdminLogin();
            }
          }}
          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm giá mới</span>
        </button>
      </div>

      {/* Search Bar & Filter Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8FB8] focus:bg-white transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => {
            const units = ['Tất cả', 'gram', 'ml', 'quả', 'ổ'];
            const nextIdx = (units.indexOf(selectedUnitFilter) + 1) % units.length;
            setSelectedUnitFilter(units[nextIdx]);
          }}
          className={`px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
            selectedUnitFilter !== 'Tất cả'
              ? 'bg-[#FF8FB8] text-white border-[#FF8FB8]'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50'
          }`}
          title="Lọc đơn vị"
        >
          <Filter className="w-4 h-4" />
          <span>{selectedUnitFilter}</span>
        </button>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
            <Carrot className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">
              Không tìm thấy nguyên liệu phù hợp
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Thử tìm từ khóa khác nhé!
            </p>
          </div>
        ) : (
          filtered.map((ing) => (
            <div
              key={ing.id}
              onClick={() => {
                if (isAdmin) {
                  onSelectIngredient(ing);
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                }
              }}
              className="flex items-center justify-between p-3 rounded-[20px] bg-white border border-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-pink-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                  {ing.imageUrl ? (
                    <img
                      src={ing.imageUrl}
                      alt={ing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Carrot className="w-6 h-6 text-[#FF8FB8]" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#FF8FB8] transition-colors">
                    {ing.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Đơn vị: <span className="font-semibold text-slate-600">{ing.unit}</span></span>
                    {ing.pricePerUnit !== undefined && ing.pricePerUnit > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300/80 shadow-2xs">
                        💰 {new Intl.NumberFormat('vi-VN').format(ing.pricePerUnit)} đ / {ing.unit}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[10px] border border-amber-200">
                        Chưa có giá vốn
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAdmin) {
                      setIngToDelete(ing);
                    } else if (onOpenAdminLogin) {
                      onOpenAdminLogin();
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa nguyên liệu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF8FB8] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>

      <CuteDeleteModal
        isOpen={!!ingToDelete}
        itemName={ingToDelete?.name}
        itemType="nguyên liệu"
        onConfirm={() => {
          if (ingToDelete) {
            onDeleteIngredient(ingToDelete.id);
            setIngToDelete(null);
          }
        }}
        onClose={() => setIngToDelete(null)}
      />
    </div>
  );
};
