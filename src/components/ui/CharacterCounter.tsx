import React from "react";

interface CharacterCounterProps {
  current: number;
  max: number;
  testId?: string;
}

/** Átomo reutilizable para mostrar el límite de caracteres en modales y formularios. */
export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  testId,
}) => {
  return (
    <span
      data-testid={testId}
      className={`text-[10px] font-mono ${
        current >= max ? "text-tertiary font-semibold" : "text-outline"
      }`}
    >
      {current} / {max}
    </span>
  );
};

export default CharacterCounter;
