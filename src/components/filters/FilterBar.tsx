import { type JobStatus } from "../../types/job";

export type FilterValue = "All" | JobStatus;

type FilterBarProps = {
  currentFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
};

const filters: FilterValue[] = ["All", "Applied", "Interview", "Offer", "Rejected"];

function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => {
        const isActive = currentFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              isActive
                ? "bg-interview border-interview text-bg"
                : "border-border text-muted hover:text-text hover:border-text"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;