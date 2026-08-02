import { useState, useEffect } from "react";
import JobList from "./components/JobList";
import { type JobApplication } from "./types/job";
import JobForm from "./components/JobForm";

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const savedJobs = localStorage.getItem("jobs");

    if (savedJobs) {
      return JSON.parse(savedJobs);
    }
    return [];
  });

  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  function addJob(newJob: JobApplication) {
    setJobs((currentJobs) => [...currentJobs, newJob]);
  }

  function deleteJob(id: string) {
    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
  }
  function updateJob(updatedJob: JobApplication) {
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );
    setEditingJob(null);
  }
  return (
    <div className="min-h-screen bg-bg px-6 py-12 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-text mb-10">
        Job Tracker
      </h1>
      <JobForm
        onAddJob={addJob}
        onUpdateJob={updateJob}
        editingJob={editingJob}
      />
      <JobList jobs={jobs} onDeleteJob={deleteJob} onEditJob={setEditingJob} />
    </div>
  );
}

export default App;
