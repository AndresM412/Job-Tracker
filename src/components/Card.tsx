type CardProps = {
  children: React.ReactNode;
  accentColor?: string;
  "data-testid"?: string;
};

function Card({ children, accentColor, "data-testid": testId }: CardProps) {
  return (
    <div
      data-testid={testId}
      className="relative bg-surface border border-border rounded-lg pl-5 pr-5 py-4 flex flex-col gap-1 h-full"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: accentColor ?? "var(--color-border)" }}
      />
      {children}
    </div>
  );
}

export default Card;
