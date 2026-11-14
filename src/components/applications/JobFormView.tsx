import React, { useState, useEffect, useRef } from "react";
import { type JobApplication, type WorkMode } from "../../types/job";
import SalaryRangeInput from "../ui/SalaryRangeInput";
import { getSafeHttpUrl } from "../../utils/urlUtils";

interface JobFormViewProps {
  mode: "create" | "edit";
  initialJob?: JobApplication | null;
  onSave: (job: JobApplication) => Promise<void> | void;
  onCancel: () => void;
}

const WORK_MODE_OPTIONS: Array<{ value: WorkMode; icon: string }> = [
  { value: "Remote", icon: "laptop_mac" },
  { value: "Hybrid", icon: "swap_horiz" },
  { value: "On-site", icon: "apartment" },
];

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
  const [jobUrl, setJobUrl] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode | undefined>(undefined);
  const [urlError, setUrlError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit" && initialJob) {
      setCompany(initialJob.company);
      setPosition(initialJob.position);
      setStatus(initialJob.status);
      setApplicationDate(initialJob.applicationDate);
      setSalary(initialJob.salary);
      setRound(initialJob.round ?? "");
      setJobUrl(initialJob.jobUrl ?? "");
      setLocation(initialJob.location ?? "");
      setWorkMode(initialJob.workMode);
    } else {
      setCompany("");
      setPosition("");
      setStatus("Applied");
      setApplicationDate(new Date().toISOString().split("T")[0]);
      setSalary(undefined);
      setRound("");
      setJobUrl("");
      setLocation("");
      setWorkMode(undefined);
    }
    setUrlError(null);
  }, [mode, initialJob]);

  const isFormValid =
    company.trim() !== "" &&
    position.trim() !== "" &&
    status.trim() !== "" &&
    applicationDate.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const trimmedUrl = jobUrl.trim();
    let normalizedUrl: string | undefined;
    if (trimmedUrl !== "") {
      const safe = getSafeHttpUrl(trimmedUrl);
      if (!safe) {
        setUrlError(
          "Please enter a valid web link (e.g. https://linkedin.com/jobs/123)."
        );
        return;
      }
      normalizedUrl = safe;
    }

    setUrlError(null);

    const payload: JobApplication = {
      id: mode === "edit" && initialJob ? initialJob.id : Date.now().toString(),
      company: company.trim(),
      position: position.trim(),
      status: status as JobApplication["status"],
      applicationDate,
      salary,
      round: round.trim() === "" ? undefined : round.trim(),
      jobUrl: normalizedUrl,
      location: location.trim() === "" ? undefined : location.trim(),
      workMode,
      notes: initialJob?.notes,
      description: initialJob?.description,
      priority: initialJob?.priority,
      officeAddress: initialJob?.officeAddress,
      officeLat: initialJob?.officeLat,
      officeLng: initialJob?.officeLng,
      createdAt:
        mode === "edit" && initialJob ? initialJob.createdAt : undefined,
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
    <div data-testid="job-form-view" className="space-y-6">
      {/* Botón Volver a la Lista de Aplicaciones */}
      <div>
        <button
          type="button"
          onClick={onCancel}
          data-testid="back-to-applications-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30 transition-all cursor-pointer group"
        >
          <span
            className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          >
            arrow_back
          </span>
          <span>Back to Applications</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex items-center justify-center font-bold text-2xl text-on-surface shrink-0 shadow-[0_0_20px_rgba(129,140,248,0.15)]">
            <span
              className="material-symbols-outlined text-[28px] text-primary-container"
              aria-hidden="true"
            >
              {mode === "create" ? "add_circle" : "edit_document"}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                {mode === "create" ? "Log New Application" : "Edit Application"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container text-xs font-semibold border border-primary-container/30">
                {mode === "create" ? "Create Mode" : "Edit Mode"}
              </span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              {mode === "create"
                ? "Record a new job opportunity to track your pipeline progression."
                : `Update application details for ${initialJob?.company || "this position"}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Company Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company"
                  maxLength={30}
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline-variant"
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
                  maxLength={40}
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline-variant"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Estado y Etapas */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Application Status &amp; Stage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Current Status <span className="text-error">*</span>
                </label>
                <select
                  data-testid="status-select"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as JobApplication["status"])
                  }
                  required
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
                    className="w-full bg-surface-container-lowest text-on-surface text-sm pl-4 pr-11 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all [color-scheme:dark]"
                  />
                  <button
                    type="button"
                    onClick={handleOpenDatePicker}
                    className="absolute right-2.5 p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer flex items-center justify-center"
                    title="Open calendar picker"
                    aria-label="Open calendar picker"
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      aria-hidden="true"
                    >
                      calendar_month
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Compensación y Ronda */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Compensation &amp; Interview Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Compensation (Optional)
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

          {/* Sección 4: Ubicación, Modalidad y Link de la Vacante (Opcionales) */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-outline font-semibold mb-4">
              Location &amp; Job Link (Optional)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="job-location-input"
                  className="block text-xs font-semibold text-on-surface-variant mb-1.5"
                >
                  Location (Optional)
                </label>
                <input
                  id="job-location-input"
                  data-testid="job-location-input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Toronto, Canada or Bogotá, Colombia"
                  maxLength={100}
                  className="w-full bg-surface-container-lowest text-on-surface text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary-container/80 focus:outline-none transition-all placeholder:text-outline-variant"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Work Type (Optional)
                </span>
                <div
                  role="group"
                  aria-label="Work Type"
                  className="grid grid-cols-3 gap-2"
                >
                  {WORK_MODE_OPTIONS.map((option) => {
                    const isSelected = workMode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        data-testid={`work-mode-option-${option.value.toLowerCase()}`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setWorkMode(isSelected ? undefined : option.value)
                        }
                        className={`px-2.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-primary-container/20 border-primary-container text-primary shadow-xs"
                            : "bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[15px]"
                          aria-hidden="true"
                        >
                          {option.icon}
                        </span>
                        <span>{option.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="job-url-input"
                  className="block text-xs font-semibold text-on-surface-variant mb-1.5"
                >
                  Job Link (Optional)
                </label>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[17px] pointer-events-none"
                    aria-hidden="true"
                  >
                    link
                  </span>
                  <input
                    id="job-url-input"
                    data-testid="job-url-input"
                    type="text"
                    value={jobUrl}
                    onChange={(e) => {
                      setJobUrl(e.target.value);
                      if (urlError) setUrlError(null);
                    }}
                    placeholder="https://linkedin.com/jobs/view/..."
                    maxLength={500}
                    className={`w-full bg-surface-container-lowest text-on-surface text-sm pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none transition-all placeholder:text-outline-variant ${
                      urlError
                        ? "border-error focus:border-error"
                        : "border-outline-variant/40 focus:border-primary-container/80"
                    }`}
                  />
                </div>
                {urlError && (
                  <p
                    role="alert"
                    data-testid="job-url-error"
                    className="mt-1.5 text-xs text-error font-medium"
                  >
                    {urlError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de Acción: tamaños y proporciones armónicas */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-5 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer px-5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all duration-150 shadow-xs"
            >
              <span
                className="material-symbols-outlined text-[18px] text-outline"
                aria-hidden="true"
              >
                close
              </span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                aria-hidden="true"
              >
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
