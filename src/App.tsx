import { useState, useEffect } from "react";
import JobList from "./components/applications/JobList";
import JobTable from "./components/applications/JobTable";
import Pagination from "./components/applications/Pagination";
import { type JobApplication } from "./types/job";
import StatusDropdown, { type FilterValue } from "./components/applications/filters/StatusDropdown";
import PriorityDropdown, { type PriorityFilterValue } from "./components/applications/filters/PriorityDropdown";
import LocationFilterDropdown, { type WorkModeFilterValue } from "./components/applications/filters/LocationFilterDropdown";
import DateRangeDropdown, { type DateRange } from "./components/applications/filters/DateRangeDropdown";
import SearchBar from "./components/applications/filters/SearchBar";
import SortControl, { type SortOrder } from "./components/applications/filters/SortControl";
import { AuthView } from "./components/auth/AuthView";
import { LandingView } from "./components/landing/LandingView";
import { Sidebar, type ActiveTab } from "./components/dashboard/Sidebar";
import { DashboardView } from "./components/dashboard/DashboardView";
import JobFormView from "./components/applications/JobFormView";
import JobDetailView from "./components/applications/JobDetailView";
import { CalendarPlaceholderView } from "./components/placeholders/CalendarPlaceholderView";
import { TargetHubPlaceholderView } from "./components/placeholders/TargetHubPlaceholderView";
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

  interface FormState {
    mode: "create" | "edit";
    job?: JobApplication | null;
    returnTo: "list" | "detail";
  }
  const [formState, setFormState] = useState<FormState | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [filterPriority, setFilterPriority] = useState<PriorityFilterValue>("All");
  const [filterWorkMode, setFilterWorkMode] = useState<WorkModeFilterValue>("All");
  const [filterLocation, setFilterLocation] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recently_added");
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("jobtracker_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jobtracker_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };
  // unified full-screen form state used via formState
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
      return <LandingView onNavigateToAuth={navigateTo} />;
    }

    return (
      <AuthView
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
      setJobs((currentJobs) => [createdJob, ...currentJobs]);
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
      return savedJob;
    } catch (err: any) {
      if (err?.message === "SESSION_EXPIRED") {
        handleLogout("Your session has expired due to inactivity. Please log in again.");
        return;
      }
      setError("Failed to update application.");
    }
  }

  async function handlePriorityChange(jobId: string, nextPriority: number) {
    const previousJob = jobs.find((j) => j.id === jobId);
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId ? { ...job, priority: nextPriority } : job
      )
    );
    try {
      const savedJob = await jobsApi.patchJob(jobId, { priority: nextPriority });
      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === savedJob.id ? savedJob : job))
      );
    } catch (err: any) {
      if (previousJob) {
        setJobs((currentJobs) =>
          currentJobs.map((job) => (job.id === jobId ? previousJob : job))
        );
      }
      if (err?.message === "SESSION_EXPIRED") {
        handleLogout("Your session has expired due to inactivity. Please log in again.");
        return;
      }
      setError("Failed to update application priority.");
    }
  }

  const statusFiltered =
    filterStatus === "All"
      ? jobs
      : jobs.filter((job) => job.status === filterStatus);

  const priorityFiltered =
    filterPriority === "All"
      ? statusFiltered
      : statusFiltered.filter((job) => (job.priority ?? 0) === filterPriority);

  const locationQuery = filterLocation.trim().toLowerCase();
  const locationModeFiltered = priorityFiltered.filter((job) => {
    const matchesMode =
      filterWorkMode === "All" || job.workMode === filterWorkMode;
    const matchesLocation =
      !locationQuery ||
      (job.location || "").toLowerCase().includes(locationQuery);
    return matchesMode && matchesLocation;
  });

  const searchFiltered = locationModeFiltered.filter((job) => {
    const query = searchText.toLowerCase();
    return (
      job.company.toLowerCase().includes(query) ||
      job.position.toLowerCase().includes(query) ||
      job.status.toLowerCase().includes(query) ||
      (job.location || "").toLowerCase().includes(query)
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
    if (sortOrder === "recently_added") {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    }
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
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedJobDetail(null);
          setFormState(null);
        }}
        applicationCount={jobs.length}
        userEmail={userEmail || undefined}
        onLogout={() => handleLogout()}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Contenedor Principal (con padding izquierdo en desktop adaptado al estado colapsado/expandido del sidebar) */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-[padding-left] duration-200 ease-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Barra Superior del Contenido (oculta en vista detalle para aprovechar toda la pantalla sin scroll) */}
        {!selectedJobDetail && (
          <header className="sticky top-0 z-30 bg-surface-container-lowest/85 backdrop-blur-xl border-b border-outline-variant/30 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
                  aria-label="Open navigation menu"
                >
                  <span className="material-symbols-outlined text-[20px] block" aria-hidden="true">menu</span>
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
                {(activeTab === "applications" || activeTab === "dashboard") && !selectedJobDetail && !formState && (
                  <button
                    type="button"
                    data-testid="open-add-job-modal-btn"
                    aria-label="Add Application"
                    onClick={() => {
                      setActiveTab("applications");
                      setSelectedJobDetail(null);
                      setFormState({ mode: "create", returnTo: "list" });
                    }}
                    className="cursor-pointer px-3.5 sm:px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 shadow-[0_0_12px_rgba(129,140,248,0.25)] hover:bg-[#e0e0ff] hover:shadow-[0_0_18px_rgba(189,194,255,0.55)] active:scale-95 transition-all duration-150"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_circle</span>
                    <span className="hidden sm:inline">Add Application</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Contenido Principal de las Vistas (con soporte elástico para pantallas grandes y portátiles) */}
        <main className="flex-1 w-full bg-surface flex flex-col min-h-0">
          <div
            className={`max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 ${
              selectedJobDetail ? "px-4 sm:px-6 py-2 sm:py-2.5" : "px-6 py-6"
            }`}
          >
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
                  setActiveTab("applications");
                  setSelectedJobDetail(null);
                  setFormState({ mode: "create", returnTo: "list" });
                }}
              />
            )}

            {/* Vista 2: Applications (Command Center Completo) */}
            {activeTab === "applications" && (
              formState ? (
                <JobFormView
                  mode={formState.mode}
                  initialJob={formState.job}
                  onSave={async (jobPayload) => {
                    if (formState.mode === "edit") {
                      const updated = await updateJob(jobPayload);
                      if (formState.returnTo === "detail" && updated) {
                        setSelectedJobDetail(updated);
                      } else {
                        setSelectedJobDetail(null);
                      }
                    } else {
                      await addJob(jobPayload);
                      setSelectedJobDetail(null);
                    }
                    setFormState(null);
                  }}
                  onCancel={() => {
                    if (formState.returnTo === "detail" && formState.job) {
                      setSelectedJobDetail(formState.job);
                    }
                    setFormState(null);
                  }}
                />
              ) : selectedJobDetail ? (
                <JobDetailView
                  job={selectedJobDetail}
                  onBack={() => setSelectedJobDetail(null)}
                  onEdit={(job) => {
                    setFormState({ mode: "edit", job, returnTo: "detail" });
                  }}
                  onDelete={(job) => {
                    deleteJob(job.id);
                    setSelectedJobDetail(null);
                  }}
                  onJobUpdated={(updated) => {
                    setSelectedJobDetail(updated);
                    setJobs((prev) =>
                      prev.map((j) => (j.id === updated.id ? updated : j))
                    );
                  }}
                />
              ) : (
                <div className="flex flex-col w-full">
                  {/* Responsive toolbar: wraps cleanly below 1280px without crowding */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6">
                    <div className="w-full xl:flex-1 min-w-0">
                      <SearchBar
                        value={searchText}
                        onChange={(text) => {
                          setSearchText(text);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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

                      <PriorityDropdown
                        currentFilter={filterPriority}
                        onFilterChange={(priority) => {
                          setFilterPriority(priority);
                          setCurrentPage(1);
                        }}
                        jobs={jobs}
                      />

                      <LocationFilterDropdown
                        workModeFilter={filterWorkMode}
                        locationFilter={filterLocation}
                        onWorkModeChange={(mode) => {
                          setFilterWorkMode(mode);
                          setCurrentPage(1);
                        }}
                        onLocationChange={(loc) => {
                          setFilterLocation(loc);
                          setCurrentPage(1);
                        }}
                        jobs={jobs}
                      />

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
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={`initial-skeleton-${idx}`}
                            className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 animate-pulse flex flex-col justify-between h-52"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="h-5 w-32 bg-surface-container-highest rounded-md" />
                                <div className="h-5 w-20 bg-surface-container-highest rounded-full" />
                              </div>
                              <div className="h-4 w-44 bg-surface-container-highest/60 rounded" />
                              <div className="flex gap-2 pt-1">
                                <div className="h-4 w-16 bg-surface-container-highest/40 rounded-full" />
                                <div className="h-4 w-20 bg-surface-container-highest/40 rounded-full" />
                              </div>
                            </div>
                            <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between">
                              <div className="h-3.5 w-24 bg-surface-container-highest/40 rounded" />
                              <div className="h-4 w-16 bg-surface-container-highest/50 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 animate-pulse space-y-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={`table-skeleton-${idx}`}
                            className="h-10 bg-surface-container-highest/40 rounded-lg"
                          />
                        ))}
                      </div>
                    )
                  ) : viewMode === "grid" ? (
                    <JobList
                      jobs={sortedJobs}
                      onDeleteJob={deleteJob}
                      onEditJob={(job) => {
                        setFormState({ mode: "edit", job, returnTo: "list" });
                      }}
                      onViewDetails={(job) => {
                        setFormState(null);
                        setSelectedJobDetail(job);
                      }}
                      onPriorityChange={handlePriorityChange}
                    />
                  ) : (
                    <>
                      <JobTable
                        jobs={sortedJobs.slice((currentPage - 1) * 6, currentPage * 6)}
                        onDeleteJob={deleteJob}
                        onEditJob={(job) => {
                          setFormState({ mode: "edit", job, returnTo: "list" });
                        }}
                        onViewDetails={(job) => {
                          setFormState(null);
                          setSelectedJobDetail(job);
                        }}
                        onPriorityChange={handlePriorityChange}
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
            {activeTab === "calendar" && <CalendarPlaceholderView />}

            {/* Vista 5: Target Companies */}
            {activeTab === "companies" && <TargetHubPlaceholderView />}
          </div>
        </main>
      </div>


    </div>
  );
}

export default App;

