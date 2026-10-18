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
      valueColor: "text-on-surface",
      icon: "dataset",
      iconBg: "bg-surface-variant/40",
      iconColor: "text-primary",
      accentBorder: "bg-gradient-to-r from-primary/30 to-transparent",
    },
    {
      label: "Applied",
      count: appliedCount,
      sublabel: getPercentage(appliedCount),
      valueColor: "text-tertiary",
      icon: "hourglass_empty",
      iconBg: "bg-tertiary/10",
      iconColor: "text-tertiary",
      accentBorder: "bg-tertiary/40",
    },
    {
      label: "Interview",
      count: interviewCount,
      sublabel: getPercentage(interviewCount),
      valueColor: "text-primary-container",
      icon: "auto_awesome",
      iconBg: "bg-primary-container/20",
      iconColor: "text-primary-container",
      accentBorder: "bg-primary-container/40",
    },
    {
      label: "Offer",
      count: offerCount,
      sublabel: getPercentage(offerCount),
      valueColor: "text-secondary",
      icon: "rocket_launch",
      iconBg: "bg-secondary/15",
      iconColor: "text-secondary",
      accentBorder: "bg-secondary/40",
    },
    {
      label: "Rejected",
      count: rejectedCount,
      sublabel: getPercentage(rejectedCount),
      valueColor: "text-error",
      icon: "close",
      iconBg: "bg-error/15",
      iconColor: "text-error",
      accentBorder: "bg-error/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-container-low/95 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group hover:bg-surface-container transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
              {stat.label}
            </span>
            <div
              className={`w-6 h-6 rounded flex items-center justify-center ${stat.iconBg}`}
            >
              <span
                className={`material-symbols-outlined text-[17px] ${stat.iconColor}`}
              >
                {stat.icon}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-[28px] font-bold font-sans tracking-tight leading-none ${stat.valueColor}`}
            >
              {stat.count}
            </span>
            <span className="text-xs text-on-surface-variant/70 font-medium">
              {stat.sublabel}
            </span>
          </div>


          {/* Bottom Accent Line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.accentBorder}`}
          />
        </div>
      ))}
    </div>
  );
}

