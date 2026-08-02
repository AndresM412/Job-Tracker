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

  useEffect(() => {
    if (editingJob) {
      setCompany(editingJob.company);
      setPosition(editingJob.position);
      setStatus(editingJob.status);
      setApplicationDate(editingJob.applicationDate);
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
      };
      onAddJob(newJob);
    }

    setCompany("");
    setPosition("");
    setStatus("Applied");
    setApplicationDate("");
  }

  return (
    <>
      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
      />

      <input
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="Position"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as JobStatus)}
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
      />

      <button disabled={!isFormValid} onClick={handleSubmit}>
        {editingJob ? "Save Changes" : "Add Job"}
      </button>
    </>
  );
}

export default JobForm;