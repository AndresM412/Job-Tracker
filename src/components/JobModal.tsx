import { type JobApplication } from "../types/job";
import StatusBadge from "./StatusBadge";

type JobModalProps = {
  job: JobApplication;
  onClose: () => void;
};

function JobModal({ job, onClose }: JobModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display font-medium text-xl text-text break-words">
              {job.company}
            </h2>
            <p className="text-muted text-sm break-words">{job.position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-xl leading-none"
          >
            ×
          </button>
        </div>

        <StatusBadge status={job.status} />

        <p className="font-mono text-xs text-muted mt-3">
          Applied on {job.applicationDate}
        </p>

        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-text mb-2">Notes</h3>
          <p className="text-sm text-muted whitespace-pre-wrap break-words">
            {job.notes ? job.notes : "No notes added yet."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default JobModal;