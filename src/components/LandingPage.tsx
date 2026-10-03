import React from "react";
import StatusBadge from "./StatusBadge";

interface LandingPageProps {
  onNavigateToAuth: (mode: "login" | "register") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToAuth,
}) => {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-interview/30 selection:text-text">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-interview/15 border border-interview/30 flex items-center justify-center text-interview font-display font-bold text-base shadow-sm shadow-interview/20">
              JT
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-text">
              Job Tracker
            </span>
          </div>

          {/* Top-right corner: Log In and Sign Up */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="landing-login-btn"
              onClick={() => onNavigateToAuth("login")}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-border text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              data-testid="landing-register-btn"
              onClick={() => onNavigateToAuth("register")}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-interview text-bg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-interview/20 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-offer animate-pulse"></span>
          Control Room for your career
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.15] tracking-tight max-w-3xl mx-auto">
          Ditch the spreadsheets. Take control of your job search.
        </h1>

        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
          Centralize your applications, interview notes with auto-detected
          links, and real-time conversion metrics. Designed specifically for
          tech professionals.
        </p>

        {/* 3. Product Preview / Interactive Mockup */}
        <div className="mt-14 p-3 sm:p-4 rounded-2xl bg-surface/60 border border-border shadow-2xl shadow-black/80 backdrop-blur-sm text-left">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/80 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rejected/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-applied/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-offer/60"></span>
              <span className="ml-2 font-mono text-muted/70">
                app.jobtracker.internal / dashboard
              </span>
            </div>
            <span className="font-mono text-xs text-offer flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-offer"></span> Live
              Demo
            </span>
          </div>

          {/* Metric Tiles Demo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-bg/80 border border-border p-3 rounded-lg">
              <p className="text-xs text-muted">Total Jobs</p>
              <p className="font-display text-xl font-bold text-text mt-0.5">
                14
              </p>
            </div>
            <div className="bg-bg/80 border border-border p-3 rounded-lg">
              <p className="text-xs text-muted">Interviewing</p>
              <p className="font-display text-xl font-bold text-interview mt-0.5">
                4
              </p>
            </div>
            <div className="bg-bg/80 border border-border p-3 rounded-lg">
              <p className="text-xs text-muted">Offers</p>
              <p className="font-display text-xl font-bold text-offer mt-0.5">
                1
              </p>
            </div>
            <div className="bg-bg/80 border border-border p-3 rounded-lg">
              <p className="text-xs text-muted">Response Rate</p>
              <p className="font-display text-xl font-bold text-applied mt-0.5">
                35%
              </p>
            </div>
          </div>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-bg/90 border border-border/90 rounded-lg p-4 card-glow-interview">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display font-medium text-text text-sm">
                    Google
                  </h2>
                  <p className="text-xs text-muted">QA Automation Engineer</p>
                </div>
                <StatusBadge status="Interview" />
              </div>
              <p className="font-mono text-[10px] text-muted/70 mt-2">
                2026-09-18
              </p>
              <p className="text-xs text-muted mt-2 line-clamp-1">
                Technical round: Playwright + CI
              </p>
            </div>

            <div className="bg-bg/90 border border-border/90 rounded-lg p-4 card-glow-offer">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display font-medium text-text text-sm">
                    Stripe
                  </h2>
                  <p className="text-xs text-muted">Backend Developer</p>
                </div>
                <StatusBadge status="Offer" />
              </div>
              <p className="font-mono text-[10px] text-muted/70 mt-2">
                2026-09-20
              </p>
              <p className="text-xs text-muted mt-2 line-clamp-1">
                Offer received: compensation review
              </p>
            </div>

            <div className="bg-bg/90 border border-border/90 rounded-lg p-4 card-glow-applied">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display font-medium text-text text-sm">
                    Spotify
                  </h2>
                  <p className="text-xs text-muted">Fullstack Engineer</p>
                </div>
                <StatusBadge status="Applied" />
              </div>
              <p className="font-mono text-[10px] text-muted/70 mt-2">
                2026-09-22
              </p>
              <p className="text-xs text-muted mt-2 line-clamp-1">
                Applied via LinkedIn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-20 border-t border-border bg-surface/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-text">
              Everything you need for your job hunt
            </h2>
            <p className="text-muted text-sm mt-3">
              Engineered with modern web standards for a fast, clean, and
              distraction-free workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-applied/15 text-applied border border-applied/30 flex items-center justify-center font-bold mb-4">
                📊
              </div>
              <h3 className="font-display font-medium text-lg text-text">
                Visual Pipeline & Status Badges
              </h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Spot where each job stands instantly with high-contrast glowing
                badges: Applied, Interview, Offer, or Rejected.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-interview/15 text-interview border border-interview/30 flex items-center justify-center font-bold mb-4">
                🔗
              </div>
              <h3 className="font-display font-medium text-lg text-text">
                Smart Notes with URL Recognition
              </h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Save links to job postings, recruiter portfolios, and company
                updates with automatic clickable link detection.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-offer/15 text-offer border border-offer/30 flex items-center justify-center font-bold mb-4">
                ⚡
              </div>
              <h3 className="font-display font-medium text-lg text-text">
                Instant Filter, Search & Sorting
              </h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Find any company in milliseconds and sort chronologically to
                prioritize your upcoming interview follow-ups.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-rejected/15 text-rejected border border-rejected/30 flex items-center justify-center font-bold mb-4">
                🔒
              </div>
              <h3 className="font-display font-medium text-lg text-text">
                Strict Multi-Tenant Security
              </h3>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Your data is strictly confidential. Every account is protected
                by JWT authentication with bcrypt-encrypted credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (3 Steps) */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-text mb-12">
            Get started in 3 simple steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="border-l-2 border-interview pl-4">
              <span className="font-mono text-xs text-interview font-semibold">
                STEP 01
              </span>
              <h4 className="font-display font-medium text-text mt-1 text-base">
                Create your account
              </h4>
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Sign up in seconds with your email and password.
              </p>
            </div>

            <div className="border-l-2 border-applied pl-4">
              <span className="font-mono text-xs text-applied font-semibold">
                STEP 02
              </span>
              <h4 className="font-display font-medium text-text mt-1 text-base">
                Log your applications
              </h4>
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Add company, role, application date, and notes.
              </p>
            </div>

            <div className="border-l-2 border-offer pl-4">
              <span className="font-mono text-xs text-offer font-semibold">
                STEP 03
              </span>
              <h4 className="font-display font-medium text-text mt-1 text-base">
                Track your interviews
              </h4>
              <p className="text-muted text-xs mt-2 leading-relaxed">
                Update status as you advance through rounds until the offer
                lands.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Final Call To Action */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-surface/40 to-bg">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
            Ready to organize your career?
          </h2>
          <p className="text-muted text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Join Job Tracker today and keep every opportunity at your
            fingertips.
          </p>
          <div className="mt-8">
            <button
              type="button"
              data-testid="cta-register-btn"
              onClick={() => onNavigateToAuth("register")}
              className="text-sm font-semibold px-8 py-3.5 rounded-lg bg-interview text-bg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-interview/30 cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 border-t border-border text-center text-xs text-muted/70">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Job Tracker · Built for career growth</p>
          <p className="font-mono text-[11px]">
            React + TypeScript + FastAPI + Playwright
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
