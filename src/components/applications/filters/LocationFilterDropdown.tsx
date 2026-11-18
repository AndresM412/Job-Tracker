import { useState, useRef, useEffect, useMemo } from "react";
import { type JobApplication, type WorkMode } from "../../../types/job";

export type WorkModeFilterValue = "All" | WorkMode;

type LocationFilterDropdownProps = {
  workModeFilter: WorkModeFilterValue;
  locationFilter: string;
  onWorkModeChange: (mode: WorkModeFilterValue) => void;
  onLocationChange: (location: string) => void;
  jobs?: JobApplication[];
};

const WORK_MODE_FILTERS: Array<{ value: WorkModeFilterValue; label: string }> = [
  { value: "All", label: "All" },
  { value: "Remote", label: "Remote" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "On-site", label: "On-site" },
];

export default function LocationFilterDropdown({
  workModeFilter,
  locationFilter,
  onWorkModeChange,
  onLocationChange,
  jobs = [],
}: LocationFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const uniqueLocations = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((job) => {
      const loc = job.location?.trim();
      if (loc) {
        map.set(loc, (map.get(loc) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [jobs]);

  const hasActiveFilter =
    workModeFilter !== "All" || locationFilter.trim() !== "";

  const getButtonText = () => {
    const parts: string[] = [];
    if (locationFilter.trim()) {
      parts.push(locationFilter.trim());
    }
    if (workModeFilter !== "All") {
      parts.push(workModeFilter);
    }
    return parts.length > 0 ? parts.join(" • ") : "Location";
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        data-testid="location-filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer max-w-[190px] ${
          hasActiveFilter
            ? "bg-surface-container-high border-outline-variant text-on-surface"
            : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[15px] shrink-0 ${
            hasActiveFilter ? "text-primary-container" : "text-outline"
          }`}
          aria-hidden="true"
        >
          location_on
        </span>
        <span className="truncate">{getButtonText()}</span>
        <span className="material-symbols-outlined text-[16px] text-outline pointer-events-none shrink-0">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Filter by Location and Work Mode"
          data-testid="location-filter-popover"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-2xl p-3.5 z-40 focus:outline-none backdrop-blur-md space-y-3.5"
        >
          {/* Section 1: Work Type */}
          <div>
            <div className="text-[10px] font-semibold text-outline uppercase tracking-wider mb-2">
              Work Type
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {WORK_MODE_FILTERS.map(({ value, label }) => {
                const isSelected = workModeFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    data-testid={`work-mode-filter-${value.toLowerCase()}`}
                    aria-pressed={isSelected}
                    onClick={() => onWorkModeChange(value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-primary-container/20 border-primary-container text-primary font-semibold"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Location Search & Quick Chips */}
          <div className="border-t border-outline-variant/20 pt-3">
            <label
              htmlFor="location-filter-input"
              className="block text-[10px] font-semibold text-outline uppercase tracking-wider mb-2"
            >
              Location / Country
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[15px] pointer-events-none"
                aria-hidden="true"
              >
                search
              </span>
              <input
                id="location-filter-input"
                data-testid="location-filter-input"
                type="text"
                value={locationFilter}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Canada, Bogotá..."
                className="w-full bg-surface-container-lowest text-on-surface text-xs pl-8 pr-7 py-1.5 rounded-lg border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline/60"
              />
              {locationFilter && (
                <button
                  type="button"
                  onClick={() => onLocationChange("")}
                  aria-label="Clear location filter"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              )}
            </div>

            {uniqueLocations.length > 0 && (
              <div className="mt-2 max-h-28 overflow-y-auto space-y-1 pr-0.5">
                {uniqueLocations.map(([loc, count]) => {
                  const isActive =
                    locationFilter.trim().toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => onLocationChange(isActive ? "" : loc)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer text-left ${
                        isActive
                          ? "bg-primary-container/20 text-primary font-semibold"
                          : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                      }`}
                    >
                      <span className="truncate">{loc}</span>
                      <span className="text-[10px] font-mono text-outline ml-2 shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear Footer */}
          {hasActiveFilter && (
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                data-testid="clear-location-filters-btn"
                onClick={() => {
                  onWorkModeChange("All");
                  onLocationChange("");
                }}
                className="text-[11px] font-semibold text-error hover:underline cursor-pointer"
              >
                Reset filters
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-primary-container hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

