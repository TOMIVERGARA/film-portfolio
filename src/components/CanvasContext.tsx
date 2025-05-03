"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface CanvasContextType {
  currentRollIndex: number;
  setCurrentRollIndex: React.Dispatch<React.SetStateAction<number>>;
  centerOnRoll: (index: number) => void;
  rollsCount: number;
  setRollsCount: React.Dispatch<React.SetStateAction<number>>;
  shouldCenter: boolean; // Nuevo: flag para activar el centrado
  setShouldCenter: React.Dispatch<React.SetStateAction<boolean>>; // Nuevo: setter del flag
}

const CanvasContext = createContext<CanvasContextType>({
  currentRollIndex: 0,
  setCurrentRollIndex: () => {},
  centerOnRoll: () => {},
  rollsCount: 0,
  setRollsCount: () => {},
  shouldCenter: false, // Valor inicial del flag
  setShouldCenter: () => {},
});

export const useCanvas = () => useContext(CanvasContext);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  const [rollsCount, setRollsCount] = useState(0);
  const [shouldCenter, setShouldCenter] = useState(false);

  const centerOnRoll = useCallback((index: number) => {
    setCurrentRollIndex(index);
    setShouldCenter(true); // Activa el flag para centrar
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        currentRollIndex,
        setCurrentRollIndex,
        centerOnRoll,
        rollsCount,
        setRollsCount,
        shouldCenter,
        setShouldCenter, // Proporciona el setter del flag
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
