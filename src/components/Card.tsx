type CardProps = {
  children: React.ReactNode;
};

function Card({ children }: CardProps) {
  return (
    <div
      style={{
        border: "5px solid blue",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
      }}
    >
      {children}
    </div>
  );
}

export default Card;