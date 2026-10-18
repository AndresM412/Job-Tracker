import { useState, useEffect } from "react";
import { type JobApplication } from "../types/job";
import SalaryRangeInput from "./SalaryRangeInput";

type JobFormProps = {
  onAddJob: (job: JobApplication) => void;
  onUpdateJob: (job: JobApplication) => void;
  editingJob: JobApplication | null;
};

function JobForm({ onAddJob, onUpdateJob, editingJob }: JobFormProps) {
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
    }
  }, [editingJob]);

  const isFormValid =
    company.trim() !== "" &&
    position.trim() !== "" &&
    status.trim() !== "" &&
    applicationDate.trim() !== "";

  function handleSubmit() {
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

    setCompany("");
    setPosition("");
    setStatus("");
    setApplicationDate("");
    setSalary(undefined);
    setRound("");
    setNotes("");
  }

  return (
    <section className="bg-surface-container-low/90 rounded-2xl p-5 mb-7 shadow-xl shadow-surface-container-lowest/50 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
          <h2 className="text-lg font-semibold text-on-surface tracking-tight">
            {editingJob ? "Edit Application" : "Stage New Application"}
          </h2>
        </div>
        <span className="text-xs text-on-surface-variant/70 tracking-wider font-medium">
          {editingJob ? "Editing record" : "* Company, position, status & date required"}
        </span>
      </div>

      <form
        className="space-y-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (isFormValid) handleSubmit();
        }}
      >
        {/* Main Input Grid (4 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              maxLength={30}
              required
              className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all"
            />
          </div>

          <div className="relative">
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Position"
              maxLength={30}
              required
              className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as JobApplication["status"])
              }
              className={`w-full bg-surface-container-lowest text-sm px-3.5 py-2.5 rounded-lg appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer ${
                status === "" ? "text-outline" : "text-on-surface"
              }`}
            >
              <option value="" disabled hidden>
                Select Status...
              </option>
              <option className="bg-surface-container-lowest text-tertiary" value="Applied">Applied</option>
              <option className="bg-surface-container-lowest text-primary" value="Interview">Interview</option>
              <option className="bg-surface-container-lowest text-secondary" value="Offer">Offer</option>
              <option className="bg-surface-container-lowest text-error" value="Rejected">Rejected</option>
            </select>
            <span className="material-symbols-outlined text-outline pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px]">
              expand_more
            </span>
          </div>

          <div className="relative">
            <input
              type="date"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              required
              className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:bg-surface-container transition-all"
            />
          </div>
        </div>

        {/* Unified Salary Range Popover + Round / Stage (2 clean columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SalaryRangeInput value={salary} onChange={setSalary} />

          <div className="relative">
            <input
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="Round / Stage (e.g. Round 2/4, optional)"
              maxLength={50}
              className="w-full bg-surface-container-lowest text-on-surface text-sm px-3.5 py-2.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all"
            />
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional) — job link, salary band, recruiter contact, or notes..."
            rows={3}
            className="w-full bg-surface-container-lowest text-on-surface text-sm p-3.5 rounded-lg placeholder:text-outline focus:outline-none focus:bg-surface-container transition-all resize-none"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            disabled={!isFormValid}
            className="px-5 py-2.5 bg-primary-container text-on-primary-container text-sm rounded-lg font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(129,140,248,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {editingJob ? "save" : "add_circle"}
            </span>
            <span>{editingJob ? "Save Changes" : "Add Job"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

export default JobForm;




