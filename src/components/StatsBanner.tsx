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

  const stats = [
    { label: "Total", count: total, color: "var(--color-text)", badge: "📊" },
    { label: "Applied", count: appliedCount, color: "var(--color-applied)", badge: "⏳" },
    { label: "Interview", count: interviewCount, color: "var(--color-interview)", badge: "🎉" },
    { label: "Offer", count: offerCount, color: "var(--color-offer)", badge: "🚀" },
    { label: "Rejected", count: rejectedCount, color: "var(--color-rejected)", badge: "❌" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface border border-border/80 rounded-xl p-3.5 flex flex-col justify-between transition-all hover:border-border"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">{stat.label}</span>
            <span className="text-xs opacity-75">{stat.badge}</span>
          </div>
          <p
            className="text-2xl font-bold font-display mt-2"
            style={{ color: stat.color }}
          >
            {stat.count}
          </p>
        </div>
      ))}
    </div>
  );
}
