import { type JobApplication } from "../types/job";
import StatusBadge from "./StatusBadge";

type JobModalProps = {
  job: JobApplication;
  onClose: () => void;
};

function renderFormattedNotes(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-container underline hover:brightness-125 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function JobModal({ job, onClose }: JobModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-xl text-on-surface break-words">
              {job.company}
            </h2>
            <p className="text-on-surface-variant text-sm break-words">
              {job.position}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusBadge status={job.status} />
          {job.round && (
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold border border-outline-variant/30 uppercase tracking-wider">
              {job.round}
            </span>
          )}
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-[11px] font-semibold border border-outline-variant/30">
              <span className="material-symbols-outlined text-[13px] text-outline">payments</span>
              {job.salary}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant/80 mb-5">
          <span className="material-symbols-outlined text-[15px]">
            calendar_today
          </span>
          <span>Applied on {job.applicationDate}</span>
        </div>

        <div className="border-t border-outline-variant/20 pt-4">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Notes & Intelligence
          </h3>
          <div className="bg-surface-container-lowest/70 border border-outline-variant/20 rounded-xl p-3.5 text-sm text-on-surface-variant whitespace-pre-wrap break-words leading-relaxed">
            {job.notes ? renderFormattedNotes(job.notes) : "No notes added yet."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobModal;

