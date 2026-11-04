import React, { useState, useEffect, useRef } from "react";
import { type JobApplication } from "../types/job";
import SalaryRangeInput from "./SalaryRangeInput";

interface JobFormViewProps {
  mode: "create" | "edit";
  initialJob?: JobApplication | null;
  onSave: (job: JobApplication) => void;
  onCancel: () => void;
}

export const JobFormView: React.FC<JobFormViewProps> = ({
  mode,
  initialJob,
  onSave,
  onCancel,
}) => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"] | "">("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const [salary, setSalary] = useState<string | undefined>(undefined);
  const [round, setRound] = useState("");
  const [notes, setNotes] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit" && initialJob) {
      setCompany(initialJob.company);
      setPosition(initialJob.position);
      setStatus(initialJob.status);
      setApplicationDate(initialJob.applicationDate);
      setSalary(initialJob.salary);
      setRound(initialJob.round ?? "");
      setNotes(initialJob.notes ?? "");
    } else {
      setCompany("");
      setPosition("");
      setStatus("Applied");
      setApplicationDate(new Date().toISOString().split("T")[0]);
      setSalary(undefined);
      setRound("");
      setNotes("");
    }
  }, [mode, initialJob]);

  const isFormValid =
    company.trim() !== "" &&
    position.trim() !== "" &&
    status.trim() !== "" &&
    applicationDate.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload: JobApplication = {
      id: mode === "edit" && initialJob ? initialJob.id : Date.now().toString(),
      company: company.trim(),
      position: position.trim(),
      status: status as JobApplication["status"],
      applicationDate,
      salary,
      round: round.trim() === "" ? undefined : round.trim(),
      notes: notes.trim() === "" ? undefined : notes.trim(),
      created_at: mode === "edit" && initialJob ? initialJob.created_at : undefined,
    };

    onSave(payload);
  };

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div data-testid="job-form-view" className="space-y-6 animate-fadeIn">
      {/* Botón Volver a la Lista de Aplicaciones */}
      <div>
        <button
          type="button"
          onClick={onCancel}
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
            {/* Emblema con icono o inicial */}
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center font-bold text-2xl text-on-surface shrink-0 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
              {mode === "edit" && initialJob?.company ? (
                initialJob.company.charAt(0).toUpperCase()
              ) : (
                <span className="material-symbols-outlined text-primary-container text-[28px]">
                  add_circle
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  {mode === "edit"
                    ? `Edit Application: ${initialJob?.company || ""}`
                    : "Stage New Application"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary-container font-mono text-[10px] uppercase tracking-wider border border-primary-container/30">
                  {mode === "edit" ? "Edit Mode" : "New Record"}
                </span>
              </div>
              <p className="text-sm font-medium text-on-surface-variant">
                {mode === "edit"
                  ? "Update opportunity details, interview status, compensation, and debrief notes."
                  : "Enter the opportunity details below to capture it in your tracking pipeline."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Principal en Pantalla Completa */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-7 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Datos Principales de la Vacante */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Role &amp; Opportunity Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Company <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company"
                  maxLength={30}
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Role / Position <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Position"
                  maxLength={30}
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Estado y Fecha */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Status &amp; Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Current Status <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select
                    data-testid="status-select"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as JobApplication["status"])
                    }
                    className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none appearance-none transition-all cursor-pointer"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <span className="material-symbols-outlined text-outline pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Application Date <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={applicationDate}
                    onChange={(e) => setApplicationDate(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 pr-11 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all cursor-text [color-scheme:dark]"
                  />
                  <button
                    type="button"
                    onClick={handleOpenDatePicker}
                    title="Open calendar picker"
                    aria-label="Open calendar picker"
                    className="absolute right-2.5 p-1.5 rounded-lg text-outline hover:text-primary-container hover:bg-surface-container transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] block pointer-events-none">
                      calendar_month
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-outline mt-1 font-mono">
                  Type manually (YYYY-MM-DD) or click the calendar icon to pick a date.
                </p>
              </div>
            </div>
          </div>

          {/* Sección 3: Compensación y Etapa */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Compensation &amp; Interview Stage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Compensation Band (Optional)
                </label>
                <SalaryRangeInput value={salary} onChange={setSalary} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Round / Stage (Optional)
                </label>
                <input
                  type="text"
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  placeholder="Round / Stage (e.g. Round 2/4, optional)"
                  maxLength={50}
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Notas y Detalles */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant">
                Notes &amp; Intelligence (Optional)
              </label>
              <span
                className={`text-[11px] font-mono ${
                  notes.length >= 3800
                    ? "text-error"
                    : notes.length >= 3200
                    ? "text-tertiary"
                    : "text-outline"
                }`}
              >
                {notes.length}/4000
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional) — job link, salary band, recruiter contact, or notes..."
              rows={4}
              maxLength={4000}
              className="w-full bg-surface-container-lowest text-on-surface text-sm p-4 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all resize-y"
            />
          </div>

          {/* Botones de Acción: tamaños y proporciones armónicas */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/60 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">
                close
              </span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-5 py-2.5 bg-primary-container text-surface hover:brightness-110 active:scale-95 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(129,140,248,0.35)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {mode === "edit" ? "save" : "add_circle"}
              </span>
              <span>{mode === "edit" ? "Save Changes" : "Add Job"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormView;

