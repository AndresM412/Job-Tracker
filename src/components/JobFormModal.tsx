import React, { useState, useEffect } from "react";
import { type JobApplication } from "../types/job";
import SalaryRangeInput from "./SalaryRangeInput";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (job: JobApplication) => void;
  onUpdateJob: (job: JobApplication) => void;
  editingJob: JobApplication | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onAddJob,
  onUpdateJob,
  editingJob,
}) => {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"] | "">("");
  const [applicationDate, setApplicationDate] = useState("");
  const [salary, setSalary] = useState<string | undefined>(undefined);
  const [round, setRound] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingJob) {
      setCompany(editingJob.company);
      setPosition(editingJob.position);
      setStatus(editingJob.status);
      setApplicationDate(editingJob.applicationDate);
      setSalary(editingJob.salary);
      setRound(editingJob.round ?? "");
      setNotes(editingJob.notes ?? "");
    } else {
      setCompany("");
      setPosition("");
      setStatus("");
      setApplicationDate(new Date().toISOString().split("T")[0]);
      setSalary(undefined);
      setRound("");
      setNotes("");
    }
  }, [editingJob, isOpen]);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFormValid =
    company.trim() !== "" &&
    position.trim() !== "" &&
    status.trim() !== "" &&
    applicationDate.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    if (editingJob) {
      const updatedJob: JobApplication = {
        id: editingJob.id,
        company,
        position,
        status: status as JobApplication["status"],
        applicationDate,
        salary,
        round: round.trim() === "" ? undefined : round.trim(),
        notes: notes.trim() === "" ? undefined : notes,
      };
      onUpdateJob(updatedJob);
    } else {
      const newJob: JobApplication = {
        id: Date.now().toString(),
        company,
        position,
        status: status as JobApplication["status"],
        applicationDate,
        salary,
        round: round.trim() === "" ? undefined : round.trim(),
        notes: notes.trim() === "" ? undefined : notes,
      };
      onAddJob(newJob);
    }

    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-form-modal-title"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 sm:p-7 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container font-bold">
              <span className="material-symbols-outlined text-[18px]">
                {editingJob ? "edit_document" : "post_add"}
              </span>
            </div>
            <div>
              <h2
                id="job-form-modal-title"
                className="text-lg font-bold text-on-surface tracking-tight"
              >
                {editingJob ? "Edit Application" : "Stage New Application"}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {editingJob
                  ? "Update job status, compensation, or interview loop"
                  : "Fill in the required information to track this role"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Empresa & Posición */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Company *
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                maxLength={30}
                required
                className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Position *
              </label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Position"
                maxLength={40}
                required
                className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all"
              />
            </div>
          </div>

          {/* Fila 2: Status & Application Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Status *
              </label>
              <div className="relative">
                <select
                  data-testid="status-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as JobApplication["status"])
                  }
                  required
                  className={`w-full bg-surface-container-lowest text-sm px-3.5 py-2.5 rounded-lg appearance-none focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all cursor-pointer ${
                    status === "" ? "text-outline" : "text-on-surface font-medium"
                  }`}
                >
                  <option value="" disabled hidden>
                    Select Status...
                  </option>
                  <option className="bg-surface-container-lowest text-tertiary" value="Applied">
                    Applied
                  </option>
                  <option className="bg-surface-container-lowest text-primary" value="Interview">
                    Interview
                  </option>
                  <option className="bg-surface-container-lowest text-secondary" value="Offer">
                    Offer
                  </option>
                  <option className="bg-surface-container-lowest text-error" value="Rejected">
                    Rejected
                  </option>
                </select>
                <span className="material-symbols-outlined text-outline pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px]">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Application Date *
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                required
                className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all"
              />
            </div>
          </div>

          {/* Fila 3: Rango Salarial Popover + Round / Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Salary Range (Optional)
              </label>
              <SalaryRangeInput value={salary} onChange={setSalary} />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                Interview Round / Stage (Optional)
              </label>
              <input
                value={round}
                onChange={(e) => setRound(e.target.value)}
                placeholder="e.g. Round 2/4, Screen"
                maxLength={50}
                className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all"
              />
            </div>
          </div>

          {/* Fila 4: Notas con Límite de 4000 caracteres */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Notes &amp; Intelligence (Optional)
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional) — job link, salary band, recruiter contact, or notes..."
                rows={3}
                maxLength={4000}
                className="w-full bg-surface-container-lowest text-on-surface text-sm p-3.5 pb-6 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container border border-outline-variant/30 focus:border-primary-container transition-all resize-none"
              />
              <div className="flex justify-end pr-3 pb-1.5 -mt-6 pointer-events-none">
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    notes.length >= 3800
                      ? "text-error font-semibold"
                      : notes.length >= 3200
                      ? "text-tertiary"
                      : "text-outline/70"
                  }`}
                >
                  {notes.length}/4000
                </span>
              </div>
            </div>
          </div>

          {/* Acciones del Modal: Cancel & Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-5 py-2.5 bg-primary-container text-on-primary-container text-xs rounded-lg font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(129,140,248,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">
                {editingJob ? "save" : "add_circle"}
              </span>
              <span>{editingJob ? "Save Changes" : "Add Job"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
