export function CalendarPlaceholder() {
  return (
    <div
      data-testid="view-calendar-placeholder"
      className="bg-surface border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xl relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-interview/15 border border-interview/30 flex items-center justify-center text-interview mb-4 shadow-[0_0_20px_rgba(139,127,232,0.2)]">
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-interview/10 text-interview border border-interview/30 mb-3">
        Coming Soon
      </span>

      <h2 className="text-xl font-bold font-display text-text mb-2">
        Interview Calendar &amp; Deadlines
      </h2>

      <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
        Track your upcoming technical interviews, take-home deadlines, and system design rounds in a unified calendar.
      </p>

      <div className="flex items-center gap-2 text-xs text-muted/80 bg-bg px-4 py-2 rounded-lg border border-border">
        <span className="w-2 h-2 rounded-full bg-interview animate-pulse"></span>
        <span>Scheduled for Phase 3 development</span>
      </div>
    </div>
  );
}

export default CalendarPlaceholder;
