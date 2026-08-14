import { useState, useEffect } from "react";
import JobList from "./components/JobList";
import { type JobApplication } from "./types/job";
import JobForm from "./components/JobForm";
import FilterBar, { type FilterValue } from "./components/filters/FilterBar";
import SearchBar from "./components/filters/SearchBar";
import SortControl, { type SortOrder } from "./components/filters/SortControl";

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
    const savedJobs = localStorage.getItem("jobs");

    if (savedJobs) {
      return JSON.parse(savedJobs);
    }
    return [];
  });

  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

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
  const statusFiltered =
    filterStatus === "All"
      ? jobs
      : jobs.filter((job) => job.status === filterStatus);

  const searchFiltered = statusFiltered.filter((job) => {
    const query = searchText.toLowerCase();
    return (
      job.company.toLowerCase().includes(query) ||
      job.position.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query)
    );
  });

  const sortedJobs = [...searchFiltered].sort((a, b) => {
    const dateA = new Date(a.applicationDate).getTime();
    const dateB = new Date(b.applicationDate).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="min-h-screen bg-bg px-6 py-12 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-text mb-10 text-center">
        Job Tracker
      </h1>
      <JobForm
        onAddJob={addJob}
        onUpdateJob={updateJob}
        editingJob={editingJob}
      />
      <SearchBar value={searchText} onChange={setSearchText} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <FilterBar
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
        />
        <SortControl value={sortOrder} onChange={setSortOrder} />
      </div>

      <JobList jobs={sortedJobs} onDeleteJob={deleteJob} onEditJob={setEditingJob} />
    </div>
  );
}

export default App;
