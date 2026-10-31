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

export type LandingTab = "overview" | "sandbox" | "workflow";

const INITIAL_DEMO_JOBS: JobApplication[] = [
  {
    id: "demo-google",
    company: "Google",
    position: "Senior Frontend Engineer",
    status: "Interview",
    applicationDate: "2026-09-18",
    salary: "$180,000 - $210,000 USD",
    round: "Round 2 of 4",
    notes:
      "Technical loop scheduled with Team Lead. Focus on state management, component architecture, and web performance. https://careers.google.com",
  },
  {
    id: "demo-stripe",
    company: "Stripe",
    position: "Operations Analyst",
    status: "Offer",
    applicationDate: "2026-09-20",
    salary: "$95,000 - $110,000 USD",
    round: "Decision Pending",
    notes:
      "Compensation review deadline next Friday. Includes performance bonus and remote work stipend. https://stripe.com/jobs",
  },
  {
    id: "demo-spotify",
    company: "Spotify",
    position: "Product Designer",
    status: "Applied",
    applicationDate: "2026-09-22",
    salary: "€65,000 - €75,000 EUR",
    round: "Awaiting Recruiter Screen",
    notes:
      "Applied via employee referral from UX Lead. Sent updated portfolio link. https://spotify.com/careers",
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
  const [activeTab, setActiveTab] = useState<LandingTab>("overview");
  const [demoJobs, setDemoJobs] = useState<JobApplication[]>(INITIAL_DEMO_JOBS);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterValue>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const handleDeleteDemoJob = (id: string) => {
    setDemoJobs((prev) => prev.filter((j) => j.id !== id));
    setDemoNotice(
      "Sample job removed from live sandbox. Click 'Reset Sample Data' anytime to restore."
    );
  };

  const handleEditDemoJob = (job: JobApplication) => {
    setDemoNotice(
      `You clicked Edit on "${job.company}". In your personal account, you can update status, interview rounds, notes, and salary ranges. Create a free account to track your real applications!`
    );
  };

  const handleResetDemoJobs = () => {
    setDemoJobs(INITIAL_DEMO_JOBS);
    setDemoNotice("Demo jobs restored to default state.");
  };

  // Filter demo jobs based on search query and status tab
  const filteredJobs = demoJobs.filter((job) => {
    const matchesStatus =
      filterStatus === "All" || job.status === filterStatus;
    const matchesSearch =
      job.company.toLowerCase().includes(searchText.toLowerCase()) ||
      job.position.toLowerCase().includes(searchText.toLowerCase()) ||
      (job.notes &&
        job.notes.toLowerCase().includes(searchText.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Sort demo jobs by application date
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
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container/30 selection:text-white relative overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Background Grids & Radial Glow */}
      <div className="fixed inset-0 grid-mesh pointer-events-none opacity-60 z-0" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(129, 140, 248, 0.16) 0%, rgba(78, 222, 163, 0.05) 30%, transparent 65%)",
        }}
      />

      {/* 1. Sticky Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-surface/85 border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("overview");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
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
          </button>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-surface-container-lowest/80 border border-outline-variant/60 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-primary-container text-surface font-semibold shadow-[0_0_15px_rgba(129,140,248,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-container"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("sandbox");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "sandbox"
                  ? "bg-primary-container text-surface font-semibold shadow-[0_0_15px_rgba(129,140,248,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-container"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span>Live Sandbox</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("workflow");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "workflow"
                  ? "bg-primary-container text-surface font-semibold shadow-[0_0_15px_rgba(129,140,248,0.35)]"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-container"
              }`}
            >
              How It Works
            </button>
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

      {/* 2. Main Content Area (Changes depending on Active Tab) */}
      <main className="relative z-10 pt-24 pb-16 flex-1 max-w-7xl mx-auto px-6 w-full">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW (WELCOME & VALUE PROPOSITION)             */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <section className="flex flex-col items-center text-center animate-fadeIn">
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/60 shadow-sm transition-all mb-8 mt-6">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="text-xs font-mono text-on-surface-variant">
                JT // Personal Career &amp; Application Workspace
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
              The focused workspace to
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-primary-container">
                organize your job applications.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-10">
              Keep complete order of your active applications, target companies,
              interview rounds, and critical deadlines — all in one clean place.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
              <button
                type="button"
                onClick={() => onNavigateToAuth("register")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary-container hover:bg-[#9da7ff] text-surface font-semibold text-sm transition-all shadow-[0_0_30px_rgba(129,140,248,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  rocket_launch
                </span>
                <span>Start Tracking Free</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("sandbox");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-surface-container border border-outline-variant hover:border-neutral-400 text-on-surface text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  play_circle
                </span>
                <span>Try Live Sandbox</span>
              </button>
            </div>

            {/* Section Divider 1 */}
            <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-outline-variant/60 to-transparent my-16" />

            {/* ========================================================= */}
            {/* THE FRICTION / REAL SPREADSHEET PROBLEM                   */}
            {/* ========================================================= */}
            <div className="w-full max-w-6xl text-left mb-20">
              <div className="max-w-3xl mb-8">
                <div className="text-xs font-mono uppercase tracking-wider text-error/90 font-semibold mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error" />
                  <span>The Problem</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  The Friction of Traditional Tracking
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Why generic spreadsheets and scattered notes slow you down when managing multiple opportunities.
                </p>
              </div>

              {/* 2-Column Layout: Pain Points + Clean Native Spreadsheet */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: 3 Concrete Pain Points */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 p-5 hover:border-error/40 transition-colors">
                    <div className="flex items-center gap-2.5 text-error font-semibold text-sm mb-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        table_rows
                      </span>
                      <span>Cut-off notes &amp; rigid rows</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Cells in spreadsheets aren&apos;t built for interview debriefs, recruiter tips, or salary nuances.
                      Rows stretch awkwardly and critical details get truncated.
                    </p>
                  </div>

                  <div className="rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 p-5 hover:border-error/40 transition-colors">
                    <div className="flex items-center gap-2.5 text-error font-semibold text-sm mb-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        alarm_off
                      </span>
                      <span>Lost deadlines &amp; missed rounds</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Static cells don&apos;t remind you when a take-home assessment is due, nor do they clearly indicate what round you are currently preparing for.
                    </p>
                  </div>

                  <div className="rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 p-5 hover:border-error/40 transition-colors">
                    <div className="flex items-center gap-2.5 text-error font-semibold text-sm mb-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        link_off
                      </span>
                      <span>Expired links &amp; lost context</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      When companies unpublish their job listings, saved URLs break. Without dedicated tracking, original job requirements and salary expectations are lost.
                    </p>
                  </div>
                </div>

                {/* Right Column: Native Spreadsheet UI (Strictly Job Tracker Command Center Fields) */}
                <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-700/80 bg-white shadow-2xl font-sans text-[#1f1f1f]">
                  {/* Spreadsheet Chrome Window Header */}
                  <div className="bg-[#f0f4f9] px-4 py-2 flex items-center justify-between border-b border-[#dadce0] text-xs select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 mr-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ea4335]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fbbc05]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34a853]" />
                      </div>
                      <span className="font-semibold text-xs text-[#1f1f1f]">
                        Job_Applications_Tracking.xlsx
                      </span>
                      <span className="text-[10px] text-[#5f6368] font-mono ml-2">
                        — Manual Entry
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      <span>Unsorted Rows</span>
                    </div>
                  </div>

                  {/* Formula / Name Box Bar */}
                  <div className="bg-white px-3 py-1.5 flex items-center gap-2 border-b border-[#dadce0] text-xs select-none">
                    <div className="w-10 text-center py-0.5 border border-[#dadce0] rounded bg-[#f8f9fa] font-mono text-[11px] text-[#1f1f1f]">
                      A2
                    </div>
                    <span className="italic font-serif text-[#70757a] text-xs font-bold select-none px-1">
                      fx
                    </span>
                    <span className="text-[#1f1f1f] text-[11px] font-sans truncate font-medium">
                      Google
                    </span>
                  </div>

                  {/* Spreadsheet Grid Table */}
                  <div className="overflow-x-auto max-h-[340px]">
                    <table className="w-full text-left border-collapse select-none bg-white text-[11px]">
                      <thead>
                        {/* Letter Header Row (A through G) */}
                        <tr className="bg-[#f8f9fa] text-[#5f6368] text-[10px] font-semibold border-b border-[#c0c0c0]">
                          <th className="w-8 p-1 text-center border-r border-[#c0c0c0] bg-[#f8f9fa] font-mono"></th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[100px]">A</th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[140px]">B</th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[85px]">C</th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[105px]">D</th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[120px]">E</th>
                          <th className="p-1 border-r border-[#c0c0c0] text-center min-w-[135px]">F</th>
                          <th className="p-1 border-[#c0c0c0] text-center min-w-[180px]">G</th>
                        </tr>

                        {/* Row 1: Google Sheets Blue Header Row with EXACT Job Tracker Fields */}
                        <tr className="bg-[#1a73e8] text-white font-semibold text-[11px] border-b border-[#c0c0c0]">
                          <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                            1
                          </td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Company</td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Position</td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Status</td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Application Date</td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Round / Stage</td>
                          <td className="p-1.5 border-r border-[#93c5fd]/40">Salary Range</td>
                          <td className="p-1.5">Notes</td>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#c0c0c0] text-[11px] text-slate-800">
                        {/* Row 2: Google */}
                        <tr className="bg-white hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                            2
                          </td>
                          <td className="p-1.5 border-r border-[#c0c0c0] font-semibold text-slate-900">Google</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">Staff Frontend Engineer</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] bg-amber-50 text-amber-800 font-medium">Interview</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">2026-09-18</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-amber-900 font-medium">Round 2 of 4</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-slate-700">$180,000 - $210,000 USD</td>
                          <td className="p-1.5 text-slate-500 truncate max-w-[180px]">
                            System design loop with Tech Lead...
                          </td>
                        </tr>

                        {/* Row 3: Stripe (Soft Blue Zebra Stripe) */}
                        <tr className="bg-[#f0f4f9] hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                            3
                          </td>
                          <td className="p-1.5 border-r border-[#c0c0c0] font-semibold text-slate-900">Stripe</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">Operations Analyst</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] bg-emerald-50 text-emerald-800 font-medium">Offer</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">2026-09-20</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-emerald-900 font-medium">Decision Pending</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-slate-700">$95,000 - $110,000 USD</td>
                          <td className="p-1.5 text-slate-500 truncate max-w-[180px]">
                            Compensation review deadline next Friday
                          </td>
                        </tr>

                        {/* Row 4: Spotify */}
                        <tr className="bg-white hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                            4
                          </td>
                          <td className="p-1.5 border-r border-[#c0c0c0] font-semibold text-slate-900">Spotify</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">Product Designer</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] bg-blue-50 text-blue-800 font-medium">Applied</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">2026-09-22</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-slate-600">Awaiting Recruiter Screen</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-slate-700">€65,000 - €75,000 EUR</td>
                          <td className="p-1.5 text-slate-500 truncate max-w-[180px]">
                            Applied via referral, portfolio link sent
                          </td>
                        </tr>

                        {/* Row 5: Datadog (Friction example) */}
                        <tr className="bg-[#f0f4f9] hover:bg-slate-50">
                          <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                            5
                          </td>
                          <td className="p-1.5 border-r border-[#c0c0c0] font-semibold text-slate-900">Datadog</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">QA Automation Engineer</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] bg-red-50 text-red-800 font-medium">Rejected</td>
                          <td className="p-1.5 border-r border-[#c0c0c0]">2026-09-15</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-red-700 font-bold bg-red-100/50">Take-home expired</td>
                          <td className="p-1.5 border-r border-[#c0c0c0] text-red-600 font-mono font-bold">#REF!</td>
                          <td className="p-1.5 text-slate-400 truncate max-w-[180px]">
                            Missed 48h take-home test deadline
                          </td>
                        </tr>

                        {/* Empty Zebra Rows */}
                        {[6, 7, 8, 9, 10].map((rowNum) => (
                          <tr
                            key={rowNum}
                            className={rowNum % 2 === 0 ? "bg-white" : "bg-[#f0f4f9]"}
                          >
                            <td className="p-1 text-center bg-[#f8f9fa] border-r border-[#c0c0c0] text-[#70757a] text-[10px] font-mono">
                              {rowNum}
                            </td>
                            {Array.from({ length: 7 }).map((_, i) => (
                              <td
                                key={i}
                                className={`p-1.5 ${i < 6 ? "border-r border-[#c0c0c0]" : ""}`}
                              >
                                &nbsp;
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sheet Tab Bar Footer */}
                  <div className="bg-[#f0f4f9] px-3 py-1.5 flex items-center justify-between border-t border-[#dadce0] text-xs select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-sm font-bold cursor-default select-none">
                        +
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 text-xs cursor-default select-none">
                        ≡
                      </div>
                      <div className="bg-white px-3 py-1 rounded-t border-t-2 border-t-[#1a73e8] border-x border-[#dadce0] font-medium text-[11px] text-[#1f1f1f] shadow-sm flex items-center gap-1">
                        <span>Applications</span>
                        <span className="text-[9px] text-slate-400">▾</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      100%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Divider 2 */}
            <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-outline-variant/60 to-transparent my-16" />

            {/* ========================================================= */}
            {/* EXPLORE & EXPERIENCE HUB (BRIDGING TO SANDBOX & WORKFLOW) */}
            {/* ========================================================= */}
            <div className="w-full max-w-5xl text-left mb-16">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="text-xs font-mono uppercase tracking-wider text-primary-container font-semibold mb-2 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                  <span>Explore Job Tracker</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Experience the difference
                </h2>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  Choose how you want to discover Job Tracker: test the live interactive workspace right now, or walk through our 4-step tracking methodology.
                </p>
              </div>

              {/* 2 Interactive Navigation Pathways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pathway 1: Jump to Live Sandbox */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("sandbox");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group text-left rounded-2xl bg-surface-container-lowest border border-outline-variant/60 hover:border-primary-container/70 p-7 flex flex-col justify-between transition-all hover:shadow-[0_0_30px_rgba(129,140,248,0.18)] hover:-translate-y-0.5 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">
                          sports_esports
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-surface-container text-primary-container border border-primary-container/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span>Interactive Demo</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-primary-container transition-colors">
                      <span>Test the Live Sandbox</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Filter active roles, inspect interview rounds, and test multi-currency salary ranges with real data in our sandbox — zero registration required.
                    </p>
                  </div>

                  {/* Interactive Micro-Widget Preview */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 group-hover:border-primary-container/30 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant mb-2">
                      <span>Sandbox Telemetry</span>
                      <span className="text-secondary font-semibold">4 Active Roles</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/50">
                        Search &amp; Sort
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/30">
                        Offer • Stripe
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary-container/15 text-primary-container border border-primary-container/30">
                        Interview • Google
                      </span>
                    </div>
                  </div>
                </button>

                {/* Pathway 2: Jump to How It Works */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("workflow");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group text-left rounded-2xl bg-surface-container-lowest border border-outline-variant/60 hover:border-secondary/70 p-7 flex flex-col justify-between transition-all hover:shadow-[0_0_30px_rgba(78,222,163,0.18)] hover:-translate-y-0.5 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[22px]">
                          account_tree
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-surface-container text-secondary border border-secondary/20">
                        4-Step Guide
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5 group-hover:text-secondary transition-colors">
                      <span>See How It Works</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Discover the end-to-end framework: capture target companies, log multi-stage interview rounds, compare offers, and store interview debriefs.
                    </p>
                  </div>

                  {/* 4-Step Micro-Flow Preview */}
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 group-hover:border-secondary/30 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant mb-2">
                      <span>Workflow Pipeline</span>
                      <span className="text-primary-container font-semibold">Step 01 → 04</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                      <div className="py-1 rounded bg-surface-container text-on-surface-variant truncate">
                        01 Roles
                      </div>
                      <div className="py-1 rounded bg-surface-container text-on-surface-variant truncate">
                        02 Stages
                      </div>
                      <div className="py-1 rounded bg-surface-container text-on-surface-variant truncate">
                        03 Salary
                      </div>
                      <div className="py-1 rounded bg-surface-container text-on-surface-variant truncate">
                        04 Debrief
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Section Divider 3 */}
            <div className="w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-outline-variant/60 to-transparent my-16" />

            {/* Bottom Overview CTA */}
            <div className="w-full max-w-3xl rounded-3xl bg-gradient-to-b from-surface-container-high/60 to-surface-container-low border border-primary-container/40 p-8 sm:p-10 flex flex-col items-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Ready to organize your application journey?
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mb-6 max-w-md text-center">
                Create your free personal workspace in less than 30 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  data-testid="cta-register-btn"
                  onClick={() => onNavigateToAuth("register")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-container text-surface font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(129,140,248,0.4)] cursor-pointer"
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("sandbox");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container border border-outline-variant text-on-surface hover:text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Test Sandbox First
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LIVE SANDBOX (#demo)                               */}
        {/* ========================================================= */}
        {activeTab === "sandbox" && (
          <section className="animate-fadeIn">
            {/* Header info for Sandbox */}
            <div className="text-center max-w-3xl mx-auto mb-8 mt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-secondary/40 text-secondary text-xs font-mono mb-4">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Live Interactive Sandbox • No Login Needed</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Experience Job Tracker in Action
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Filter by status, search by role or company, and see how sample
                applications look. This is a real interactive preview of your
                future dashboard.
              </p>
            </div>

            {/* Window Container */}
            <div
              id="demo"
              className="w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/70 shadow-2xl p-6 relative"
            >
              {/* Sandbox Top Bar with Reset */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-outline-variant/50 mb-6 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-3 h-3 rounded-full bg-error/60" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <span className="w-3 h-3 rounded-full bg-secondary/60" />
                  </div>
                  <span className="font-mono text-xs text-on-surface-variant">
                    sandbox-session // demo_workspace
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetDemoJobs}
                    className="text-xs font-mono text-on-surface-variant hover:text-white px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-1.5 border border-outline-variant/60 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      refresh
                    </span>
                    <span>Reset Sample Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToAuth("register")}
                    className="text-xs font-semibold text-primary-container hover:brightness-110 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Save your real jobs</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>

              {/* Demo Notice Alert (if triggered) */}
              {demoNotice && (
                <div className="mb-6 p-4 rounded-xl bg-primary-container/15 border border-primary-container/40 flex items-start justify-between gap-3 text-xs text-on-surface animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">
                      info
                    </span>
                    <p className="leading-relaxed">{demoNotice}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDemoNotice(null)}
                    className="text-on-surface-variant hover:text-white text-xs font-mono cursor-pointer shrink-0"
                  >
                    ✕ Dismiss
                  </button>
                </div>
              )}

              {/* Interactive Metrics Bar */}
              <div className="mb-6">
                <StatsBanner jobs={demoJobs} />
              </div>

              {/* Controls: Search, Status Filters & Sort */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch lg:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <SearchBar
                    value={searchText}
                    onChange={(val) => setSearchText(val)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <FilterBar
                    currentFilter={filterStatus}
                    onFilterChange={(f) => setFilterStatus(f)}
                    jobs={demoJobs}
                  />
                  <SortControl
                    value={sortOrder}
                    onChange={(s) => setSortOrder(s)}
                  />
                </div>
              </div>

              {/* Job Applications Grid */}
              <div className="mt-4">
                <JobList
                  jobs={sortedJobs}
                  onDeleteJob={handleDeleteDemoJob}
                  onEditJob={handleEditDemoJob}
                />
              </div>

              {/* Sandbox Footer Banner */}
              <div className="mt-8 pt-6 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    check_circle
                  </span>
                  <span>
                    Showing {sortedJobs.length} of {demoJobs.length} demo
                    applications. Data resets on reload.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToAuth("register")}
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-surface font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(129,140,248,0.3)] cursor-pointer"
                >
                  Create Account to Track Your Jobs
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 3: HOW IT WORKS (WORKFLOW GUIDE)                      */}
        {/* ========================================================= */}
        {activeTab === "workflow" && (
          <section className="animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto mb-12 mt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant text-xs font-mono mb-4">
                <span className="material-symbols-outlined text-[15px] text-primary-container">
                  route
                </span>
                <span>Structured Job Search Framework</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                How Job Tracker Works
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Four intuitive steps to take your job search from messy notes and
                forgotten emails to a clear, organized pipeline.
              </p>
            </div>

            {/* 4 Workflow Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
              {/* Step 1 */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/60 p-6 flex flex-col justify-between hover:border-primary-container/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-primary-container font-bold px-2.5 py-1 rounded bg-primary-container/10 border border-primary-container/30">
                      Step 01
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      post_add
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Capture &amp; Organize Target Roles
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Record every application in seconds: company name, position,
                    application date, and job posting link before listings expire.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[11px] font-mono text-on-surface-variant">
                  💡 Keep your job hunt centralized without tab overload.
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/60 p-6 flex flex-col justify-between hover:border-secondary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-secondary font-bold px-2.5 py-1 rounded bg-secondary/10 border border-secondary/30">
                      Step 02
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      timeline
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Track Multi-Stage Interview Rounds
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Log current interview stages (Recruiter Screen, Technical Loop,
                    Take-Home Test, or Decision Pending) to stay on top of upcoming milestones.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[11px] font-mono text-on-surface-variant">
                  💡 Never miss a take-home assessment deadline again.
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/60 p-6 flex flex-col justify-between hover:border-tertiary/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-tertiary font-bold px-2.5 py-1 rounded bg-tertiary/10 border border-tertiary/30">
                      Step 03
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      currency_exchange
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Multi-Currency Compensation
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Applying to local and remote roles? Use our salary popover to
                    record min and max expectations in USD ($), EUR (€), or COP
                    ($) to negotiate with confidence.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[11px] font-mono text-on-surface-variant">
                  💡 Compare local and international compensation transparently.
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/60 p-6 flex flex-col justify-between hover:border-primary-container/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-primary-container font-bold px-2.5 py-1 rounded bg-primary-container/10 border border-primary-container/30">
                      Step 04
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      notes
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Store Interview Notes &amp; Feedback
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Debrief immediately after each call: questions asked, salary
                    hints dropped by the recruiter, and feedback received. All
                    links inside notes are automatically clickable.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-[11px] font-mono text-on-surface-variant">
                  💡 Never enter an interview unprepared again.
                </div>
              </div>
            </div>

            {/* Bottom CTA for Workflow */}
            <div className="text-center max-w-xl mx-auto rounded-2xl bg-surface-container-low border border-primary-container/40 p-8">
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to organize your pipeline?
              </h3>
              <p className="text-xs text-on-surface-variant mb-6">
                Join now and experience a clear, stress-free search.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateToAuth("register")}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary-container text-surface font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(129,140,248,0.35)] cursor-pointer"
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("sandbox");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Try Sandbox First
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="w-full border-t border-outline-variant/40 bg-surface-container-lowest/80 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center font-mono text-xs font-bold text-primary-container">
              JT
            </div>
            <span className="font-bold text-sm text-white">Job Tracker</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-on-surface-variant">
            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("sandbox");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Live Sandbox
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("workflow");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigateToAuth("login")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigateToAuth("register")}
              className="text-primary-container hover:brightness-110 font-semibold cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-4 pt-4 border-t border-outline-variant/30 text-center text-xs font-mono text-outline">
          © 2026 Job Tracker. Focused workspaces for modern career management.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
