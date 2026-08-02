import { type JobStatus } from "../types/job";

type StatusBadgeProps = {
  status: JobStatus;
};

const statusConfig: Record<JobStatus, { message: string; icon: string; color: string }> = {
  Applied: { message: "Application Applied!", icon: "⏳", color: "var(--color-applied)" },
  Interview: { message: "Application Interviewed!", icon: "🎉", color: "var(--color-interview)" },
  Offer: { message: "Application Offer!", icon: "🚀", color: "var(--color-offer)" },
  Rejected: { message: "Application Rejected!", icon: "❌", color: "var(--color-rejected)" },
};

function StatusBadge({ status }: StatusBadgeProps) {
  const { message, icon, color } = statusConfig[status];

  return (
    <p className="text-sm font-medium" style={{ color }}>
      {icon} {message}
    </p>
  );
}

export default StatusBadge;