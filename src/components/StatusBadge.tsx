import { type JobStatus } from "../types/job";

type StatusBadgeProps = {
  status: JobStatus;
};

const statusStyles: Record<
  JobStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Applied: {
    label: "Applied",
    badgeClass: "bg-tertiary/15 text-tertiary",
    dotClass: "bg-tertiary shadow-[0_0_6px_#ffb95f]",
  },
  Interview: {
    label: "Interview",
    badgeClass: "bg-primary-container/15 text-primary-container",
    dotClass: "bg-primary-container shadow-[0_0_6px_#818cf8]",
  },
  Offer: {
    label: "Offer",
    badgeClass: "bg-secondary/15 text-secondary",
    dotClass: "bg-secondary shadow-[0_0_6px_#4edea3]",
  },
  Rejected: {
    label: "Rejected",
    badgeClass: "bg-error/15 text-error",
    dotClass: "bg-error shadow-[0_0_6px_#ffb4ab]",
  },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusStyles[status] || statusStyles.Applied;

  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase shrink-0 ${config.badgeClass}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}


export default StatusBadge;