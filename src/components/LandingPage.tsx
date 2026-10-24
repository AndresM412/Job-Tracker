import React, { useState } from "react";
import StatsBanner from "./StatsBanner";
import JobList from "./JobList";
import SearchBar from "./filters/SearchBar";
import FilterBar, { type FilterValue } from "./filters/FilterBar";
import SortControl, { type SortOrder } from "./filters/SortControl";
import { type JobApplication } from "../types/job";

interface LandingPageProps {
  onNavigateToAuth: (mode: "login" | "register") => void;
}

const INITIAL_DEMO_JOBS: JobApplication[] = [
  {
    id: "demo-google",
    company: "Google",
    position: "Staff Frontend Engineer",
    status: "Interview",
    applicationDate: "2026-09-18",
    salary: "$180,000 - $210,000 USD",
    round: "Round 2 of 4",
    notes:
      "System design loop scheduled with Tech Lead. Focus on micro-frontends and real-time Core Web Vitals telemetry. https://careers.google.com",
  },
  {
    id: "demo-stripe",
    company: "Stripe",
    position: "Backend Infrastructure Lead",
    status: "Offer",
    applicationDate: "2026-09-20",
    salary: "$215,000 - $240,000 USD",
    round: "Decision Pending",
    notes:
      "Offer received: compensation package review deadline set for next Friday. Includes sign-on bonus & equity package. https://stripe.com/jobs",
  },
  {
    id: "demo-spotify",
    company: "Spotify",
    position: "Senior Fullstack Engineer",
    status: "Applied",
    applicationDate: "2026-09-22",
    salary: "€85,000 - €95,000 EUR",
    round: "Awaiting Recruiter Screen",
    notes:
      "Applied via internal referral from former VP of Eng. High-throughput audio playback and streaming services.",
  },
  {
    id: "demo-datadog",
    company: "Datadog",
    position: "QA Automation Engineer",
    status: "Rejected",
    applicationDate: "2026-09-15",
    salary: "$120,000 - $140,000 USD",
    round: "Archived",
    notes:
      "Position filled internally. Received strong feedback on Playwright architecture, POM pattern, and CI/CD test automation.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToAuth,
}) => {
  const [demoJobs, setDemoJobs] = useState<JobApplication[]>(INITIAL_DEMO_JOBS);
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const handleDeleteDemoJob = (id: string) => {
    setDemoJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleEditDemoJob = (job: JobApplication) => {
    setDemoNotice(
      `You clicked Edit on "${job.company}". In the full app, you can update status, rounds, notes, and salary ranges. Create a free account to track your real jobs!`
    );
  };

  const handleResetDemoJobs = () => {
    setDemoJobs(INITIAL_DEMO_JOBS);
    setFilterStatus("All");
    setSearchText("");
    setSortOrder("newest");
    setDemoNotice(null);
  };

  const filteredJobs = demoJobs.filter((job) => {
    const matchesFilter =
      filterStatus === "All" ? true : job.status === filterStatus;
    const matchesSearch =
      job.company.toLowerCase().includes(searchText.toLowerCase()) ||
      job.position.toLowerCase().includes(searchText.toLowerCase()) ||
      job.status.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === "newest") {
      return (
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
      );
    }
    return (
      new Date(a.applicationDate).getTime() -
      new Date(b.applicationDate).getTime()
    );
  });

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container/30 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Grids & Radial Glow */}
      <div className="fixed inset-0 grid-mesh pointer-events-none opacity-60 z-0" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(129, 140, 248, 0.16) 0%, rgba(78, 222, 163, 0.05) 30%, transparent 65%)",
        }}
      />

      {/* 1. Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface/85 border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant group-hover:border-primary-container/60 flex items-center justify-center shadow-[0_0_15px_rgba(129,140,248,0.2)] transition-all">
              <span className="font-mono text-sm font-bold text-primary-container">
                JT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-on-surface tracking-tight text-base">
                Job Tracker
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container text-primary-container border border-primary-container/30">
                v1.0
              </span>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-surface-container-lowest/80 border border-outline-variant/60">
            <a
              href="#demo"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
            >
              Live Demo
            </a>
            <a
              href="#comparison"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
            >
              Spreadsheet vs JT
            </a>
            <a
              href="#features"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
            >
              Features &amp; Roadmap
            </a>
            <a
              href="#workflow"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
            >
              Workflow
            </a>
          </nav>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="landing-login-btn"
              onClick={() => onNavigateToAuth("login")}
              className="text-xs font-medium text-on-surface-variant hover:text-white px-3.5 py-2 rounded-lg border border-transparent hover:border-outline-variant/60 transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              data-testid="landing-register-btn"
              onClick={() => onNavigateToAuth("register")}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary-container text-surface hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(129,140,248,0.4)] flex items-center gap-1.5 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28">
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 flex flex-col items-center text-center">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/60 shadow-sm transition-all mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="text-xs font-mono text-on-surface-variant">
              The focused workspace for your tech job search
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Ditch the spreadsheets.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-primary-container">
              Take command of your tech career.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-9">
            Track every application, interview round, salary offer, and
            recruiter note in one clean, distraction-free dashboard. Built for
            engineers and tech professionals.
          </p>

          {/* CTA Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-14">
            <button
              type="button"
              onClick={() => onNavigateToAuth("register")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary-container hover:bg-[#9da7ff] text-surface font-semibold text-sm transition-all shadow-[0_0_30px_rgba(129,140,248,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                add_task
              </span>
              <span>Start Tracking Free</span>
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant hover:border-neutral-400 text-on-surface text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                play_circle
              </span>
              <span>Explore Live Demo</span>
            </a>
          </div>

          {/* 3. Hero Product Demo: Real Applications Window Sandbox */}
          <div
            id="demo"
            className="w-full max-w-6xl rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-2xl p-4 sm:p-6 relative text-left"
          >
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/50 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="font-mono text-xs text-on-surface-variant/80 ml-2 hidden sm:inline">
                  app.jobtracker.dev / applications
                </span>
              </div>
              <div className="flex items-center gap-3">
                {demoJobs.length < INITIAL_DEMO_JOBS.length && (
                  <button
                    type="button"
                    onClick={handleResetDemoJobs}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/60 text-xs font-mono text-primary-container transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      restart_alt
                    </span>
                    <span>Reset Cards ({demoJobs.length}/4)</span>
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-[11px] font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                  Interactive Sandbox
                </span>
              </div>
            </div>

            {/* Notice for interactive actions in demo */}
            {demoNotice && (
              <div className="bg-primary-container/15 border border-primary-container/40 rounded-xl p-3.5 mb-5 flex items-start justify-between gap-3 text-xs text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">
                    info
                  </span>
                  <span>{demoNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToAuth("register")}
                  className="px-3 py-1 rounded bg-primary-container text-surface font-semibold text-xs shrink-0 cursor-pointer hover:brightness-110"
                >
                  Create Free Account
                </button>
              </div>
            )}

            {/* Exact StatsBanner Component from Applications */}
            <StatsBanner jobs={demoJobs} />

            {/* Filter and Search Controls (Exact layout from App.tsx) */}
            <div className="space-y-4 mb-6">
              <SearchBar value={searchText} onChange={setSearchText} />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <FilterBar
                  currentFilter={filterStatus}
                  onFilterChange={setFilterStatus}
                  jobs={demoJobs}
                />
                <SortControl value={sortOrder} onChange={setSortOrder} />
              </div>
            </div>

            {/* Exact JobList and JobItem Components from Applications */}
            <JobList
              jobs={sortedJobs}
              onDeleteJob={handleDeleteDemoJob}
              onEditJob={handleEditDemoJob}
            />

            {/* Sub-bar footer hint */}
            <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <span>
                  Tip: Click on any card to open detailed notes with clickable
                  links
                </span>
              </div>
              <div>Try deleting, searching, or filtering cards live</div>
            </div>
          </div>
        </section>

        {/* 4. Section 2: Before vs After (Spreadsheet vs Job Tracker) */}
        <section
          id="comparison"
          className="max-w-7xl mx-auto px-6 py-24 border-t border-outline-variant/40"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/30 text-error text-xs font-mono uppercase tracking-wider mb-3">
              Why Spreadsheets Fail Job Seekers
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Google Sheets wasn’t built for multi-stage interview loops.
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Static rows get messy fast. Broken links, forgotten follow-ups,
              untracked rounds, and zero clarity on your true conversion rate.
              Compare generic cells against a dedicated tracker.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Spreadsheet Trap (Left) */}
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/60 p-6 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-error text-[22px]">
                      table_rows
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        The Spreadsheet Trap
                      </h3>
                      <p className="text-xs text-on-surface-variant/70">
                        Unstructured, manual, zero proactive organization
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-error/10 text-error border border-error/30">
                    High Friction
                  </span>
                </div>

                {/* Native-style Excel mockup */}
                <div className="rounded-xl border border-slate-300 bg-white overflow-hidden mb-5 text-[11px] font-mono shadow-lg text-slate-800">
                  <div className="bg-[#0f9d58] px-3 py-2 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white text-[18px]">
                        table_chart
                      </span>
                      <span className="text-white font-medium text-xs truncate max-w-[200px] sm:max-w-none">
                        Job_Search_2026_FINAL_v3_copy.xlsx
                      </span>
                      <span className="material-symbols-outlined text-emerald-100 text-[14px]">
                        star
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-100">
                      <span className="material-symbols-outlined text-[12px]">
                        cloud_off
                      </span>
                      <span>Last edit 3 days ago</span>
                    </div>
                  </div>

                  <div className="bg-[#0b8043] px-3 py-1 flex items-center gap-3 text-[10px] text-emerald-100 overflow-x-auto">
                    <span className="hover:text-white cursor-pointer">File</span>
                    <span className="hover:text-white cursor-pointer">Edit</span>
                    <span className="hover:text-white cursor-pointer">View</span>
                    <span className="hover:text-white cursor-pointer">Insert</span>
                    <span className="hover:text-white cursor-pointer">Format</span>
                    <span className="hover:text-white cursor-pointer">Data</span>
                  </div>

                  <div className="bg-[#f8fafc] px-2.5 py-1.5 border-b border-slate-200 flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-bold text-[11px]">
                      B4
                    </span>
                    <span className="italic font-serif text-slate-400 font-bold text-xs select-none">
                      fx
                    </span>
                    <span className="text-[#0f172a] text-[11px] font-medium truncate">
                      =IF(B4="Ghosted?", "Follow up?", "???")
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse select-none bg-white">
                      <thead>
                        <tr className="bg-[#f1f5f9] text-slate-600 text-[10px] font-semibold border-b border-slate-200">
                          <th className="w-7 p-1 text-center border-r border-slate-200 text-slate-500 font-mono">
                            #
                          </th>
                          <th className="p-1.5 border-r border-slate-200 min-w-[85px]">
                            A: Company
                          </th>
                          <th className="p-1.5 border-r border-slate-200 min-w-[80px]">
                            B: Status
                          </th>
                          <th className="p-1.5 border-r border-slate-200 min-w-[130px]">
                            C: Interview Notes
                          </th>
                          <th className="p-1.5 border-r border-slate-200 min-w-[80px]">
                            D: Salary
                          </th>
                          <th className="p-1.5 min-w-[60px]">E: Link</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] text-slate-700 divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f1f5f9] border-r border-slate-200 text-slate-500 text-[10px]">
                            1
                          </td>
                          <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">
                            Google
                          </td>
                          <td className="p-1.5 border-r border-slate-200 bg-[#fef9c3] text-[#854d0e] font-medium">
                            Interview?
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-500 truncate max-w-[130px]">
                            System design loop...
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-600">
                            $220k?
                          </td>
                          <td className="p-1.5 text-blue-600 underline truncate max-w-[60px]">
                            careers...
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f1f5f9] border-r border-slate-200 text-slate-500 text-[10px]">
                            2
                          </td>
                          <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">
                            Datadog
                          </td>
                          <td className="p-1.5 border-r border-slate-200 bg-[#fee2e2] text-[#991b1b] font-medium">
                            Ghosted?
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-500 truncate max-w-[130px]">
                            Sent takehome 10 d...
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-500">
                            $130k maybe
                          </td>
                          <td className="p-1.5 text-slate-400 line-through">
                            404 error
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f1f5f9] border-r border-slate-200 text-slate-500 text-[10px]">
                            3
                          </td>
                          <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">
                            Globant
                          </td>
                          <td className="p-1.5 border-r border-slate-200 bg-[#fecaca] text-[#b91c1c] font-medium truncate max-w-[80px]">
                            DUE YESTERDAY!
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-600 truncate max-w-[130px]">
                            Takehome PR review
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-red-600 font-mono font-bold">
                            #REF!
                          </td>
                          <td className="p-1.5 text-blue-600 underline truncate max-w-[60px]">
                            takehome-
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f1f5f9] border-r border-slate-200 text-slate-500 text-[10px]">
                            4
                          </td>
                          <td className="p-1.5 border-r border-slate-200 font-semibold text-slate-900">
                            Stripe
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-600">
                            Applied
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-400 truncate max-w-[130px]">
                            Link expired in mail
                          </td>
                          <td className="p-1.5 border-r border-slate-200 text-slate-400">
                            N/A
                          </td>
                          <td className="p-1.5 text-slate-400">???</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#f8fafc] px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700 font-medium">
                      <span className="material-symbols-outlined text-amber-600 text-[13px]">
                        warning
                      </span>
                      <span>Sheet1 (Unsorted)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-mono">
                      <span className="text-red-600 font-medium">
                        Alerts Ignored
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-error text-[16px] shrink-0">
                    cancel
                  </span>
                  <span>
                    No automated status progression or conversion analytics.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-error text-[16px] shrink-0">
                    cancel
                  </span>
                  <span>
                    Broken links and lost compensation notes scattered across rows.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-error text-[16px] shrink-0">
                    cancel
                  </span>
                  <span>
                    Zero reminders or clear indicators of which round is next.
                  </span>
                </li>
              </ul>
            </div>

            {/* The Job Tracker Engine (Right) */}
            <div className="rounded-2xl bg-surface-container-low border border-primary-container/40 p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_50px_-10px_rgba(129,140,248,0.25)]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined text-[16px]">
                        terminal
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Job Tracker Control Room
                      </h3>
                      <p className="text-xs text-primary-container">
                        Clear, organized, and built for modern interview loops.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary-container/15 text-primary-container border border-primary-container/40 font-semibold">
                    Structured Workflow
                  </span>
                </div>

                {/* Structured Cards Preview */}
                <div className="space-y-3 mb-6">
                  {/* Stripe Offer */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-3.5 hover:border-secondary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-white text-sm">Stripe</h4>
                        <p className="text-xs text-on-surface-variant">
                          QA Automation Engineer
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-secondary/15 text-secondary border border-secondary/30 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Offer
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant mb-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        payments
                      </span>
                      <span className="text-white bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 font-semibold">
                        $130,000 - $150,000 USD
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant bg-surface-container p-2 rounded-lg border border-outline-variant/40 leading-relaxed font-sans">
                      Compensation package review &amp; sign-on bonus
                    </p>
                  </div>

                  {/* Google Interview */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-3.5 hover:border-primary-container/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-white text-sm">Google</h4>
                        <p className="text-xs text-on-surface-variant">
                          Frontend Engineer
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-primary-container/15 text-primary-container border border-primary-container/30 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                        Interview - Round 2
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant mb-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        payments
                      </span>
                      <span className="text-white bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 font-semibold">
                        $180,000 - $210,000 USD
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant bg-surface-container p-2 rounded-lg border border-outline-variant/40 leading-relaxed font-sans">
                      System design loop scheduled with Tech Lead
                    </p>
                  </div>

                  {/* Spotify Applied */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-3.5 hover:border-tertiary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-white text-sm">Spotify</h4>
                        <p className="text-xs text-on-surface-variant">
                          Backend Developer
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-tertiary/15 text-tertiary border border-tertiary/30 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                        Applied
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant mb-1.5">
                      <span className="material-symbols-outlined text-[14px]">
                        payments
                      </span>
                      <span className="text-white bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/50 font-semibold">
                        €85,000 - €95,000 EUR
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant bg-surface-container p-2 rounded-lg border border-outline-variant/40 leading-relaxed font-sans">
                      Awaiting initial recruiter screening call
                    </p>
                  </div>
                </div>
              </div>

              {/* Perks Checklist */}
              <ul className="space-y-3 text-xs text-on-surface">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">
                    check_circle
                  </span>
                  <span>
                    <strong>4 distinct stages:</strong> Applied, Interview,
                    Offer, and Rejected.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">
                    check_circle
                  </span>
                  <span>
                    <strong>Multi-currency salary ranges:</strong> Compare in
                    USD, EUR, and COP.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">
                    check_circle
                  </span>
                  <span>
                    <strong>Structured notes with clickable links:</strong> Save
                    job postings and recruiter emails effortlessly.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Section 3: Features & Roadmap */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-6 py-24 border-t border-outline-variant/40"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-primary-container">
                Platform Architecture
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
                Everything you need for your job hunt
              </h2>
            </div>
            <p className="text-on-surface-variant text-sm max-w-md">
              A focused core workspace today, with specialized career tools in
              active development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1: Available Now */}
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/60 p-6 hover:border-outline transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      view_kanban
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary/10 text-secondary border border-secondary/30 font-semibold">
                    Available Now
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Applications Command Center
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Organize applications across 4 stages. Record salary ranges,
                  interview rounds, recruiter notes, and real-time conversion
                  rates.
                </p>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-[11px] text-on-surface-variant space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-outline uppercase tracking-wider">
                  <span>Live Pipeline Telemetry</span>
                  <span className="text-secondary font-semibold">4 Active Stages</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                  <div className="bg-surface-container/60 rounded p-1.5">
                    <span className="block text-[10px] text-tertiary font-bold">Applied</span>
                    <span className="text-[11px] text-on-surface">25%</span>
                  </div>
                  <div className="bg-surface-container/60 rounded p-1.5">
                    <span className="block text-[10px] text-primary font-bold">Interview</span>
                    <span className="text-[11px] text-on-surface">25%</span>
                  </div>
                  <div className="bg-surface-container/60 rounded p-1.5">
                    <span className="block text-[10px] text-secondary font-bold">Offer</span>
                    <span className="text-[11px] text-on-surface">25%</span>
                  </div>
                  <div className="bg-surface-container/60 rounded p-1.5">
                    <span className="block text-[10px] text-error font-bold">Rejected</span>
                    <span className="text-[11px] text-on-surface">25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: Coming Soon */}
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/60 p-6 hover:border-outline transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      calendar_month
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface-variant border border-outline-variant/60 font-semibold">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Calendar &amp; Deadline Triage
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Visual schedule for upcoming technical loops, recruiter
                  screening calls, and take-home challenge deadlines.
                </p>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 font-mono text-[11px] text-on-surface-variant space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Next Due:</span>
                  <span className="text-error font-semibold">
                    Take-Home in 48h
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-outline">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span>Globant Architecture PR</span>
                </div>
              </div>
            </div>

            {/* Module 3: Coming Soon */}
            <div className="rounded-2xl bg-surface-container-low border border-outline-variant/60 p-6 hover:border-outline transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">
                      radar
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface-variant border border-outline-variant/60 font-semibold">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Target Radar &amp; Wishlist
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                  Curate your target companies, save referral contacts, and
                  bookmark pre-filtered career boards for fast daily sweeps.
                </p>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 font-mono text-[11px] text-on-surface-variant space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Pre-filtered Portals:</span>
                  <span className="text-primary-container font-semibold">
                    5 Synced
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-outline">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span>1-Click Morning Sweep</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section 4: Workflow (3 Simple Steps) */}
        <section
          id="workflow"
          className="max-w-7xl mx-auto px-6 py-24 border-t border-outline-variant/40"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-secondary">
              Workflow &amp; Protocol
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2 mb-4">
              A structured workflow from application to offer
            </h2>
            <p className="text-on-surface-variant text-sm">
              A simple, repeatable 3-step cycle to keep you organized across
              multiple simultaneous interview loops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 relative">
              <div className="text-4xl font-extrabold font-mono text-outline-variant mb-4">
                01
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <h3 className="text-lg font-bold text-white">
                  Log Your Applications
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Record company details, roles, application dates, and expected
                compensation ranges without table clutter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 relative">
              <div className="text-4xl font-extrabold font-mono text-outline-variant mb-4">
                02
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <h3 className="text-lg font-bold text-white">
                  Track Interview Rounds
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Keep interview loop notes, technical feedback, and take-home
                requirements organized in one place.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 relative">
              <div className="text-4xl font-extrabold font-mono text-outline-variant mb-4">
                03
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <h3 className="text-lg font-bold text-white">
                  Evaluate Offers &amp; Decide
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Compare base salary and total compensation packages side by side
                to negotiate with confidence.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Section 5: High-Impact Call to Action Banner */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-b from-surface-container to-surface-container-lowest border border-outline-variant/70 p-8 sm:p-14 relative overflow-hidden shadow-2xl text-center">
            {/* Smooth Radial Glow (0% CPU Lag) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(129,140,248,0.12), transparent 70%)",
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant mx-auto flex items-center justify-center text-primary-container mb-6 shadow-[0_0_30px_rgba(129,140,248,0.25)]">
                <span className="material-symbols-outlined text-[26px]">
                  rocket_launch
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Ready to upgrade from messy spreadsheets?
              </h2>

              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-8">
                Start organizing your job applications today. 100% free forever
                for individual developers and job seekers. No credit card
                required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  data-testid="cta-register-btn"
                  onClick={() => onNavigateToAuth("register")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-container text-surface font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(129,140,248,0.4)] cursor-pointer"
                >
                  Create Free Account
                </button>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant text-on-surface hover:text-white text-sm font-medium transition-colors"
                >
                  Explore Live Demo
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-[14px]">
                    lock
                  </span>
                  <span>100% Private &amp; Isolated Data</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary-container text-[14px]">
                    bolt
                  </span>
                  <span>Fast, Lightweight &amp; Distraction-Free</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[14px]">
                    check_circle
                  </span>
                  <span>Free for Individual Job Seekers</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="w-full border-t border-outline-variant/40 bg-surface-container-lowest/80 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center font-mono text-xs font-bold text-primary-container">
              JT
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              Job Tracker
            </span>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-2 text-xs font-mono text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>v1.0 • Stable</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-on-surface-variant">
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60">
              React 19
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60">
              TypeScript
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60">
              FastAPI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60">
              PostgreSQL
            </span>
            <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60">
              Playwright
            </span>
            <a
              href="https://github.com/AndresM412/Job-Tracker"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/60 hover:border-primary-container/60 hover:text-white transition-all flex items-center gap-1 text-primary-container"
            >
              <span className="material-symbols-outlined text-[13px]">
                code
              </span>
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-6 pt-6 border-t border-outline-variant/30 text-center text-xs font-mono text-outline">
          © 2026 Job Tracker. Built for developers and tech professionals.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
