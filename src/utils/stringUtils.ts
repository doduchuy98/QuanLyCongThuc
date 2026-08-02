/**
 * Removes Vietnamese tones and diacritics for flexible fuzzy searching.
 * e.g., "Thịt ba rọi" -> "thit ba roi"
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let normalized = str.toLowerCase();

  normalized = normalized.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  normalized = normalized.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  normalized = normalized.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  normalized = normalized.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  normalized = normalized.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  normalized = normalized.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  normalized = normalized.replace(/đ/g, 'd');

  // Unicode NFD decomposition fallback
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return normalized;
}

/**
 * Checks if target string matches query regardless of Vietnamese tones, case, or accents.
 * Supports tokenized matching (e.g. typing "thit roi" matches "Thịt ba rọi").
 */
export function matchesSearch(target: string | undefined | null, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!target) return false;

  const normalizedTarget = removeVietnameseTones(target);
  const normalizedQuery = removeVietnameseTones(searchQuery.trim());

  // Split query into tokens so searching "thit roi" matches "Thịt ba rọi"
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  return tokens.every((token) => normalizedTarget.includes(token));
}
