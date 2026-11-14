import { useState, useRef, useEffect } from "react";
import { type JobApplication } from "../../../types/job";

export type PriorityFilterValue = "All" | 0 | 1 | 2 | 3 | 4 | 5;

type PriorityDropdownProps = {
  currentFilter: PriorityFilterValue;
  onFilterChange: (filter: PriorityFilterValue) => void;
  jobs?: JobApplication[];
};

const PRIORITY_OPTIONS: Array<{
  value: PriorityFilterValue;
  label: string;
  stars: number | null;
}> = [
  { value: "All", label: "All Priorities", stars: null },
  { value: 5, label: "5 Stars", stars: 5 },
  { value: 4, label: "4 Stars", stars: 4 },
  { value: 3, label: "3 Stars", stars: 3 },
  { value: 2, label: "2 Stars", stars: 2 },
  { value: 1, label: "1 Star", stars: 1 },
  { value: 0, label: "Unrated", stars: 0 },
];

export default function PriorityDropdown({
  currentFilter,
  onFilterChange,
  jobs,
}: PriorityDropdownProps) {
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

  const getCount = (value: PriorityFilterValue): number | undefined => {
    if (!jobs) return undefined;
    if (value === "All") return jobs.length;
    return jobs.filter((job) => (job.priority ?? 0) === value).length;
  };

  const buttonLabel =
    currentFilter === "All"
      ? "Priority"
      : currentFilter === 0
      ? "Unrated"
      : `${currentFilter} ${currentFilter === 1 ? "Star" : "Stars"}`;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        data-testid="priority-filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          currentFilter !== "All"
            ? "bg-surface-container-high border-outline-variant text-on-surface"
            : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-3.5 shrink-0 ${
            currentFilter !== "All" ? "text-tertiary" : "text-outline"
          }`}
          fill={
            typeof currentFilter === "number" && currentFilter > 0
              ? "currentColor"
              : "none"
          }
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>{buttonLabel}</span>
        <span className="material-symbols-outlined text-[16px] text-outline pointer-events-none">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Filter by Priority"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-52 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-2xl py-1.5 z-40 focus:outline-none backdrop-blur-md"
        >
          <div className="px-3 py-1.5 border-b border-outline-variant/20 text-[10px] font-semibold text-outline uppercase tracking-wider">
            Filter by Priority
          </div>

          {PRIORITY_OPTIONS.map(({ value, label, stars }) => {
            const isSelected = currentFilter === value;
            const count = getCount(value);
            const optionTestId =
              value === "All"
                ? "priority-filter-option-all"
                : `priority-filter-option-${value}`;

            return (
              <button
                key={String(value)}
                type="button"
                role="menuitem"
                data-testid={optionTestId}
                onClick={() => {
                  onFilterChange(value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left hover:bg-surface-container-highest ${
                  isSelected
                    ? "bg-surface-variant/70 text-on-surface font-semibold"
                    : "text-on-surface-variant"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {stars !== null && stars > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-tertiary">
                      {Array.from({ length: stars }).map((_, idx) => (
                        <svg
                          key={idx}
                          viewBox="0 0 24 24"
                          className="w-3 h-3"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </span>
                  ) : (
                    <span className="text-outline/70 font-mono text-[10px] w-4 text-center">
                      {value === "All" ? "•" : "0★"}
                    </span>
                  )}
                  <span className="truncate">{label}</span>
                </div>

                {count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-surface-container text-outline shrink-0">
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

