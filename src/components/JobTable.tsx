import { useState } from "react";
import StatusBadge from "./StatusBadge";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { type JobApplication } from "../types/job";

type JobTableProps = {
  jobs: JobApplication[];
  onDeleteJob: (id: string) => void;
  onEditJob: (job: JobApplication) => void;
  onViewDetails?: (job: JobApplication) => void;
};

function JobTable({ jobs, onDeleteJob, onEditJob, onViewDetails }: JobTableProps) {
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);


  return (
    <>
      <div
        data-testid="job-table-container"
        className="w-full overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur shadow-sm"
      >
        <table className="w-full text-left border-collapse table-auto" data-testid="job-table">
          <thead>
            <tr className="border-b border-outline-variant/20 bg-surface-container-low/60">
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap"
              >
                Applied Date
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap min-w-[170px]"
              >
                Stage / Salary
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider text-right whitespace-nowrap w-[130px]"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {jobs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-14 text-center text-on-surface-variant text-sm font-medium"
                >
                  No applications match this filter.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onViewDetails?.(job)}
                data-testid={`job-card-${job.company}`}
                className="group hover:bg-surface-container-high/40 transition-colors cursor-pointer"
              >
                {/* 1. Company */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/40 flex items-center justify-center font-bold text-sm text-primary-container shadow-xs shrink-0">
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-bold text-on-surface group-hover:text-primary-container transition-colors truncate max-w-[180px] sm:max-w-[220px]"
                        title={job.company}
                      >
                        {job.company}
                      </div>
                      {job.notes && (
                        <div
                          className="text-[11px] text-on-surface-variant/70 truncate max-w-[180px] sm:max-w-[220px]"
                          title={job.notes}
                        >
                          {job.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* 2. Role */}
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-on-surface">
                  <div
                    className="truncate max-w-[180px] sm:max-w-[220px]"
                    title={job.position}
                  >
                    {job.position}
                  </div>
                </td>

                {/* 3. Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={job.status} />
                </td>

                {/* 4. Applied Date */}
                <td className="px-5 py-4 whitespace-nowrap text-xs text-on-surface-variant font-mono">
                  {job.applicationDate}
                </td>

                {/* 5. Stage / Salary */}
                <td className="px-5 py-4 whitespace-nowrap text-xs text-on-surface-variant min-w-[170px] max-w-[220px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {job.salary ? (
                      <span
                        className="font-semibold text-secondary px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 truncate max-w-[160px]"
                        title={job.salary}
                      >
                        {job.salary}
                      </span>
                    ) : null}
                    {job.round ? (
                      <span
                        className="text-[11px] font-medium text-primary-container px-2 py-0.5 rounded-md bg-primary-container/10 border border-primary-container/20 truncate max-w-[120px]"
                        title={job.round}
                      >
                        {job.round}
                      </span>
                    ) : null}
                    {!job.salary && !job.round && (
                      <span className="text-outline/50">—</span>
                    )}
                  </div>
                </td>

                {/* 6. Actions */}
                <td className="px-5 py-4 whitespace-nowrap text-right w-[130px]">
                  <div className="inline-flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    {onViewDetails && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(job);
                        }}
                        className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                        title="View details"
                        aria-label={`View details for ${job.company}`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          visibility
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditJob(job);
                      }}
                      className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setJobToDelete(job);
                      }}
                      className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container/30 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {jobToDelete && (
        <ConfirmDeleteModal
          job={jobToDelete}
          onConfirm={() => {
            onDeleteJob(jobToDelete.id);
            setJobToDelete(null);
          }}
          onCancel={() => setJobToDelete(null)}
        />
      )}
    </>
  );
}

export default JobTable;
