import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapCanvasProps {
  lat: number;
  lng: number;
  company: string;
  address?: string;
  onCoordinatesChange?: (nextLat: number, nextLng: number) => void;
}

const OFFICE_PIN_ICON = L.divIcon({
  className: "office-leaflet-pin",
  html: `<div style="width:28px;height:36px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 10px rgba(129,140,248,0.55));">
    <svg viewBox="0 0 24 32" width="28" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z" fill="#818cf8" stroke="#131315" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="#131315" stroke="#e5e1e4" stroke-width="1.5"/>
    </svg>
  </div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -34],
});

function buildSafePopupElement(company: string, address?: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.fontFamily = "system-ui, sans-serif";
  wrapper.style.fontSize = "12px";
  wrapper.style.lineHeight = "1.4";
  wrapper.style.maxWidth = "220px";

  const title = document.createElement("strong");
  title.style.display = "block";
  title.style.color = "#131315";
  title.textContent = company;
  wrapper.appendChild(title);

  if (address) {
    const subtitle = document.createElement("span");
    subtitle.style.color = "#454653";
    subtitle.style.fontSize = "11px";
    subtitle.textContent = address;
    wrapper.appendChild(subtitle);
  }
  return wrapper;
}

export const LeafletMapCanvas: React.FC<LeafletMapCanvasProps> = ({
  lat,
  lng,
  company,
  address,
  onCoordinatesChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tilePaneRef = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onCoordinatesChange);
  const initialDataRef = useRef({ lat, lng, company, address });
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  onChangeRef.current = onCoordinatesChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const {
      lat: initLat,
      lng: initLng,
      company: initCompany,
      address: initAddress,
    } = initialDataRef.current;

    const map = L.map(el, {
      center: [initLat, initLng],
      zoom: 16,
      zoomControl: true,
    });

    const tileLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      },
    );
    tileLayer.addTo(map);
    tilePaneRef.current = map.getPane("tilePane") ?? null;

    const marker = L.marker([initLat, initLng], {
      icon: OFFICE_PIN_ICON,
      draggable: true,
    }).addTo(map);

    marker.bindPopup(buildSafePopupElement(initCompany, initAddress));

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChangeRef.current?.(
        Number(pos.lat.toFixed(6)),
        Number(pos.lng.toFixed(6)),
      );
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      const nextLat = Number(e.latlng.lat.toFixed(6));
      const nextLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([nextLat, nextLng]);
      onChangeRef.current?.(nextLat, nextLng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Recalcular tamaño después de la animación de apertura del modal
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 80);

    return () => {
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      tilePaneRef.current = null;
    };
  }, []);

  // Sincronizar posición y popup si cambia la búsqueda o coordenadas externas
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    markerRef.current.setPopupContent(buildSafePopupElement(company, address));
    mapRef.current.panTo([lat, lng], { animate: true });
  }, [lat, lng, company, address]);

  // Aplicar filtro visual oscuro opcional sobre las cuadrículas de OSM
  useEffect(() => {
    const pane = tilePaneRef.current;
    if (!pane) return;
    pane.style.filter = isDarkTheme
      ? "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)"
      : "none";
  }, [isDarkTheme]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest h-60 sm:h-72 z-0">
      <div
        ref={containerRef}
        data-testid="office-leaflet-map"
        data-lat={String(lat)}
        data-lng={String(lng)}
        aria-label={`Interactive office map for ${company}`}
        className="w-full h-full z-0"
      />

      <button
        type="button"
        data-testid="toggle-map-theme-btn"
        onClick={() => setIsDarkTheme((prev) => !prev)}
        className="absolute top-2.5 right-2.5 z-[500] px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 hover:bg-surface-container-high text-on-surface border border-outline-variant/50 text-[11px] font-semibold shadow-md backdrop-blur-xs transition-all cursor-pointer inline-flex items-center gap-1"
        title="Switch map theme"
      >
        <span
          className="material-symbols-outlined text-[14px]"
          aria-hidden="true"
        >
          {isDarkTheme ? "light_mode" : "dark_mode"}
        </span>
        <span>{isDarkTheme ? "Light Map" : "Dark Map"}</span>
      </button>
    </div>
  );
};

export default LeafletMapCanvas;
