import { type JobApplication } from "../types/job";

type StatsBannerProps = {
  jobs: JobApplication[];
};

export default function StatsBanner({ jobs }: StatsBannerProps) {
  const total = jobs.length;
  const appliedCount = jobs.filter((j) => j.status === "Applied").length;
  const interviewCount = jobs.filter((j) => j.status === "Interview").length;
  const offerCount = jobs.filter((j) => j.status === "Offer").length;
  const rejectedCount = jobs.filter((j) => j.status === "Rejected").length;

  const getPercentage = (count: number) => {
    if (total === 0) return "0%";
    return `${((count / total) * 100).toFixed(1)}%`;
  };

  const stats = [
    {
      label: "Total",
      count: total,
      sublabel: "pipeline",
      color: "var(--color-text)",
      badge: "📊",
      accentBorder: "bg-gradient-to-r from-interview/40 to-transparent",
    },
    {
      label: "Applied",
      count: appliedCount,
      sublabel: getPercentage(appliedCount),
      color: "var(--color-applied)",
      badge: "⏳",
      accentBorder: "bg-applied/40",
    },
    {
      label: "Interview",
      count: interviewCount,
      sublabel: getPercentage(interviewCount),
      color: "var(--color-interview)",
      badge: "🎉",
      accentBorder: "bg-interview/40",
    },
    {
      label: "Offer",
      count: offerCount,
      sublabel: getPercentage(offerCount),
      color: "var(--color-offer)",
      badge: "🚀",
      accentBorder: "bg-offer/40",
    },
    {
      label: "Rejected",
      count: rejectedCount,
      sublabel: getPercentage(rejectedCount),
      color: "var(--color-rejected)",
      badge: "❌",
      accentBorder: "bg-rejected/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface/90 border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-border transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {stat.label}
            </span>
            <div className="w-6 h-6 rounded flex items-center justify-center bg-border/40 text-xs">
              {stat.badge}
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className="text-2xl font-bold font-display tracking-tight"
              style={{ color: stat.color }}
            >
              {stat.count}
            </span>
            <span className="text-[11px] font-medium text-muted/70">
              {stat.sublabel}
            </span>
          </div>

          {/* Bottom Accent Glow Line */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.accentBorder}`} />
        </div>
      ))}
    </div>
  );
}
