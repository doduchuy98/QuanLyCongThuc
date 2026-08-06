/**
 * Parses Vietnamese date time strings like "06/08/2026 01:53" or "04/08/2026 10:20" or "06/08/2026" or ISO strings.
 * Returns timestamp number in milliseconds for accurate sorting.
 */
export function parseRecipeDate(dateStr?: string): number {
  if (!dateStr) return 0;
  const str = dateStr.trim();
  if (!str) return 0;

  const parts = str.split(' ');
  const datePart = parts[0]; // e.g. "06/08/2026"
  const timePart = parts[1] || '00:00'; // e.g. "01:53"

  const dParts = datePart.split('/');
  if (dParts.length === 3) {
    const [day, month, year] = dParts.map((n) => parseInt(n, 10));
    const [hour, minute] = timePart.split(':').map((n) => parseInt(n, 10));
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const d = new Date(year, month - 1, day, isNaN(hour) ? 0 : hour, isNaN(minute) ? 0 : minute);
      return d.getTime();
    }
  }

  // Fallback to standard Date parsing
  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? 0 : parsed;
}
