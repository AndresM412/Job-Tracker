import { useState, useEffect } from "react";
import JobList from "./components/JobList";
import { type JobApplication } from "./types/job";
import JobForm from "./components/JobForm";
import FilterBar, { type FilterValue } from "./components/filters/FilterBar";
import SearchBar from "./components/filters/SearchBar";
import SortControl, { type SortOrder } from "./components/filters/SortControl";
import { AuthForm } from "./components/AuthForm";
import * as jobsApi from "./services/jobsApi";

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("job_tracker_token"),
  );
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("job_tracker_user_email"),
  );

  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  useEffect(() => {
    if (!token) return;

    async function loadJobs() {
      try {
        setIsLoading(true);
        const data = await jobsApi.fetchJobs();
        setJobs(data);
        setError(null);
      } catch (err) {
        setError(
          "No se pudieron cargar las postulaciones. ¿Está el servidor corriendo?",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, [token]);

  const handleLoginSuccess = (newToken: string, email: string) => {
    localStorage.setItem("job_tracker_token", newToken);
    localStorage.setItem("job_tracker_user_email", email);
    setToken(newToken);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("job_tracker_token");
    localStorage.removeItem("job_tracker_user_email");
    setToken(null);
    setUserEmail(null);
    setJobs([]);
  };

  if (!token) {
    return <AuthForm onSuccess={handleLoginSuccess} />;
  }

  async function addJob(newJob: JobApplication) {
    try {
      const { id, ...jobData } = newJob;
      const createdJob = await jobsApi.createJob(jobData);
      setJobs((currentJobs) => [...currentJobs, createdJob]);
    } catch (err) {
      setError("No se pudo crear la postulación.");
    }
  }

  async function deleteJob(id: string) {
    try {
      await jobsApi.deleteJob(id);
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
    } catch (err) {
      setError("No se pudo eliminar la postulación.");
    }
  }

  async function updateJob(updatedJob: JobApplication) {
    try {
      const savedJob = await jobsApi.updateJob(updatedJob);
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === savedJob.id ? savedJob : job)),
      );
      setEditingJob(null);
    } catch (err) {
      setError("No se pudo actualizar la postulación.");
    }
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

  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-bg px-6 py-8 max-w-5xl mx-auto">
      {/* Header con Info de Usuario y Logout */}
      <header className="flex items-center justify-between pb-6 mb-8 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-text">
          Job Tracker
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-interview text-bg font-bold text-xs flex items-center justify-center">
              {userInitial}
            </div>
            <span className="text-xs text-text max-w-[150px] truncate">
              {userEmail}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-rejected/10 border border-rejected text-rejected text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

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

      {isLoading ? (
        <div className="text-center py-16 text-muted text-sm">
          Loading applications...
        </div>
      ) : (
        <JobList
          jobs={sortedJobs}
          onDeleteJob={deleteJob}
          onEditJob={setEditingJob}
        />
      )}
    </div>
  );
}

export default App;
