import { useState, useRef, useEffect } from "react";
import { type JobApplication, type JobStatus } from "../../types/job";

export type FilterValue = "All" | JobStatus;

type StatusDropdownProps = {
  currentFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  jobs?: JobApplication[];
};

const filterConfig: Array<{
  value: FilterValue;
  label: string;
  dotColor?: string;
  textColor?: string;
}> = [
  { value: "All", label: "All Statuses", textColor: "text-on-surface" },
  { value: "Applied", label: "Applied", dotColor: "bg-tertiary", textColor: "text-tertiary" },
  { value: "Interview", label: "Interview", dotColor: "bg-primary-container", textColor: "text-primary-container" },
  { value: "Offer", label: "Offer", dotColor: "bg-secondary", textColor: "text-secondary" },
  { value: "Rejected", label: "Rejected", dotColor: "bg-error", textColor: "text-error" },
];

export default function StatusDropdown({
  currentFilter,
  onFilterChange,
  jobs,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const getCount = (filter: FilterValue): number | undefined => {
    if (!jobs) return undefined;
    if (filter === "All") return jobs.length;
    return jobs.filter((j) => j.status === filter).length;
  };

  const activeConfig = filterConfig.find((c) => c.value === currentFilter) || filterConfig[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        data-testid="status-filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          currentFilter !== "All"
            ? "bg-surface-container-high border-outline-variant text-on-surface"
            : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
        }`}
      >
        {activeConfig.dotColor && (
          <span className={`w-2 h-2 rounded-full ${activeConfig.dotColor} animate-pulse shrink-0`} />
        )}
        <span>{currentFilter === "All" ? "Status" : currentFilter}</span>
        <span className="material-symbols-outlined text-[16px] text-outline pointer-events-none">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Filter by Status"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-48 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-2xl py-1.5 z-40 focus:outline-none backdrop-blur-md"
        >
          <div className="px-3 py-1.5 border-b border-outline-variant/20 text-[10px] font-semibold text-outline uppercase tracking-wider">
            Filter by Status
          </div>
          {filterConfig.map(({ value, label, dotColor, textColor }) => {
            const isSelected = currentFilter === value;
            const count = getCount(value);

            return (
              <button
                key={value}
                role="menuitem"
                data-testid={`status-filter-option-${value.toLowerCase()}`}
                aria-label={value}
                onClick={() => {
                  onFilterChange(value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left hover:bg-surface-container-highest ${
                  isSelected ? "bg-surface-variant/70 text-on-surface font-semibold" : "text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-2">
                  {dotColor ? (
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-outline/40 shrink-0" />
                  )}
                  <span className={isSelected ? "text-on-surface font-semibold" : textColor}>
                    {label}
                  </span>
                </div>
                {count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-surface-container text-outline">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
