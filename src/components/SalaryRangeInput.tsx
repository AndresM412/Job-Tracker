import { useState, useRef, useEffect } from "react";
import {
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
  formatSalaryRange,
  parseSalaryRange,
} from "../utils/salary";

type SalaryRangeInputProps = {
  value?: string;
  onChange: (value?: string) => void;
};

export function SalaryRangeInput({ value, onChange }: SalaryRangeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value or defaults
  const parsed = parseSalaryRange(value);
  const [currency, setCurrency] = useState<CurrencyCode>(parsed?.currency || "USD");
  const [minSalary, setMinSalary] = useState(parsed?.min || "");
  const [maxSalary, setMaxSalary] = useState(parsed?.max || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync internal state when external value changes (e.g. reset form or edit mode)
  useEffect(() => {
    const currentParsed = parseSalaryRange(value);
    if (currentParsed) {
      setCurrency(currentParsed.currency);
      setMinSalary(currentParsed.min);
      setMaxSalary(currentParsed.max);
    } else {
      setMinSalary("");
      setMaxSalary("");
      setCurrency("USD");
    }
    setErrorMsg(null);
  }, [value]);

  // Click outside listener to close popover
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

  const handleApply = () => {
    const minTrimmed = minSalary.trim();
    const maxTrimmed = maxSalary.trim();

    // Si ambos están vacíos, se limpia el salario
    if (!minTrimmed && !maxTrimmed) {
      onChange(undefined);
      setIsOpen(false);
      setErrorMsg(null);
      return;
    }

    // Si solo uno está lleno
    if (!minTrimmed || !maxTrimmed) {
      setErrorMsg("Please enter both Min and Max salary.");
      return;
    }

    const minNum = parseFloat(minTrimmed);
    const maxNum = parseFloat(maxTrimmed);

    if (isNaN(minNum) || isNaN(maxNum) || minNum < 0 || maxNum < 0) {
      setErrorMsg("Please enter valid positive numbers.");
      return;
    }

    if (minNum > maxNum) {
      setErrorMsg("Min salary cannot be greater than Max salary.");
      return;
    }

    const formatted = formatSalaryRange(minNum, maxNum, currency);
    onChange(formatted);
    setIsOpen(false);
    setErrorMsg(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinSalary("");
    setMaxSalary("");
    onChange(undefined);
    setErrorMsg(null);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input Field */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-surface-container transition-all select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
            payments
          </span>
          {value ? (
            <span className="font-semibold text-on-surface truncate">
              {value}
            </span>
          ) : (
            <span className="text-outline truncate">
              Set salary range & currency (optional)...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear salary"
              className="p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] block">
                close
              </span>
            </button>
          )}
          <span className="material-symbols-outlined text-outline text-[18px]">
            {isOpen ? "expand_less" : "tune"}
          </span>
        </div>
      </div>

      {/* Floating Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-surface-container border border-outline-variant/50 rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <span className="text-xs font-semibold text-on-surface uppercase tracking-wider">
              Configure Salary Band
            </span>
            <span className="text-[11px] text-on-surface-variant">Optional</span>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-3 py-2 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-primary-container transition-all cursor-pointer font-medium"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option
                    key={curr.code}
                    value={curr.code}
                    className="bg-surface-container-lowest text-on-surface"
                  >
                    {curr.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-outline pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Min & Max Inputs */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Min Salary
              </label>
              <input
                type="number"
                min="0"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g. 180000"
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-3 py-2 rounded-lg placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Max Salary
              </label>
              <input
                type="number"
                min="0"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="e.g. 220000"
                className="w-full bg-surface-container-lowest text-on-surface text-xs px-3 py-2 rounded-lg placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-xs text-error font-medium">⚠️ {errorMsg}</p>
          )}

          {/* Popover Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all shadow-sm shadow-primary-container/30 cursor-pointer"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryRangeInput;
