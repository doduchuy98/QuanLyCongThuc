import { Recipe } from '../types';

export function formatRecipeShareText(recipe: Recipe): string {
  let text = `🍳 CÔNG THỨC: ${recipe.title.toUpperCase()}\n`;
  if (recipe.description) {
    text += `📝 ${recipe.description}\n`;
  }
  text += `📁 Danh mục: ${recipe.category}\n`;
  text += `👥 Định lượng: ${recipe.portionLabel || '1 phần'}\n\n`;

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    text += `🛒 NGUYÊN LIỆU:\n`;
    recipe.ingredients.forEach((ing) => {
      text += `• ${ing.ingredientName}: ${ing.amount} ${ing.unit}\n`;
    });
    text += `\n`;
  }

  if (recipe.steps && recipe.steps.length > 0) {
    text += `👩‍🍳 CÁC BƯỚC THỰC HIỆN:\n`;
    recipe.steps.forEach((st) => {
      text += `Bước ${st.stepNumber}. ${st.title}\n   ${st.description}\n`;
    });
    text += `\n`;
  }

  text += `✨ Món ăn ngon từ Ứng dụng Quản lý Công thức`;
  return text;
}

export async function shareRecipeData(recipe: Recipe): Promise<{ shared: boolean; copied: boolean; message: string }> {
  const text = formatRecipeShareText(recipe);
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Công thức: ${recipe.title}`,
        text: text,
        url: url,
      });
      return { shared: true, copied: false, message: 'Đã gửi chia sẻ thành công!' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, copied: false, message: 'Đã hủy chia sẻ' };
      }
    }
  }

  // Fallback copy to clipboard
  try {
    const fullContent = `${text}\n\n🔗 Liên kết: ${url}`;
    await navigator.clipboard.writeText(fullContent);
    return { shared: false, copied: true, message: 'Đã sao chép công thức vào khay nhớ tạm!' };
  } catch (err) {
    return { shared: false, copied: false, message: 'Không thể sao chép công thức' };
  }
}
