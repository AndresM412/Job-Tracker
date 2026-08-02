import { type JobApplication } from "../types/job";
import Card from "./Card";
import StatusBadge from "./StatusBadge";

const statusColor: Record<string, string> = {
  Applied: "var(--color-applied)",
  Interview: "var(--color-interview)",
  Offer: "var(--color-offer)",
  Rejected: "var(--color-rejected)",
};

type JobItemProps = {
  job: JobApplication;
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
};

function JobItem({ job, onDeleteJob, onEditJob }: JobItemProps) {
  return (
    <Card accentColor={statusColor[job.status]}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display font-medium text-lg text-text">
            {job.company}
          </h2>
          <p className="text-muted text-sm">{job.position}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <p className="font-mono text-xs text-muted mt-2">
        {job.applicationDate}
      </p>

      <div className="flex gap-2 mt-3">
        <button onClick={() => onEditJob(job)} className="btn-edit">
          Edit
        </button>
        <button onClick={() => onDeleteJob(job.id)} className="btn-delete">
          Delete
        </button>
      </div>
    </Card>
  );
}

export default JobItem;
