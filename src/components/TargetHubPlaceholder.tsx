export function TargetHubPlaceholder() {
  return (
    <div
      data-testid="view-target-hub-placeholder"
      className="bg-surface border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xl relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-offer/15 border border-offer/30 flex items-center justify-center text-offer mb-4 shadow-[0_0_20px_rgba(95,217,168,0.2)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>

      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-offer/10 text-offer border border-offer/30 mb-3">
        Ready for Implementation
      </span>

      <h2 className="text-xl font-bold font-display text-text mb-2">
        Target Companies &amp; Search Hub
      </h2>

      <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
        Your curated launchpad for dream employers, direct careers portals, and bookmarked job search queries (LinkedIn, Magneto, and more).
      </p>

      <div className="flex items-center gap-2 text-xs text-muted/80 bg-bg px-4 py-2 rounded-lg border border-border">
        <span className="w-2 h-2 rounded-full bg-offer animate-pulse"></span>
        <span>Active candidate exploration space — Next Phase</span>
      </div>
    </div>
  );
}

export default TargetHubPlaceholder;
