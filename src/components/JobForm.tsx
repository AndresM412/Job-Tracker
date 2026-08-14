import { useState, useEffect } from "react";
import { type JobApplication, type JobStatus } from "../types/job";

type JobFormProps = {
  onAddJob: (job: JobApplication) => void;
  onUpdateJob: (job: JobApplication) => void;
  editingJob: JobApplication | null;
};

function JobForm({ onAddJob, onUpdateJob, editingJob }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingJob) {
      setCompany(editingJob.company);
      setPosition(editingJob.position);
      setStatus(editingJob.status);
      setApplicationDate(editingJob.applicationDate);
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
      // Modo edición: mantenemos el mismo id
      const updatedJob: JobApplication = {
        id: editingJob.id,
        company,
        position,
        status,
        applicationDate,
        notes: notes.trim() === "" ? undefined : notes,
      };
      onUpdateJob(updatedJob);
    } else {
      // Modo creación
      const newJob: JobApplication = {
        id: Date.now().toString(),
        company,
        position,
        status,
        applicationDate,
        notes: notes.trim() === "" ? undefined : notes,
      };
      onAddJob(newJob);
    }

    setCompany("");
    setPosition("");
    setStatus("Applied");
    setApplicationDate("");
    setNotes("");
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-5 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          maxLength={30}
          className="input-field"
        />

        <input
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Position"
          maxLength={30}
          className="input-field"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
          className="input-field"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input
          type="date"
          value={applicationDate}
          onChange={(e) => setApplicationDate(e.target.value)}
          className="input-field font-(--font-mono)"
        />
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional) — job link, description, or anything else"
        rows={3}
        className="input-field w-full mt-3 resize-none"
      />

      <button
        disabled={!isFormValid}
        onClick={handleSubmit}
        className="btn-submit mt-4"
      >
        {editingJob ? "Save Changes" : "Add Job"}
      </button>
    </div>
  );
}

export default JobForm;
