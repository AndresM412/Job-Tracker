export type SortOrder = "newest" | "oldest";

type SortControlProps = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

function SortControl({ value, onChange }: SortControlProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOrder)}
      className="input-field"
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </select>
  );
}

export default SortControl;