import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, ChefHat, Sparkles, Share2, Users, RotateCcw, Pencil, ImageOff, Coins, Calculator, TrendingUp, Info, Calendar, ShoppingCart } from 'lucide-react';
import { Recipe, CookingStep, IngredientItem } from '../types';
import { shareRecipeData } from '../utils/shareUtils';
import { calculateIngredientCost, calculateRecipeTotalCost, getIngredientCostDetails, formatCurrency } from '../utils/costUtils';

interface RecipeDetailViewProps {
  recipe: Recipe;
  allIngredients?: IngredientItem[];
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onEditRecipe: (recipeId: string) => void;
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
  onBack: () => void;
  onAddRecipeToShoppingList?: (recipe: Recipe, servings: number) => void;
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  allIngredients = [],
  isAdmin,
  onOpenAdminLogin,
  onEditRecipe,
  onUpdateRecipe,
  onBack,
  onAddRecipeToShoppingList,
}) => {
  const [activeTab, setActiveTab] = useState<'thanh_phan' | 'gia_von' | 'dinh_luong' | 'quy_trinh' | 'thong_tin'>('thanh_phan');

  // Profit Margin & Extra Costs state
  const [desiredMarginPercent, setDesiredMarginPercent] = useState<number>(50); // Default 50% margin
  const [extraOverheadCost, setExtraOverheadCost] = useState<number>(0); // Packaging / energy per portion

  // Base servings calculation from portionLabel (e.g., "1 phần", "2 phần")
  const getBaseServings = (portionLabel?: string): number => {
    if (!portionLabel) return 1;
    const match = portionLabel.match(/(\d+(\.\d+)?)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (val > 0) return val;
    }
    return 1;
  };

  const baseServings = getBaseServings(recipe.portionLabel);
  const [servings, setServings] = useState<number>(baseServings);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [ingredientInputs, setIngredientInputs] = useState<{ [key: number]: string }>({});

  // Sync when recipe changes
  useEffect(() => {
    const base = getBaseServings(recipe.portionLabel);
    setServings(base);
    setPortionMultiplier(1);
    setIngredientInputs({});
  }, [recipe.id, recipe.portionLabel]);

  // When user changes servings count
  const handleServingsChange = (val: number) => {
    const validServings = Math.max(0.1, val);
    setServings(validServings);
    setPortionMultiplier(validServings / baseServings);
    setIngredientInputs({});
  };

  // When user directly changes 1 ingredient's amount in "Định lượng" tab
  const handleIngredientAmountChange = (index: number, newAmountStr: string) => {
    setIngredientInputs((prev) => ({ ...prev, [index]: newAmountStr }));

    if (newAmountStr.trim() === '') {
      return;
    }

    const baseAmount = recipe.ingredients[index]?.amount || 0;
    if (baseAmount <= 0) return;

    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) return;

    const newMultiplier = newAmount / baseAmount;
    setPortionMultiplier(newMultiplier);
    setServings(Math.round(baseServings * newMultiplier * 10) / 10);
  };

  // Reset to original 1x base recipe
  const handleResetScaling = () => {
    setPortionMultiplier(1);
    setServings(baseServings);
    setIngredientInputs({});
  };

  // Interactive state for cooking steps completion
  const [stepsState, setStepsState] = useState<CookingStep[]>(recipe.steps || []);

  // Share feedback toast
  const [shareFeedbackMsg, setShareFeedbackMsg] = useState<string | null>(null);

  const handleShare = async () => {
    const res = await shareRecipeData(recipe);
    setShareFeedbackMsg(res.message);
    setTimeout(() => {
      setShareFeedbackMsg(null);
    }, 3000);
  };

  const toggleStepDone = (stepNum: number) => {
    const updated = stepsState.map((s) =>
      s.stepNumber === stepNum ? { ...s, isDone: !s.isDone } : s
    );
    setStepsState(updated);
    onUpdateRecipe({ ...recipe, steps: updated });
  };

  return (
    <div className="pb-28 animate-fade-in">
      {/* Top Dish Cover Photo Banner */}
      <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
        {recipe.imageUrl ? (
          <>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-pink-50/30 to-slate-200 flex flex-col items-center justify-center text-slate-400">
            <ImageOff className="w-10 h-10 mb-1 opacity-40 text-slate-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">No Image</span>
          </div>
        )}

        {/* Status Badge Top Right */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md ${
              recipe.isActive
                ? 'bg-emerald-500/90 text-white border border-emerald-300/50'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {recipe.isActive ? 'Đang hoạt động' : 'Tắt'}
          </span>
        </div>
      </div>

      {/* Recipe Title Header Block */}
      <div className="p-4 bg-white border-b border-pink-100/60 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">{recipe.title}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
            <span>{recipe.category}</span>
            <span>•</span>
            <span>Định lượng: {recipe.portionLabel || '1 phần'}</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {onAddRecipeToShoppingList && (
            <button
              onClick={() => {
                onAddRecipeToShoppingList(recipe, servings);
                setShareFeedbackMsg(`Đã thêm ${recipe.ingredients.length} nguyên liệu (${servings} khẩu phần) vào Danh sách đi chợ! 🛒`);
                setTimeout(() => setShareFeedbackMsg(null), 3500);
              }}
              className="px-3 py-2 rounded-2xl bg-gradient-to-r from-[#FF8FB8] to-[#FF6B9D] text-white font-extrabold text-xs shadow-md shadow-pink-200 hover:opacity-95 transition-all flex items-center gap-1.5"
              title="Thêm nguyên liệu món này vào danh sách đi chợ"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Thêm vào đi chợ</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isAdmin) {
                onEditRecipe(recipe.id);
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              }
            }}
            className="px-3 py-2 rounded-2xl bg-pink-50 text-[#FF8FB8] hover:bg-pink-100 font-bold text-xs transition-all flex items-center gap-1.5 border border-pink-200/60"
            title="Sửa công thức"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Sửa công thức</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-2xl bg-sky-500 text-white font-bold text-xs shadow-xs hover:bg-sky-600 transition-all flex items-center gap-1.5"
            title="Chia sẻ công thức"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Share Toast Feedback Notification Banner */}
      {shareFeedbackMsg && (
        <div className="mx-4 mt-3 p-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-between animate-fade-in z-20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span>{shareFeedbackMsg}</span>
          </div>
          <button onClick={() => setShareFeedbackMsg(null)} className="text-emerald-200 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Sub-Tabs Bar */}
      <div className="sticky top-14 z-30 bg-white border-b border-pink-100 flex items-center justify-between px-2 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('thanh_phan')}
          className={`py-3 px-2.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'thanh_phan'
              ? 'border-[#FF8FB8] text-[#FF8FB8]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Thành phần
        </button>
        <button
          onClick={() => setActiveTab('gia_von')}
          className={`py-3 px-2.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1 ${
            activeTab === 'gia_von'
              ? 'border-[#FF8FB8] text-[#FF8FB8]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Giá vốn (Cost)</span>
        </button>
        <button
          onClick={() => setActiveTab('dinh_luong')}
          className={`py-3 px-2.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'dinh_luong'
              ? 'border-[#FF8FB8] text-[#FF8FB8]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Định lượng
        </button>
        <button
          onClick={() => setActiveTab('quy_trinh')}
          className={`py-3 px-2.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'quy_trinh'
              ? 'border-[#FF8FB8] text-[#FF8FB8]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Quy trình
        </button>
        <button
          onClick={() => setActiveTab('thong_tin')}
          className={`py-3 px-2.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'thong_tin'
              ? 'border-[#FF8FB8] text-[#FF8FB8]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Thông tin
        </button>
      </div>

      {/* Tab Content 1: Thành phần (Ingredients Table) */}
      {activeTab === 'thanh_phan' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Thành phần nguyên liệu</h3>
            <span className="text-xs text-slate-400 font-medium">
              {recipe.ingredients.length} mục
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50/80 px-3 py-2 text-[11px] font-bold text-slate-500 border-b border-slate-100">
              <span className="col-span-6">Nguyên liệu</span>
              <span className="col-span-3 text-center">Định lượng</span>
              <span className="col-span-3 text-right">Đơn vị</span>
            </div>

            <div className="divide-y divide-slate-100">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 px-3 py-3 text-xs font-semibold text-slate-700 items-center hover:bg-pink-50/30 transition-colors"
                >
                  <div className="col-span-6 flex flex-col justify-center min-w-0 pr-1">
                    <span className="font-bold text-slate-800 truncate">
                      {ing.ingredientName}
                    </span>
                    {ing.note && (
                      <span className="text-[11px] text-pink-600 font-semibold truncate italic">
                        ({ing.note})
                      </span>
                    )}
                  </div>
                  <span className="col-span-3 text-center text-slate-800 font-bold">
                    {Math.round(ing.amount * portionMultiplier * 10) / 10}
                  </span>
                  <span className="col-span-3 text-right text-slate-500">
                    {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Chế độ xem chi tiết. Để sửa nguyên liệu hoặc công thức, nhấn biểu tượng chỉnh sửa ở góc trên màn hình.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Giá vốn (Cost) */}
      {activeTab === 'gia_von' && (
        <div className="p-4 space-y-4 animate-fade-in">
          {/* Top Summary Cost Header Banner */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 rounded-3xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Tổng giá vốn món ăn (Cost)</h3>
                  <p className="text-[11px] text-emerald-200">Dựa trên {recipe.ingredients.length} nguyên liệu</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold text-white">
                Khẩu phần: {servings} phần
              </span>
            </div>

            {/* Big Numbers Row */}
            {(() => {
              const rawTotalCost = recipe.ingredients.reduce((sum, ing) => {
                const scaledIng = { ...ing, amount: ing.amount * portionMultiplier };
                return sum + calculateIngredientCost(scaledIng, allIngredients);
              }, 0);

              const costPerPortion = servings > 0 ? Math.round(rawTotalCost / servings) : 0;
              const totalCostWithOverhead = costPerPortion + extraOverheadCost;
              const marginFactor = 1 - (desiredMarginPercent / 100);
              const rawSellingPrice = marginFactor > 0 ? Math.round(totalCostWithOverhead / marginFactor) : 0;
              // Round selling price to nearest 1,000 VND for menu pricing
              const suggestedPrice = Math.ceil(rawSellingPrice / 1000) * 1000;
              const profitPerPortion = suggestedPrice - totalCostWithOverhead;

              return (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                      <span className="text-[10px] text-emerald-100 font-bold block">Tổng chi phí công thức</span>
                      <span className="text-xl font-black text-white">{formatCurrency(rawTotalCost)}</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                      <span className="text-[10px] text-emerald-100 font-bold block">Giá vốn 1 phần ăn</span>
                      <span className="text-xl font-black text-amber-300">{formatCurrency(totalCostWithOverhead)}</span>
                    </div>
                  </div>

                  {/* PROFIT MARGIN & SELLING PRICE CALCULATOR */}
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-amber-300" />
                        <span className="text-xs font-bold text-white">Tính giá bán & Lợi nhuận</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-amber-300">
                        Margin: {desiredMarginPercent}%
                      </span>
                    </div>

                    {/* Quick Margin Preset Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] font-bold text-emerald-100 flex-shrink-0">Tỷ lệ lãi:</span>
                      {[30, 40, 50, 60, 70].map((m) => (
                        <button
                          key={m}
                          onClick={() => setDesiredMarginPercent(m)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                            desiredMarginPercent === m
                              ? 'bg-amber-400 text-slate-900 shadow-xs'
                              : 'bg-white/15 text-white hover:bg-white/25'
                          }`}
                        >
                          {m}%
                        </button>
                      ))}
                    </div>

                    {/* Overhead / Packaging input */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15 text-xs">
                      <span className="text-[11px] text-emerald-100">Chi phí khác (Hộp, điện, nước / phần):</span>
                      <div className="relative w-28">
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={extraOverheadCost === 0 ? '' : extraOverheadCost}
                          onChange={(e) => setExtraOverheadCost(e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder="0 đ"
                          className="w-full bg-white/20 border border-white/30 rounded-xl px-2 py-1 text-right text-xs font-bold text-white focus:outline-none focus:bg-white/30 placeholder-white/50"
                        />
                      </div>
                    </div>

                    {/* Suggested Price & Gross Profit Output */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-slate-900">
                      <div className="bg-white p-2.5 rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold text-slate-500 block">Giá bán đề xuất / phần</span>
                        <span className="text-sm font-black text-emerald-700">{formatCurrency(suggestedPrice)}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl shadow-xs">
                        <span className="text-[10px] font-bold text-slate-500 block">Lợi nhuận gộp / phần</span>
                        <span className="text-sm font-black text-[#FF6B9D]">{formatCurrency(profitPerPortion)}</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Ingredient Price Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Bảng chi tiết giá vốn nguyên liệu</span>
                <span className="text-[10px] font-medium text-slate-400">(Có thể sửa trực tiếp đơn giá)</span>
              </h4>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-50/80 px-3 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-100">
                <span className="col-span-4">Nguyên liệu</span>
                <span className="col-span-2 text-center">Lượng</span>
                <span className="col-span-3 text-center">Đơn giá gốc</span>
                <span className="col-span-3 text-right">Thành tiền</span>
              </div>

              <div className="divide-y divide-slate-100">
                {recipe.ingredients.map((ing, idx) => {
                  const currentAmount = Math.round(ing.amount * portionMultiplier * 10) / 10;
                  const scaledIng = { ...ing, amount: currentAmount };
                  const costDetails = getIngredientCostDetails(scaledIng, allIngredients);

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-12 px-3 py-2.5 text-xs font-semibold text-slate-700 items-center hover:bg-pink-50/20 transition-colors"
                    >
                      <div className="col-span-4 min-w-0 pr-1">
                        <span className="font-bold text-slate-800 block truncate" title={ing.ingredientName}>
                          {ing.ingredientName}
                          {ing.note && <span className="text-[10.5px] text-pink-600 font-semibold italic ml-1">({ing.note})</span>}
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-normal">{ing.unit}</span>
                          {costDetails.isConverted && (
                            <span className="text-[9.5px] font-extrabold text-sky-700 bg-sky-50 px-1 rounded border border-sky-200">
                              ⚡ {costDetails.convertedAmount} {costDetails.masterUnit}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="col-span-2 text-center text-slate-700 font-bold">
                        {currentAmount}
                      </span>

                      {/* Editable Unit Price Field */}
                      <div className="col-span-3 px-1">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={costDetails.masterPrice === 0 ? '' : costDetails.masterPrice}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            const updatedIngs = recipe.ingredients.map((item, i) =>
                              i === idx ? { ...item, pricePerUnit: val } : item
                            );
                            onUpdateRecipe({ ...recipe, ingredients: updatedIngs });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF8FB8] focus:bg-white text-slate-800 text-center rounded-lg py-1 px-1 text-xs font-bold outline-none"
                          title={`Đơn giá gốc (${costDetails.masterUnit})`}
                        />
                      </div>

                      <span className="col-span-3 text-right font-black text-emerald-600">
                        {costDetails.cost > 0 ? formatCurrency(costDetails.cost) : <span className="text-slate-300 font-normal">Chưa có giá</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Định lượng (Portion Calculator) */}
      {activeTab === 'dinh_luong' && (
        <div className="p-4 space-y-4">
          {/* Servings Input Section */}
          <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-4 rounded-3xl border border-pink-100 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF8FB8] text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Số khẩu phần ăn (Servings)</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Điền số người ăn để tự động tính tỷ lệ nguyên liệu</p>
                </div>
              </div>

              {portionMultiplier !== 1 && (
                <button
                  onClick={handleResetScaling}
                  className="px-2.5 py-1 rounded-full bg-white text-slate-600 border border-slate-200 text-[11px] font-bold hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs"
                  title="Khôi phục về tỷ lệ chuẩn gốc 1x"
                >
                  <RotateCcw className="w-3 h-3 text-[#FF8FB8]" />
                  <span>Gốc (1x)</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center bg-white rounded-2xl border border-pink-200 p-1 shadow-2xs">
                <button
                  onClick={() => handleServingsChange(Math.max(1, Math.round(servings) - 1))}
                  className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#FF8FB8] font-black text-base flex items-center justify-center transition-colors"
                  title="Giảm khẩu phần"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={servings === 0 ? '' : servings}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setServings(0);
                      setIngredientInputs({});
                      return;
                    }
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleServingsChange(val);
                  }}
                  className="w-16 text-center font-black text-slate-800 text-base focus:outline-none"
                />
                <button
                  onClick={() => handleServingsChange(Math.round(servings) + 1)}
                  className="w-8 h-8 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#FF8FB8] font-black text-base flex items-center justify-center transition-colors"
                  title="Tăng khẩu phần"
                >
                  +
                </button>
              </div>

              <div className="text-xs font-bold text-slate-700">
                <span>khẩu phần</span>
                <div className="text-[11px] text-[#FF8FB8] font-semibold">
                  Tỷ lệ nhân: x{Math.round(portionMultiplier * 100) / 100}
                </div>
              </div>
            </div>
          </div>

          {/* Proportional Scaling Tip Banner */}
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs font-medium text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="font-bold">Tính tỷ lệ thông minh:</strong> Thay đổi số khẩu phần trên HOẶC điền trực tiếp định lượng của 1 nguyên liệu bên dưới, tất cả các nguyên liệu khác sẽ tự động thay đổi theo đúng tỷ lệ!
            </p>
          </div>

          {/* Scaled Ingredients Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 border-b border-slate-100">
              <span className="col-span-6">Nguyên liệu</span>
              <span className="col-span-3 text-center">Định lượng (Nhập đổi)</span>
              <span className="col-span-3 text-right">Đơn vị</span>
            </div>

            <div className="divide-y divide-slate-100">
              {recipe.ingredients.map((ing, idx) => {
                const calculatedAmount = Math.round(ing.amount * portionMultiplier * 10) / 10;
                const displayVal = ingredientInputs[idx] !== undefined ? ingredientInputs[idx] : calculatedAmount;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 px-3 py-2 text-xs font-semibold text-slate-700 items-center hover:bg-pink-50/30 transition-colors"
                  >
                    <div className="col-span-6 flex flex-col justify-center min-w-0 pr-1">
                      <span className="font-bold text-slate-800 truncate">
                        {ing.ingredientName}
                      </span>
                      {ing.note && (
                        <span className="text-[10.5px] text-pink-600 font-semibold truncate italic">
                          ({ing.note})
                        </span>
                      )}
                    </div>

                    <div className="col-span-3 px-1">
                      <input
                        type="number"
                        step="any"
                        value={displayVal}
                        onChange={(e) => handleIngredientAmountChange(idx, e.target.value)}
                        className="w-full text-center bg-pink-50/80 border border-pink-200 focus:border-[#FF8FB8] focus:bg-white text-pink-600 font-black rounded-xl py-1 px-1 text-xs focus:ring-2 focus:ring-[#FF8FB8]/40 outline-none transition-all shadow-2xs"
                        title="Thay đổi định lượng nguyên liệu này để tự động đổi toàn bộ nguyên liệu khác"
                      />
                    </div>

                    <span className="col-span-3 text-right text-slate-500 text-[11px] font-medium truncate">
                      {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Quy trình chế biến */}
      {activeTab === 'quy_trinh' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Các bước chế biến ({stepsState.length})
            </h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Chạm để đánh dấu hoàn thành
            </span>
          </div>

          <div className="space-y-3">
            {stepsState.map((step) => (
              <div
                key={step.stepNumber}
                className={`p-4 rounded-2xl border transition-all relative ${
                  step.isDone
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-pink-100 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex-shrink-0 cursor-pointer"
                    onClick={() => toggleStepDone(step.stepNumber)}
                  >
                    {step.isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-bold text-xs flex items-center justify-center">
                        {step.stepNumber}
                      </div>
                    )}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleStepDone(step.stepNumber)}
                  >
                    <h4
                      className={`font-bold text-sm text-slate-800 ${
                        step.isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        step.isDone ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Thông tin chi tiết */}
      {activeTab === 'thong_tin' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-2xs">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mô tả công thức
              </span>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {recipe.description || 'Chưa có mô tả chi tiết cho công thức này.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Chuẩn bị</span>
                  <span className="text-xs font-bold text-slate-700">
                    {recipe.prepTimeMinutes || 20} phút
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-pink-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Nấu</span>
                  <span className="text-xs font-bold text-slate-700">
                    {recipe.cookTimeMinutes || 30} phút
                  </span>
                </div>
              </div>
            </div>

            {recipe.updatedAt && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Thời gian cập nhật</span>
                  <span className="text-xs font-bold text-slate-700">{recipe.updatedAt}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

