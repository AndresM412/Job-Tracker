type CardProps = {
  children: React.ReactNode;
  accentColor?: string;
  glowClass?: string;
  "data-testid"?: string;
};

function Card({ children, accentColor, glowClass = "", "data-testid": testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      className={`relative bg-surface border border-border/80 rounded-xl pl-5 pr-5 py-4 flex flex-col gap-1 h-full transition-all duration-200 hover:-translate-y-0.5 ${glowClass}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor ?? "var(--color-border)" }}
      />
      {children}
    </div>
  );
}

export default Card;
