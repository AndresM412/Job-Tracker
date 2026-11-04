import { useState, useRef, useEffect } from "react";

export type DateRange = {
  start: string;
  end: string;
};

type DateRangeDropdownProps = {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateRangeDropdown({
  dateRange,
  onDateRangeChange,
}: DateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month being viewed in the calendar
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (dateRange?.start) {
      const d = new Date(dateRange.start + "T00:00:00");
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Range in selection progress
  const [rangeStart, setRangeStart] = useState<string | null>(dateRange?.start || null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(dateRange?.end || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  useEffect(() => {
    setRangeStart(dateRange?.start || null);
    setRangeEnd(dateRange?.end || null);
  }, [dateRange]);

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

  // Navigation handlers
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Preset handlers
  const setPreset = (preset: "all" | "7d" | "30d" | "this-month") => {
    const today = new Date();
    const endStr = formatDate(today);

    if (preset === "all") {
      setRangeStart(null);
      setRangeEnd(null);
      onDateRangeChange(null);
      setIsOpen(false);
      return;
    }

    let startStr = "";
    if (preset === "7d") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      startStr = formatDate(past);
    } else if (preset === "30d") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      startStr = formatDate(past);
    } else if (preset === "this-month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startStr = formatDate(firstDay);
    }

    setRangeStart(startStr);
    setRangeEnd(endStr);
    onDateRangeChange({ start: startStr, end: endStr });
    setIsOpen(false);
  };

  // Day click handler for interactive range selection without typing
  const handleDayClick = (dayStr: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Step 1: User picks first date
      setRangeStart(dayStr);
      setRangeEnd(null);
    } else {
      // Step 2: User picks second date
      let start = rangeStart;
      let end = dayStr;

      if (dayStr < rangeStart) {
        start = dayStr;
        end = rangeStart;
      }

      setRangeStart(start);
      setRangeEnd(end);
      onDateRangeChange({ start, end });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoverDate(null);
    onDateRangeChange(null);
    setIsOpen(false);
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const todayStr = formatDate(new Date());

  const hasFilter = dateRange !== null;

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        data-testid="date-filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
          hasFilter
            ? "bg-surface-container-high border-secondary/40 text-secondary shadow-xs"
            : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
        <span>
          {hasFilter
            ? `${dateRange.start.slice(5)} to ${dateRange.end.slice(5)}`
            : "Date"}
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline pointer-events-none">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Calendar Date Range Picker"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 rounded-2xl bg-surface-container-high border border-outline-variant/40 shadow-2xl p-4 z-40 focus:outline-none backdrop-blur-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
            <span className="text-xs font-bold text-on-surface">
              Filter by Date
            </span>
            {hasFilter && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] text-error hover:underline cursor-pointer font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Quick Presets Row */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setPreset("all")}
              className={`px-1.5 py-1 text-[10px] font-semibold rounded-lg border text-center cursor-pointer transition-colors ${
                !hasFilter
                  ? "bg-primary-container/20 border-primary-container/40 text-primary-container"
                  : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setPreset("7d")}
              className="px-1.5 py-1 text-[10px] font-semibold rounded-lg border bg-surface-container border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant text-center cursor-pointer transition-colors"
            >
              Last 7D
            </button>
            <button
              type="button"
              onClick={() => setPreset("30d")}
              className="px-1.5 py-1 text-[10px] font-semibold rounded-lg border bg-surface-container border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant text-center cursor-pointer transition-colors"
            >
              Last 30D
            </button>
            <button
              type="button"
              onClick={() => setPreset("this-month")}
              className="px-1.5 py-1 text-[10px] font-semibold rounded-lg border bg-surface-container border-outline-variant/20 text-on-surface-variant hover:bg-surface-variant text-center cursor-pointer transition-colors"
            >
              This Month
            </button>
          </div>

          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            <span className="text-xs font-bold text-on-surface tracking-wide">
              {MONTH_NAMES[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="text-[10px] font-semibold text-outline uppercase">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

              const isStart = rangeStart === dayStr;
              const isEnd = rangeEnd === dayStr;
              const isToday = todayStr === dayStr;

              // Check if day is within selected range
              let isInRange = false;
              if (rangeStart && rangeEnd) {
                isInRange = dayStr >= rangeStart && dayStr <= rangeEnd;
              } else if (rangeStart && !rangeEnd && hoverDate) {
                const low = rangeStart < hoverDate ? rangeStart : hoverDate;
                const high = rangeStart < hoverDate ? hoverDate : rangeStart;
                isInRange = dayStr >= low && dayStr <= high;
              }

              return (
                <button
                  key={dayStr}
                  type="button"
                  onClick={() => handleDayClick(dayStr)}
                  onMouseEnter={() => rangeStart && !rangeEnd && setHoverDate(dayStr)}
                  className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isStart || isEnd
                      ? "bg-primary-container text-on-primary-container shadow-sm font-bold z-10"
                      : isInRange
                      ? "bg-primary-container/20 text-primary-container"
                      : "text-on-surface hover:bg-surface-container-highest"
                  } ${isToday && !isStart && !isEnd ? "border border-outline-variant" : ""}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Selection Status / Helper Note */}
          <div className="mt-3 pt-3 border-t border-outline-variant/20 text-center">
            <span className="text-[11px] text-on-surface-variant font-medium">
              {rangeStart && !rangeEnd ? (
                <span className="text-tertiary">Select end date to complete range</span>
              ) : rangeStart && rangeEnd ? (
                <span className="text-secondary font-mono">
                  {rangeStart} → {rangeEnd}
                </span>
              ) : (
                "Click a start date, then an end date"
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
