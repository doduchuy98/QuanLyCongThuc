import React, { useState } from 'react';
import { Search, Filter, Plus, ChevronRight, Carrot, Trash2 } from 'lucide-react';
import { IngredientItem } from '../types';

interface IngredientsViewProps {
  ingredients: IngredientItem[];
  onAddIngredient: () => void;
  onSelectIngredient: (ing: IngredientItem) => void;
  onDeleteIngredient: (ingId: string) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  onAddIngredient,
  onSelectIngredient,
  onDeleteIngredient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Tất cả');

  const filtered = ingredients.filter((ing) => {
    const matchesSearch = ing.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUnit =
      selectedUnitFilter === 'Tất cả' || ing.unit === selectedUnitFilter;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade-in">
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
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Thử tìm từ khóa khác hoặc tạo nguyên liệu mới nhé!
            </p>
            <button
              onClick={onAddIngredient}
              className="px-4 py-2 rounded-xl bg-[#FF8FB8] text-white font-bold text-xs shadow-sm hover:opacity-90"
            >
              + Thêm nguyên liệu
            </button>
          </div>
        ) : (
          filtered.map((ing) => (
            <div
              key={ing.id}
              onClick={() => onSelectIngredient(ing)}
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
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đơn vị: <span className="font-semibold text-slate-600">{ing.unit}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Xóa nguyên liệu "${ing.name}"?`)) {
                      onDeleteIngredient(ing.id);
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

      {/* Bottom Sticky Button */}
      <div className="pt-2">
        <button
          onClick={onAddIngredient}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-bold text-sm shadow-md shadow-pink-200 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Thêm nguyên liệu</span>
        </button>
      </div>
    </div>
  );
};
