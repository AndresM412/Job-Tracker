import { useState } from "react";
import { type JobApplication, type JobStatus } from "../types/job";

type JobFormProps = {
  onAddJob: (job: JobApplication) => void;
};

function JobForm({ onAddJob }: JobFormProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const isFormValid =
    company.trim() !== "" &&
    position.trim() !== "" &&
    status.trim() !== "" &&
    applicationDate.trim() !== "";

  function handleSubmit() {
    const newJob: JobApplication = {
      id: Date.now().toString(),
      company,
      position,
      status,
      applicationDate,
    };

    onAddJob(newJob);

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
        Add Job
      </button>
    </>
  );
}

export default JobForm;
