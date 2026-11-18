/**
 * Normaliza y valida URLs externas permitiendo únicamente protocolos http:// y https://
 * para prevenir ejecución de esquemas inseguros (ej. javascript:) en enlaces renderizados.
 */
export function getSafeHttpUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || /\s/.test(trimmed) || trimmed.startsWith("//")) {
    return null;
  }

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== "http" && scheme !== "https") {
      return null;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      return null;
    }
  }

  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (
      !parsed.hostname.includes(".") ||
      parsed.hostname.startsWith(".") ||
      parsed.hostname.endsWith(".")
    ) {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

/**
 * Construye una URL oficial de Google Maps priorizando coordenadas cacheadas
 * cuando existan, o haciendo fallback a dirección/localidad codificada.
 */
export function buildGoogleMapsUrl(params: {
  officeAddress?: string;
  location?: string;
  officeLat?: number;
  officeLng?: number;
}): string | null {
  if (
    typeof params.officeLat === "number" &&
    typeof params.officeLng === "number"
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${params.officeLat},${params.officeLng}`;
  }
  const query = (params.officeAddress || params.location || "").trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

