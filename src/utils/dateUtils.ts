const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formatea una fecha ISO o YYYY-MM-DD a "Nov 20, 2026" sin hora,
 * evitando desfases de zona horaria cuando viene solo la fecha.
 */
export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
    if (dateOnlyMatch) {
      const year = dateOnlyMatch[1];
      const monthIndex = parseInt(dateOnlyMatch[2], 10) - 1;
      const day = parseInt(dateOnlyMatch[3], 10);
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${MONTHS[monthIndex]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
