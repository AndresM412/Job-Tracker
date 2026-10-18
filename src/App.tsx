import { useState, useEffect } from "react";
import JobList from "./components/JobList";
import { type JobApplication } from "./types/job";
import JobForm from "./components/JobForm";
import StatsBanner from "./components/StatsBanner";
import FilterBar, { type FilterValue } from "./components/filters/FilterBar";
import SearchBar from "./components/filters/SearchBar";
import SortControl, { type SortOrder } from "./components/filters/SortControl";
import { AuthForm } from "./components/AuthForm";
import { LandingPage } from "./components/LandingPage";
import { NavigationTabs, type ActiveTab } from "./components/NavigationTabs";
import { CalendarPlaceholder } from "./components/CalendarPlaceholder";
import { TargetHubPlaceholder } from "./components/TargetHubPlaceholder";
import * as jobsApi from "./services/jobsApi";

type UnauthView = "landing" | "login" | "register";

function getUnauthViewFromPath(): UnauthView {
  const path = window.location.pathname;
  if (path === "/login") return "login";
  if (path === "/register") return "register";
  return "landing";
}

function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("job_tracker_token"),
  );
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    localStorage.getItem("job_tracker_user_email"),
  );

  const [unauthView, setUnauthView] = useState<UnauthView>(getUnauthViewFromPath);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [activeTab, setActiveTab] = useState<ActiveTab>("applications");

  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Escuchar navegación con flechas de atrás/adelante del navegador (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setUnauthView(getUnauthViewFromPath());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = (mode: "login" | "register" | "landing") => {
    const targetPath = mode === "landing" ? "/" : `/${mode}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, "", targetPath);
    }
    setUnauthView(mode);
  };

  useEffect(() => {
    if (!token) return;

    async function loadJobs() {
      try {
        setIsLoading(true);
        const data = await jobsApi.fetchJobs();
        setJobs(data);
        setError(null);
      } catch (err: any) {
        if (err?.message === "SESSION_EXPIRED") {
          handleLogout("Your session has expired due to inactivity. Please log in again.");
          return;
        }
        setError(
          "Failed to load applications. Is the server running?",
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
    setAuthNotice(null);
    if (window.location.pathname !== "/") {
      window.history.replaceState({}, "", "/");
    }
  };

  const handleLogout = (notice?: string) => {
    localStorage.removeItem("job_tracker_token");
    localStorage.removeItem("job_tracker_user_email");
    setToken(null);
    setUserEmail(null);
    setJobs([]);
    if (typeof notice === "string") {
      setAuthNotice(notice);
      if (window.location.pathname !== "/login") {
        window.history.replaceState({}, "", "/login");
      }
      setUnauthView("login");
    } else {
      setAuthNotice(null);
      if (window.location.pathname !== "/") {
        window.history.pushState({}, "", "/");
      }
      setUnauthView("landing");
    }
  };

  if (!token) {
    if (unauthView === "landing") {
      return <LandingPage onNavigateToAuth={navigateTo} />;
    }

    return (
      <AuthForm
        onSuccess={handleLoginSuccess}
        initialError={authNotice}
        initialMode={unauthView}
      />
    );
  }

  async function addJob(newJob: JobApplication) {
    try {
      const { id, ...jobData } = newJob;
      const createdJob = await jobsApi.createJob(jobData);
      setJobs((currentJobs) => [...currentJobs, createdJob]);
    } catch (err: any) {
      if (err?.message === "SESSION_EXPIRED") {
        handleLogout("Your session has expired due to inactivity. Please log in again.");
        return;
      }
      setError("Failed to create application.");
    }
  }

  async function deleteJob(id: string) {
    try {
      await jobsApi.deleteJob(id);
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
    } catch (err: any) {
      if (err?.message === "SESSION_EXPIRED") {
        handleLogout("Your session has expired due to inactivity. Please log in again.");
        return;
      }
      setError("Failed to delete application.");
    }
  }

  async function updateJob(updatedJob: JobApplication) {
    try {
      const savedJob = await jobsApi.updateJob(updatedJob);
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === savedJob.id ? savedJob : job)),
      );
      setEditingJob(null);
    } catch (err: any) {
      if (err?.message === "SESSION_EXPIRED") {
        handleLogout("Your session has expired due to inactivity. Please log in again.");
        return;
      }
      setError("Failed to update application.");
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
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Header con Info de Usuario, Pestañas de Navegación y Logout */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="h-16 max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high border border-outline-variant/50 flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.2)]">
              <span className="text-sm font-bold text-primary tracking-tighter">JT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-on-surface tracking-tight">Job Tracker</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-surface-variant text-on-surface-variant border border-outline-variant/40">
                Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center overflow-x-auto">
            <NavigationTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              applicationCount={jobs.length}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-low border border-outline-variant/30">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[14px]">person</span>
              </div>
              <span className="text-xs text-on-surface-variant hidden sm:inline-block max-w-[160px] truncate">
                {userEmail}
              </span>
            </div>

            <button
              onClick={() => handleLogout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low hover:bg-error-container/20 hover:border-error/40 text-on-surface-variant hover:text-error transition-all text-xs font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {error && (

            <div className="bg-error-container/20 border border-error/40 text-error text-sm rounded-xl p-3.5 mb-6">
              {error}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="flex flex-col w-full">
              <StatsBanner jobs={jobs} />

              <JobForm
                onAddJob={addJob}
                onUpdateJob={updateJob}
                editingJob={editingJob}
              />

              <div className="space-y-4 mb-6">
                <SearchBar value={searchText} onChange={setSearchText} />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <FilterBar
                    currentFilter={filterStatus}
                    onFilterChange={setFilterStatus}
                    jobs={jobs}
                  />
                  <SortControl value={sortOrder} onChange={setSortOrder} />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-16 text-on-surface-variant text-sm">
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
          )}

          {activeTab === "calendar" && <CalendarPlaceholder />}

          {activeTab === "companies" && <TargetHubPlaceholder />}
        </div>
      </main>
    </div>
  );
}

export default App;

