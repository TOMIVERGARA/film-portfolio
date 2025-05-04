"use client";

import { Roll } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface CanvasContextType {
  currentRollIndex: number;
  setCurrentRollIndex: React.Dispatch<React.SetStateAction<number>>;
  centerOnRoll: (index: number) => void;
  rollsCount: number;
  setRollsCount: React.Dispatch<React.SetStateAction<number>>;
  shouldCenter: boolean; // Nuevo: flag para activar el centrado
  setShouldCenter: React.Dispatch<React.SetStateAction<boolean>>; // Nuevo: setter del flag
  rolls: Roll[];
  preloadProgress: number;
  isAppReady: boolean;
  setAppReady: React.Dispatch<React.SetStateAction<boolean>>;
}

const CanvasContext = createContext<CanvasContextType>({
  currentRollIndex: 0,
  setCurrentRollIndex: () => {},
  centerOnRoll: () => {},
  rollsCount: 0,
  setRollsCount: () => {},
  shouldCenter: false, // Valor inicial del flag
  setShouldCenter: () => {},
  rolls: [],
  preloadProgress: 0,
  isAppReady: false,
  setAppReady: () => {},
});

export const useCanvas = () => useContext(CanvasContext);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [currentRollIndex, setCurrentRollIndex] = useState(0);
  const [rollsCount, setRollsCount] = useState(0);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isAppReady, setAppReady] = useState(false);

  const centerOnRoll = useCallback((index: number) => {
    setCurrentRollIndex(index);
    setShouldCenter(true); // Activa el flag para centrar
  }, []);

  const preloadResources = useCallback(async () => {
    try {
      // 1. Obtener datos de la API
      const response = await fetch("/pages/api/photos");
      const data = await response.json();
      setRolls(data);

      // 2. Extraer todas las URLs de imágenes
      const allImageUrls = data.flatMap((roll: Roll) =>
        roll.photos.map((photo) => photo.url)
      );

      // 3. Precargar imágenes
      let loadedCount = 0;
      await Promise.all(
        allImageUrls.map(
          (url: string) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                loadedCount++;
                setPreloadProgress(
                  Math.round((loadedCount / allImageUrls.length) * 100)
                );
                resolve(true);
              };
              img.onerror = resolve;
            })
        )
      );

      // 4. Marcar como listo
      setAppReady(true);
    } catch (error) {
      console.error("Error precargando recursos:", error);
      setAppReady(true); // Fallback: cargar igualmente
    }
  }, []);

  useEffect(() => {
    preloadResources();
  }, [preloadResources]);

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
        rolls,
        preloadProgress,
        isAppReady,
        setAppReady,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
