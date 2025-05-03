"use client";

import { createContext, useContext, useState } from "react";

interface CanvasContextType {
  currentRollIndex: number;
  setCurrentRollIndex: React.Dispatch<React.SetStateAction<number>>;
  centerOnRoll: (index: number) => void;
  rollsCount: number;
  setRollsCount: React.Dispatch<React.SetStateAction<number>>;
}

const CanvasContext = createContext<CanvasContextType>({
  currentRollIndex: 0,
  setCurrentRollIndex: () => {},
  centerOnRoll: () => {},
  rollsCount: 0,
  setRollsCount: () => {},
});

export const useCanvas = () => useContext(CanvasContext);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  const [rollsCount, setRollsCount] = useState(0);

  const centerOnRoll = (index: number) => {
    // Esta función será implementada en Canvas.tsx
    setCurrentRollIndex(index);
  };

  return (
    <CanvasContext.Provider
      value={{
        currentRollIndex,
        setCurrentRollIndex,
        centerOnRoll,
        rollsCount,
        setRollsCount,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
