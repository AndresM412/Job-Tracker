import { useState, useEffect } from "react";
import JobList from "./components/JobList";
import JobTable from "./components/JobTable";
import Pagination from "./components/Pagination";
import { type JobApplication } from "./types/job";
import StatusDropdown, { type FilterValue } from "./components/filters/StatusDropdown";
import DateRangeDropdown, { type DateRange } from "./components/filters/DateRangeDropdown";
import SearchBar from "./components/filters/SearchBar";
import SortControl, { type SortOrder } from "./components/filters/SortControl";
import { AuthForm } from "./components/AuthForm";
import { LandingPage } from "./components/LandingPage";
import { Sidebar, type ActiveTab } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import JobModal from "./components/JobModal";
import JobFormModal from "./components/JobFormModal";
import JobDetailView from "./components/JobDetailView";
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
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    const saved = localStorage.getItem("job_tracker_view_mode");
    return saved === "table" ? "table" : "grid";
  });

  const handleViewModeChange = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("job_tracker_view_mode", mode);
  };
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedDashboardJob, setSelectedDashboardJob] = useState<JobApplication | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobApplication | null>(null);

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
      const { id: _id, ...jobData } = newJob;
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

  const dateFiltered = dateRange
    ? searchFiltered.filter((job) => {
        if (!job.applicationDate) return false;
        return (
          job.applicationDate >= dateRange.start &&
          job.applicationDate <= dateRange.end
        );
      })
    : searchFiltered;

  const sortedJobs = [...dateFiltered].sort((a, b) => {
    const dateA = new Date(a.applicationDate).getTime();
    const dateB = new Date(b.applicationDate).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const viewHeaders: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Dashboard Overview",
      subtitle: "Welcome back! Here's your high-level pipeline summary.",
    },
    applications: {
      title: "Applications",
      subtitle: "Manage, filter, and track your active job opportunities.",
    },
    tracker: {
      title: "Pipeline Tracker",
      subtitle: "Organize applications across your visual Kanban stages.",
    },
    calendar: {
      title: "Interview Calendar & Deadlines",
      subtitle: "Track upcoming technical loops, calls, and offer deadlines.",
    },
    companies: {
      title: "Target Companies",
      subtitle: "Curate your wishlist and research prospective companies.",
    },
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container flex">
      {/* Sidebar fija a la izquierda */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applicationCount={jobs.length}
        userEmail={userEmail || undefined}
        onLogout={() => handleLogout()}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Contenedor Principal (con padding izquierdo en desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Barra Superior del Contenido */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest/85 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined text-[20px] block">menu</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight truncate">
                  {viewHeaders[activeTab]?.title || "Command Center"}
                </h1>
                <p className="text-xs text-on-surface-variant hidden sm:block truncate">
                  {viewHeaders[activeTab]?.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {(activeTab === "applications" || activeTab === "dashboard") && (
                <button
                  type="button"
                  data-testid="open-add-job-modal-btn"
                  onClick={() => {
                    setEditingJob(null);
                    setIsFormModalOpen(true);
                  }}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(129,140,248,0.25)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">add_circle</span>
                  <span className="hidden sm:inline">Add Application</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Contenido Principal de las Vistas */}
        <main className="flex-1 w-full bg-surface">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {error && (
              <div className="bg-error-container/20 border border-error/40 text-error text-sm rounded-xl p-3.5 mb-6">
                {error}
              </div>
            )}

            {/* Vista 1: Dashboard Ejecutivo */}
            {activeTab === "dashboard" && (
              <DashboardView
                jobs={jobs}
                onNavigateToApplications={() => {
                  setActiveTab("applications");
                  setSelectedJobDetail(null);
                }}
                onNavigateToCalendar={() => setActiveTab("calendar")}
                onSelectJob={(job) => {
                  setActiveTab("applications");
                  setSelectedJobDetail(job);
                }}
                onAddNewJob={() => {
                  setEditingJob(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {/* Vista 2: Applications (Command Center Completo) */}
            {activeTab === "applications" && (
              selectedJobDetail ? (
                <JobDetailView
                  job={selectedJobDetail}
                  onBack={() => setSelectedJobDetail(null)}
                  onEdit={(job) => {
                    setEditingJob(job);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(job) => {
                    deleteJob(job.id);
                    setSelectedJobDetail(null);
                  }}
                />
              ) : (
                <div className="flex flex-col w-full">
                  {/* Single-row toolbar matching the mockup */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
                    <div className="flex-1 min-w-[240px]">
                      <SearchBar
                        value={searchText}
                        onChange={(text) => {
                          setSearchText(text);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <StatusDropdown
                        currentFilter={filterStatus}
                        onFilterChange={(filter) => {
                          setFilterStatus(filter);
                          setCurrentPage(1);
                        }}
                        jobs={jobs}
                      />

                      <DateRangeDropdown
                        dateRange={dateRange}
                        onDateRangeChange={(range) => {
                          setDateRange(range);
                          setCurrentPage(1);
                        }}
                      />

                      {/* Priority Filter Placeholder */}
                      <button
                        type="button"
                        disabled
                        title="Priority tags coming soon"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 bg-surface-container text-outline/60 cursor-not-allowed opacity-75"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-outline/40" />
                        <span>Priority</span>
                        <span className="material-symbols-outlined text-[16px] text-outline/50 pointer-events-none">
                          expand_more
                        </span>
                      </button>

                      <SortControl
                        value={sortOrder}
                        onChange={(order) => {
                          setSortOrder(order);
                          setCurrentPage(1);
                        }}
                      />
                      
                      <div
                        role="group"
                        aria-label="View layout mode"
                        className="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface-variant shrink-0"
                      >
                        <button
                          type="button"
                          data-testid="view-mode-grid"
                          onClick={() => handleViewModeChange("grid")}
                          aria-label="Cards view"
                          aria-pressed={viewMode === "grid"}
                          className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            viewMode === "grid"
                              ? "bg-surface-container-high text-primary-container shadow-xs"
                              : "text-outline hover:text-on-surface"
                          }`}
                          title="Cards view"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            grid_view
                          </span>
                        </button>
                        <button
                          type="button"
                          data-testid="view-mode-table"
                          onClick={() => handleViewModeChange("table")}
                          aria-label="Table view"
                          aria-pressed={viewMode === "table"}
                          className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            viewMode === "table"
                              ? "bg-surface-container-high text-primary-container shadow-xs"
                              : "text-outline hover:text-on-surface"
                          }`}
                          title="Table view"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            table_rows
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-16 text-on-surface-variant text-sm">
                      Loading applications...
                    </div>
                  ) : viewMode === "grid" ? (
                    <JobList
                      jobs={sortedJobs}
                      onDeleteJob={deleteJob}
                      onEditJob={(job) => {
                        setEditingJob(job);
                        setIsFormModalOpen(true);
                      }}
                      onViewDetails={(job) => setSelectedJobDetail(job)}
                    />
                  ) : (
                    <>
                      <JobTable
                        jobs={sortedJobs.slice((currentPage - 1) * 6, currentPage * 6)}
                        onDeleteJob={deleteJob}
                        onEditJob={(job) => {
                          setEditingJob(job);
                          setIsFormModalOpen(true);
                        }}
                        onViewDetails={(job) => setSelectedJobDetail(job)}
                      />
                      <Pagination
                        currentPage={currentPage}
                        totalItems={sortedJobs.length}
                        itemsPerPage={6}
                        onPageChange={setCurrentPage}
                      />
                    </>
                  )}
                </div>
              )
            )}

            {/* Vista 3: Tracker (Kanban Board) */}
            {activeTab === "tracker" && (
              <div className="text-center py-20 px-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary mx-auto mb-4">
                  <span className="material-symbols-outlined text-[28px]">view_kanban</span>
                </div>
                <h2 className="text-xl font-bold text-on-surface mb-2">Visual Kanban Pipeline</h2>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
                  Drag-and-drop opportunity board organized by stages (Saved, Applied, Interview, Offer, Rejected) is currently in development.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  View Applications Table
                </button>
              </div>
            )}

            {/* Vista 4: Calendar */}
            {activeTab === "calendar" && <CalendarPlaceholder />}

            {/* Vista 5: Target Companies */}
            {activeTab === "companies" && <TargetHubPlaceholder />}
          </div>
        </main>
      </div>

      {/* Modal para Crear y Editar Postulaciones */}
      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingJob(null);
        }}
        onAddJob={addJob}
        onUpdateJob={(updated) => {
          updateJob(updated);
          if (selectedJobDetail?.id === updated.id) {
            setSelectedJobDetail(updated);
          }
        }}
        editingJob={editingJob}
      />

      {/* Modal de detalle para vacantes inspeccionadas desde el Dashboard */}
      {selectedDashboardJob && (
        <JobModal
          job={selectedDashboardJob}
          onClose={() => setSelectedDashboardJob(null)}
        />
      )}
    </div>
  );
}

export default App;

