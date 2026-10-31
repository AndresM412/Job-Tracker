import React from "react";
import { type JobApplication } from "../types/job";
import StatusBadge from "./StatusBadge";

interface JobDetailViewProps {
  job: JobApplication;
  onBack: () => void;
  onEdit: (job: JobApplication) => void;
  onDelete: (job: JobApplication) => void;
}

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
          className="text-primary-container underline hover:brightness-125 break-all font-medium"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  onBack,
  onEdit,
  onDelete,
}) => {
  return (
    <div data-testid="job-detail-view" className="space-y-6">
      {/* Botón Volver a la Lista de Aplicaciones */}
      <div>
        <button
          type="button"
          onClick={onBack}
          data-testid="back-to-applications-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 transition-all cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Emblema con la inicial de la empresa */}
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center font-bold text-2xl text-on-surface shrink-0 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
              {job.company.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  {job.company}
                </h1>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-sm font-medium text-on-surface-variant">
                {job.position}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs text-on-surface-variant/80">
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="material-symbols-outlined text-[15px] text-outline">
                    calendar_today
                  </span>
                  <span>Applied on {job.applicationDate}</span>
                </span>

                {job.salary && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-semibold text-[11px] border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[13px] text-outline">
                        payments
                      </span>
                      <span>{job.salary}</span>
                    </span>
                  </>
                )}

                {job.round && (
                  <>
                    <span>•</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border border-outline-variant/30">
                      {job.round}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Acciones principales: Edit y Delete */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(job)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/60 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(job)}
              className="px-4 py-2 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-error border border-error/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas de Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda (7 cols): Resumen & Notas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ficha Técnica / Application Overview */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Application Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Company</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.company}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Role / Position</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.position}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Status</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Date Applied</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.applicationDate}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Compensation Range</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.salary || "Not specified"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/20">
                <span className="text-outline block mb-1">Interview Round / Stage</span>
                <span className="font-semibold text-on-surface text-sm">
                  {job.round || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Notas & Intelligence */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                Notes &amp; Intelligence
              </h2>
              <button
                type="button"
                onClick={() => onEdit(job)}
                className="text-xs text-primary-container font-semibold hover:underline cursor-pointer"
              >
                Edit Notes
              </button>
            </div>

            <div className="bg-surface-container-lowest/70 border border-outline-variant/20 rounded-xl p-4 text-xs sm:text-sm text-on-surface-variant whitespace-pre-wrap break-words leading-relaxed">
              {job.notes ? (
                renderFormattedNotes(job.notes)
              ) : (
                <span className="text-outline italic">
                  No notes recorded yet for this opportunity. Click "Edit Notes" to add salary notes, interview loops, or recruiter contact details.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha (5 cols): Strategy & Next Steps */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Stage Guidance */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                lightbulb
              </span>
              <h2 className="text-sm font-bold text-on-surface">
                Stage Guidance &amp; Tips
              </h2>
            </div>

            {job.status === "Interview" && (
              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p className="font-medium text-primary-container">
                  Active Interview Loop in progress!
                </p>
                <p>
                  Review system design fundamentals, common behavioral questions (STAR method), and research the company’s recent engineering blog posts.
                </p>
              </div>
            )}

            {job.status === "Offer" && (
              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p className="font-medium text-secondary">
                  Offer received! Congratulations.
                </p>
                <p>
                  Compare base compensation, bonus structures, health benefits, and equity vesting schedules before making your decision.
                </p>
              </div>
            )}

            {job.status === "Applied" && (
              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p className="font-medium text-tertiary">
                  Application submitted.
                </p>
                <p>
                  If you haven’t received a response in 7 to 10 days, look for a recruiter or hiring manager on LinkedIn to follow up politely.
                </p>
              </div>
            )}

            {job.status === "Rejected" && (
              <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                <p className="font-medium text-error">
                  Process concluded.
                </p>
                <p>
                  Keep the learnings and technical feedback in mind for upcoming interview loops with other teams.
                </p>
              </div>
            )}
          </div>

          {/* External Research Shortcuts */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-3">
              Quick Research
            </h2>
            <div className="space-y-2">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(job.company + " careers interview questions")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/60 hover:bg-surface-container border border-outline-variant/20 text-xs text-on-surface hover:text-primary-container transition-all"
              >
                <span>Google Interview Questions</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
              <a
                href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(job.company)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/60 hover:bg-surface-container border border-outline-variant/20 text-xs text-on-surface hover:text-primary-container transition-all"
              >
                <span>Search {job.company} on LinkedIn</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailView;
