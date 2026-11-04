export type SortOrder = "recently_added" | "newest" | "oldest";

type SortControlProps = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="relative shrink-0 self-end sm:self-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOrder)}
        aria-label="Sort by"
        data-testid="sort-control"
        className="bg-surface-container text-on-surface text-xs pl-3.5 pr-8 py-1.5 rounded-lg appearance-none focus:outline-none hover:bg-surface-container-high transition-all cursor-pointer font-medium"
      >
        <option value="recently_added">Recently added</option>
        <option value="newest">Application date: Newest</option>
        <option value="oldest">Application date: Oldest</option>
      </select>
      <span className="material-symbols-outlined text-outline pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px]">
        sort
      </span>
    </div>
  );
}

export default SortControl;
