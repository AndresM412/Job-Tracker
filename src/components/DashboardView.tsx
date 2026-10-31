import React from "react";
import { type JobApplication } from "../types/job";
import StatsBanner from "./StatsBanner";
import StatusBadge from "./StatusBadge";

interface DashboardViewProps {
  jobs: JobApplication[];
  onNavigateToApplications: () => void;
  onNavigateToCalendar: () => void;
  onSelectJob: (job: JobApplication) => void;
  onAddNewJob: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  onNavigateToApplications,
  onNavigateToCalendar,
  onSelectJob,
  onAddNewJob,
}) => {
  // Las últimas aplicaciones ordenadas por fecha más reciente
  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
    )
    .slice(0, 4);

  // Filtrar entrevistas activas para el bloque de acción
  const interviewJobs = jobs.filter((j) => j.status === "Interview");
  const offerJobs = jobs.filter((j) => j.status === "Offer");

  return (
    <div className="space-y-6">
      {/* 1. Telemetría de Pipeline (StatsBanner) */}
      <StatsBanner jobs={jobs} />

      {/* 2. Grid Principal: Recent Applications (60%) vs Actions & Schedule (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Recent Applications */}
        <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/20">
            <div>
              <h2 className="text-base font-bold text-on-surface tracking-tight">
                Recent Applications
              </h2>
              <p className="text-xs text-on-surface-variant">
                Your latest logged opportunities
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToApplications}
              className="text-xs font-semibold text-primary-container hover:underline flex items-center gap-1 group cursor-pointer"
            >
              <span>View all ({jobs.length})</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl bg-surface-container-lowest/50 border border-dashed border-outline-variant/40">
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">
                post_add
              </span>
              <p className="text-sm font-semibold text-on-surface">
                No applications logged yet
              </p>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Start tracking your job search by adding your first application.
              </p>
              <button
                type="button"
                onClick={onAddNewJob}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                + Add First Application
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest/70 hover:bg-surface-container border border-outline-variant/30 hover:border-outline-variant/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    {/* Emblema inicial */}
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center font-bold text-sm text-on-surface shrink-0 group-hover:scale-105 transition-transform">
                      {job.company.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary-container transition-colors">
                        {job.company}
                      </h3>
                      <p className="text-xs text-on-surface-variant truncate">
                        {job.position}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-on-surface-variant/70">
                        <span className="flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[13px]">
                            calendar_today
                          </span>
                          <span>{job.applicationDate}</span>
                        </span>
                        {job.salary && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-on-surface truncate max-w-[140px]">
                              {job.salary}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <span className="material-symbols-outlined text-outline text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Action Items, Interviews & Calendar Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Active Interview Loops */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  auto_awesome
                </span>
                <h2 className="text-sm font-bold text-on-surface tracking-tight">
                  Active Interview Loops
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary-container/15 text-primary-container border border-primary-container/30">
                {interviewJobs.length} In Progress
              </span>
            </div>

            {interviewJobs.length === 0 ? (
              <p className="text-xs text-on-surface-variant leading-relaxed py-2">
                No active interview rounds right now. Keep sending targeted
                applications!
              </p>
            ) : (
              <div className="space-y-3">
                {interviewJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="p-3 rounded-xl bg-surface-container-lowest/80 border border-primary-container/20 hover:border-primary-container/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-on-surface truncate">
                        {job.company}
                      </span>
                      <span className="text-[10px] font-mono text-primary font-medium">
                        {job.round || "Interview Stage"}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {job.position}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Decisions & Offers Alert (si existen) */}
          {offerJobs.length > 0 && (
            <div className="bg-secondary/5 border border-secondary/30 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  rocket_launch
                </span>
                <h3 className="text-sm font-bold text-secondary">
                  Offers Pending Decision ({offerJobs.length})
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                You have active offers. Review total compensation, equity bands,
                and deadline dates carefully.
              </p>
              <button
                type="button"
                onClick={onNavigateToApplications}
                className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
              >
                Review offers in Applications →
              </button>
            </div>
          )}

          {/* Card: Calendar & Deadlines Shortcut */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">
                  calendar_month
                </span>
                <h3 className="text-sm font-bold text-on-surface">
                  Interview Calendar
                </h3>
              </div>
              <button
                type="button"
                onClick={onNavigateToCalendar}
                className="text-xs font-semibold text-primary-container hover:underline cursor-pointer"
              >
                Open Calendar →
              </button>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Plan and view your technical loops, recruiter screening calls, and
              take-home challenge deadlines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
