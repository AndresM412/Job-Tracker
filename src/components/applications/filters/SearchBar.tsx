type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by company, position, or status..."
        className="w-full bg-surface-container-low text-on-surface text-sm pl-11 pr-4 py-2.5 rounded-xl placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all shadow-inner"
      />
    </div>
  );
}

export default SearchBar;
