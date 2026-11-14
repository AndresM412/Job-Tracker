import React, { useState } from "react";

interface StarRatingProps {
  value?: number;
  onChange?: (priority: number) => void;
  size?: "xs" | "sm" | "md";
  stopPropagation?: boolean;
  disabled?: boolean;
  testIdPrefix?: string;
}

const SIZE_CLASSES: Record<"xs" | "sm" | "md", string> = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
};

const BUTTON_PADDING: Record<"xs" | "sm" | "md", string> = {
  xs: "p-0.5",
  sm: "p-0.5",
  md: "p-1",
};

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  size = "sm",
  stopPropagation = false,
  disabled = false,
  testIdPrefix = "priority-star",
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const currentValue = Math.max(0, Math.min(5, value || 0));
  const displayValue = hoveredStar !== null ? hoveredStar : currentValue;
  const isInteractive = Boolean(onChange) && !disabled;

  const handleStarClick = (e: React.MouseEvent, star: number) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (!isInteractive || !onChange) return;
    // Re-clicar la misma estrella activa limpia la prioridad a 0
    onChange(star === currentValue ? 0 : star);
  };

  return (
    <div
      role="group"
      aria-label="Application priority"
      data-testid={`${testIdPrefix}-group`}
      className="inline-flex items-center gap-0.5 shrink-0"
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      onMouseLeave={() => setHoveredStar(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= displayValue;
        const isSet = star <= currentValue;
        const starLabel = `Priority ${star} ${star === 1 ? "star" : "stars"}`;

        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            data-testid={`${testIdPrefix}-${star}`}
            data-active={isSet ? "true" : "false"}
            aria-label={starLabel}
            aria-pressed={isSet}
            title={
              !isInteractive
                ? `Priority: ${currentValue}/5`
                : star === currentValue
                ? "Click to clear priority (0 stars)"
                : `Set priority to ${star} ${star === 1 ? "star" : "stars"}`
            }
            onMouseEnter={() => isInteractive && setHoveredStar(star)}
            onClick={(e) => handleStarClick(e, star)}
            className={`${BUTTON_PADDING[size]} rounded transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-container ${
              isInteractive
                ? "cursor-pointer hover:scale-110 active:scale-95"
                : "cursor-default"
            } ${
              isActive
                ? "text-tertiary drop-shadow-[0_0_6px_rgba(255,185,95,0.28)]"
                : "text-outline/45 hover:text-tertiary/75"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={SIZE_CLASSES[size]}
              fill={isActive ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

