export type CurrencyCode = "USD" | "EUR" | "COP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", label: "USD ($) — Dólares" },
  { code: "EUR", symbol: "€", label: "EUR (€) — Euros" },
  { code: "COP", symbol: "$", label: "COP ($) — Pesos Colombianos" },
];

/**
 * Formatea un rango numérico y moneda a una cadena legible.
 * Ejemplos:
 * - USD: min=180000, max=220000 -> "$180k - $220k USD"
 * - COP: min=5000000, max=8000000 -> "$5M - $8M COP"
 * - EUR: min=60000, max=75000 -> "€60k - €75k EUR"
 */
export function formatSalaryRange(
  min: number,
  max: number,
  currency: CurrencyCode = "USD"
): string {
  const currencyInfo =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) ||
    SUPPORTED_CURRENCIES[0];

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      const millions = parseFloat((num / 1_000_000).toFixed(2));
      return `${currencyInfo.symbol}${millions}M`;
    }
    if (num >= 1_000) {
      const thousands = parseFloat((num / 1_000).toFixed(2));
      return `${currencyInfo.symbol}${thousands}k`;
    }
    return `${currencyInfo.symbol}${num.toLocaleString("en-US")}`;
  };

  // Si min y max son idénticos, no repetir el número
  if (min === max) {
    return `${formatNumber(min)} ${currency}`;
  }

  return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
}

/**
 * Parsea una cadena de salario previa (si existe) para reconstruir
 * los valores iniciales del formulario (moneda, min, max).
 */
export function parseSalaryRange(
  salaryStr?: string
): { min: string; max: string; currency: CurrencyCode } | null {
  if (!salaryStr) return null;

  // Detectar moneda
  let currency: CurrencyCode = "USD";
  if (salaryStr.includes("EUR") || salaryStr.includes("€")) currency = "EUR";
  else if (salaryStr.includes("COP")) currency = "COP";
  else if (salaryStr.includes("USD") || salaryStr.includes("$")) currency = "USD";

  const parsePart = (part: string): string => {
    const cleaned = part
      .replace(/,/g, "")
      .replace(/[^\d.kKmM]/g, "")
      .trim()
      .toLowerCase();
    if (cleaned.endsWith("m")) {
      const val = parseFloat(cleaned.slice(0, -1));
      return isNaN(val) ? "" : Math.round(val * 1_000_000).toString();
    }
    if (cleaned.endsWith("k")) {
      const val = parseFloat(cleaned.slice(0, -1));
      return isNaN(val) ? "" : Math.round(val * 1_000).toString();
    }
    const val = parseFloat(cleaned);
    return isNaN(val) ? "" : Math.round(val).toString();
  };

  // Manejar caso rango "min - max" o valor único "min"
  const parts = salaryStr.split("-");
  if (parts.length === 2) {
    const min = parsePart(parts[0]);
    const max = parsePart(parts[1]);
    if (!min || !max) return null;
    return { min, max, currency };
  } else if (parts.length === 1) {
    const single = parsePart(parts[0]);
    if (!single) return null;
    return { min: single, max: single, currency };
  }

  return null;
}
