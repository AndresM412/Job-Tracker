import { type JobStatus } from "../types/job";

type StatusBadgeProps = {
  status: JobStatus;
};

const statusStyles: Record<
  JobStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Applied: {
    label: "Applied",
    bg: "rgba(245, 166, 91, 0.12)",
    text: "var(--color-applied)",
    border: "rgba(245, 166, 91, 0.3)",
    dot: "var(--color-applied)",
  },
  Interview: {
    label: "Interview",
    bg: "rgba(139, 127, 232, 0.12)",
    text: "var(--color-interview)",
    border: "rgba(139, 127, 232, 0.3)",
    dot: "var(--color-interview)",
  },
  Offer: {
    label: "Offer",
    bg: "rgba(95, 217, 168, 0.12)",
    text: "var(--color-offer)",
    border: "rgba(95, 217, 168, 0.3)",
    dot: "var(--color-offer)",
  },
  Rejected: {
    label: "Rejected",
    bg: "rgba(232, 96, 124, 0.12)",
    text: "var(--color-rejected)",
    border: "rgba(232, 96, 124, 0.3)",
    dot: "var(--color-rejected)",
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusStyles[status] || statusStyles.Applied;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ backgroundColor: config.dot }}
      />
      {config.label}
    </span>
  );
}

export default StatusBadge;