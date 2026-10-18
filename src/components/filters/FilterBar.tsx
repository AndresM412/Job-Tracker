import { type JobApplication, type JobStatus } from "../../types/job";

export type FilterValue = "All" | JobStatus;

type FilterBarProps = {
  currentFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  jobs?: JobApplication[];
};

const filterConfig: Array<{
  value: FilterValue;
  dotColor?: string;
  textColor?: string;
}> = [
  { value: "All", textColor: "text-on-surface" },
  { value: "Applied", dotColor: "bg-tertiary", textColor: "text-tertiary" },
  { value: "Interview", dotColor: "bg-primary-container", textColor: "text-primary-container" },
  { value: "Offer", dotColor: "bg-secondary", textColor: "text-secondary" },
  { value: "Rejected", dotColor: "bg-error", textColor: "text-error" },
];

function FilterBar({ currentFilter, onFilterChange, jobs }: FilterBarProps) {
  const getCount = (filter: FilterValue): number | undefined => {
    if (!jobs) return undefined;
    if (filter === "All") return jobs.length;
    return jobs.filter((j) => j.status === filter).length;
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {filterConfig.map(({ value, dotColor, textColor }) => {
        const isActive = currentFilter === value;
        const count = getCount(value);

        return (
          <button
            key={value}
            aria-label={value}
            onClick={() => onFilterChange(value)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? "bg-on-surface text-surface shadow-sm"
                : `bg-surface-container ${textColor} hover:bg-surface-container-high`
            }`}
          >
            {dotColor && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`}
              />
            )}

            <span>{value}</span>
            {count !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  isActive
                    ? "bg-surface/20 text-surface"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
