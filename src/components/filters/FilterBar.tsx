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
}> = [
  { value: "All" },
  { value: "Applied", dotColor: "bg-applied" },
  { value: "Interview", dotColor: "bg-interview" },
  { value: "Offer", dotColor: "bg-offer" },
  { value: "Rejected", dotColor: "bg-rejected" },
];

function FilterBar({ currentFilter, onFilterChange, jobs }: FilterBarProps) {
  const getCount = (filter: FilterValue): number | undefined => {
    if (!jobs) return undefined;
    if (filter === "All") return jobs.length;
    return jobs.filter((j) => j.status === filter).length;
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {filterConfig.map(({ value, dotColor }) => {
        const isActive = currentFilter === value;
        const count = getCount(value);

        return (
          <button
            key={value}
            aria-label={value}
            onClick={() => onFilterChange(value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? "bg-interview/25 border-interview/60 text-text font-semibold shadow-[0_0_12px_rgba(139,127,232,0.2)]"
                : "border-border/70 text-muted hover:text-text hover:border-border hover:bg-surface/50"
            }`}
          >
            {dotColor && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
                  isActive ? "shadow-[0_0_6px_currentColor]" : ""
                }`}
              />
            )}
            <span>{value}</span>
            {count !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  isActive ? "bg-interview/30 text-interview" : "bg-border/60 text-muted"
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