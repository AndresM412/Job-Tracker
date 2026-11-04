type CardProps = {
  children: React.ReactNode;
  spineClass?: string;
  glowClass?: string;
  "data-testid"?: string;
};

function Card({
  children,
  spineClass = "bg-primary-container",
  glowClass = "",
  "data-testid": testId,
}: CardProps) {
  return (
    <article
      data-testid={testId}
      className={`group relative bg-surface-container-low/95 rounded-xl p-5 shadow-sm hover:bg-surface-container transition-all flex flex-col justify-between overflow-hidden h-full ${glowClass}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${spineClass}`} />
      {children}
    </article>
  );
}

export default Card;


