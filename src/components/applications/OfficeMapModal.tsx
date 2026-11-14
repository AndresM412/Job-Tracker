import React, { useState, useEffect } from "react";
import { buildGoogleMapsUrl } from "../../utils/urlUtils";
import LeafletMapCanvas from "./LeafletMapCanvas";

interface OfficeMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: string;
  location?: string;
  officeAddress?: string;
  officeLat?: number;
  officeLng?: number;
  onSaveOffice: (office: {
    officeAddress: string | null;
    officeLat: number | null;
    officeLng: number | null;
  }) => Promise<void>;
}

interface NominatimResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

export const OfficeMapModal: React.FC<OfficeMapModalProps> = ({
  isOpen,
  onClose,
  company,
  location,
  officeAddress,
  officeLat,
  officeLng,
  onSaveOffice,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [noResultsQuery, setNoResultsQuery] = useState<string | null>(null);

  const [draftAddress, setDraftAddress] = useState<string | undefined>(officeAddress);
  const [draftLat, setDraftLat] = useState<number | undefined>(officeLat);
  const [draftLng, setDraftLng] = useState<number | undefined>(officeLng);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialSearch =
        officeAddress || [company, location].filter(Boolean).join(" ").trim();
      setSearchQuery(initialSearch);
      setDraftAddress(officeAddress);
      setDraftLat(officeLat);
      setDraftLng(officeLng);
      setResults([]);
      setSearchError(null);
      setNoResultsQuery(null);
      setIsSearching(false);
      setIsSaving(false);
    }
  }, [isOpen, company, location, officeAddress, officeLat, officeLng]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchError("Enter an address, office, or city to search.");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setNoResultsQuery(null);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
        trimmed
      )}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Search service temporarily unavailable.");
      }
      const data: NominatimResult[] = await response.json();
      const validResults = Array.isArray(data) ? data : [];
      setResults(validResults);
      if (validResults.length === 0) {
        setNoResultsQuery(trimmed);
      }
    } catch {
      setSearchError(
        "Unable to reach OpenStreetMap search. Check your connection or try Google Maps directly."
      );
      setResults([]);
      setNoResultsQuery(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: NominatimResult) => {
    const lat = Number.parseFloat(item.lat);
    const lng = Number.parseFloat(item.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    setDraftAddress(item.display_name.slice(0, 255));
    setDraftLat(lat);
    setDraftLng(lng);
    setResults([]);
    setSearchError(null);
    setNoResultsQuery(null);
  };

  const handleSave = async () => {
    if (typeof draftLat !== "number" || typeof draftLng !== "number") return;
    try {
      setIsSaving(true);
      await onSaveOffice({
        officeAddress: (draftAddress || searchQuery.trim()).slice(0, 255),
        officeLat: draftLat,
        officeLng: draftLng,
      });
      onClose();
    } catch {
      setSearchError("Failed to save office coordinates. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearPin = async () => {
    try {
      setIsSaving(true);
      await onSaveOffice({
        officeAddress: null,
        officeLat: null,
        officeLng: null,
      });
      setDraftAddress(undefined);
      setDraftLat(undefined);
      setDraftLng(undefined);
      onClose();
    } catch {
      setSearchError("Failed to clear saved office pin.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasPinnedCoords =
    typeof draftLat === "number" && typeof draftLng === "number";
  const hasUnsavedChanges =
    hasPinnedCoords &&
    (draftLat !== officeLat ||
      draftLng !== officeLng ||
      draftAddress !== officeAddress);
  const googleMapsUrl = buildGoogleMapsUrl({
    officeAddress: draftAddress || searchQuery.trim() || undefined,
    location,
    officeLat: draftLat,
    officeLng: draftLng,
  });

  return (
    <div
      data-testid="office-map-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="office-map-modal-title"
        data-testid="office-map-modal"
        className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/40 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/60 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-outline-variant/20 mb-4 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-primary-container text-[18px]"
                aria-hidden="true"
              >
                location_on
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary-container font-semibold">
                Office Location
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-semibold">
                {hasPinnedCoords ? "Pinned" : "Lookup"}
              </span>
            </div>
            <h2
              id="office-map-modal-title"
              className="text-base sm:text-lg font-bold text-on-surface tracking-tight truncate"
            >
              {company}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain transform-gpu space-y-3.5 pr-1">
          {/* Buscador Nominatim */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                data-testid="office-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search building, street, or city (e.g. One Plaza Medellin)..."
                className="w-full bg-surface-container-lowest text-on-surface text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/70"
              />
            </div>
            <button
              type="submit"
              data-testid="office-search-submit-btn"
              disabled={isSearching}
              className="cursor-pointer h-9 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-semibold active:scale-95 transition-all duration-150 disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {isSearching ? "progress_activity" : "travel_explore"}
              </span>
              <span>{isSearching ? "Searching..." : "Search Map"}</span>
            </button>
          </form>

          {searchError && (
            <div
              role="alert"
              className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[15px]">error</span>
              <span>{searchError}</span>
            </div>
          )}

          {/* Asistencia amigable cuando Nominatim no encuentra la empresa por nombre comercial */}
          {noResultsQuery && (
            <div
              data-testid="no-results-assist-card"
              className="p-3.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-xs space-y-2.5 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  travel_explore
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface">
                    No matching locations found for "{noResultsQuery}" on OpenStreetMap
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                    OpenStreetMap indexes street addresses and building names (e.g. <em>One Plaza Medellín</em> or <em>Carrera 43A</em>). Commercial business names are often unlisted.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    noResultsQuery + (location ? ` ${location}` : "")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="fallback-google-maps-btn"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-primary-container text-xs font-semibold transition-all shadow-xs shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    open_in_new
                  </span>
                  <span>Search "{noResultsQuery}" on Google Maps</span>
                </a>
                <span className="text-[10px] text-outline">
                  Tip: Copy the street or building name from Google Maps and search it here.
                </span>
              </div>
            </div>
          )}

          {/* Resultados de Nominatim */}
          {results.length > 0 && (
            <div
              data-testid="office-search-results"
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest divide-y divide-outline-variant/15 max-h-40 overflow-y-auto"
            >
              {results.map((item, idx) => (
                <button
                  key={`${item.place_id}-${idx}`}
                  type="button"
                  data-testid={`office-search-result-${idx}`}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-colors cursor-pointer flex items-start gap-2"
                >
                  <span
                    className="material-symbols-outlined text-[15px] text-primary-container shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    pin_drop
                  </span>
                  <span className="leading-snug">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Visor interactivo Leaflet + OpenStreetMap o estado inicial */}
          {hasPinnedCoords ? (
            <div className="space-y-2">
              <LeafletMapCanvas
                lat={draftLat}
                lng={draftLng}
                company={company}
                address={draftAddress}
                onCoordinatesChange={(nextLat, nextLng) => {
                  setDraftLat(nextLat);
                  setDraftLng(nextLng);
                }}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-on-surface-variant bg-surface-container-lowest/70 px-3 py-2 rounded-lg border border-outline-variant/20">
                <span className="truncate font-medium" title={draftAddress}>
                  {draftAddress || "Selected coordinates"}
                </span>
                <span className="font-mono text-[10px] text-outline shrink-0">
                  {draftLat.toFixed(4)}, {draftLng.toFixed(4)}
                </span>
              </div>
              <p className="text-[10px] text-outline">
                Tip: Drag the pin or click anywhere on the map to adjust the exact building entrance.
              </p>
            </div>
          ) : (
            <div
              data-testid="office-map-empty-state"
              className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-lowest/50 p-6 text-center space-y-1.5"
            >
              <span
                className="material-symbols-outlined text-[26px] text-outline/70"
                aria-hidden="true"
              >
                map
              </span>
              <p className="text-xs font-semibold text-on-surface">
                Search for an office or facility address
              </p>
              <p className="text-[11px] text-outline max-w-md mx-auto">
                Search by building name, street address, or city (e.g. <em>One Plaza Medellin</em>). Or click directly on the map to drop a pin.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-outline-variant/20 mt-4 shrink-0">
          <div>
            {officeAddress && (
              <button
                type="button"
                data-testid="clear-office-btn"
                onClick={handleClearPin}
                disabled={isSaving}
                className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:border-error/50 hover:bg-error-container/20 hover:text-error text-on-surface-variant text-xs font-semibold active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  location_off
                </span>
                <span>Clear Pin</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="open-google-maps-link"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-semibold active:scale-95 transition-all duration-150"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  open_in_new
                </span>
                <span>Open in Google Maps</span>
              </a>
            )}

            <button
              type="button"
              data-testid="save-office-btn"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                save
              </span>
              <span>{isSaving ? "Saving..." : "Save Pin"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeMapModal;

