import React from "react";
import { type WorkMode } from "../../types/job";

interface WorkModeBadgeProps {
  mode: WorkMode;
  size?: "xs" | "sm" | "md";
}

const WORK_MODE_STYLES: Record<
  WorkMode,
  { dotClass: string; textColor: string }
> = {
  Remote: {
    dotClass: "bg-secondary shadow-[0_0_6px_rgba(78,222,163,0.4)]",
    textColor: "text-secondary",
  },
  Hybrid: {
    dotClass: "bg-primary-container shadow-[0_0_6px_rgba(129,140,248,0.4)]",
    textColor: "text-primary-container",
  },
  "On-site": {
    dotClass: "bg-tertiary shadow-[0_0_6px_rgba(255,185,95,0.4)]",
    textColor: "text-tertiary",
  },
};

export const WorkModeBadge: React.FC<WorkModeBadgeProps> = ({
  mode,
  size = "xs",
}) => {
  const style = WORK_MODE_STYLES[mode];
  if (!style) return null;

  return (
    <span
      data-testid="work-mode-badge"
      className={`inline-flex items-center gap-1.5 shrink-0 ${style.textColor} ${
        size === "md"
          ? "text-sm sm:text-base font-semibold"
          : size === "sm"
          ? "text-xs font-medium"
          : "text-[11px] font-medium"
      }`}
    >
      <span
        className={`${
          size === "md" ? "w-2 h-2" : "w-1.5 h-1.5"
        } rounded-full shrink-0 ${style.dotClass}`}
        aria-hidden="true"
      />
      <span>{mode}</span>
    </span>
  );
};

export default WorkModeBadge;

