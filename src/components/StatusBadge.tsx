import { type JobStatus} from "../types/job";

type StatusBadgeProps = {
    status: JobStatus
};

function StatusBadge({ status }: StatusBadgeProps) {
  let statusMessage = "";
  let statusIcon = "";

  if (status === "Applied") {
    statusMessage = "Application Applied!";
    statusIcon = "⏳";
  } else if (status === "Interview") {
    statusMessage = "Application Interviewed!";
    statusIcon = "🎉";
  } else if (status === "Offer") {
    statusMessage = "Application Offer!";
    statusIcon = "🚀";
  } else if (status === "Rejected") {
    statusMessage = "Application Rejected!";
    statusIcon = "❌";
  }

  return (
    <p>
      {statusIcon} {statusMessage}
    </p>
  );
}

export default StatusBadge;