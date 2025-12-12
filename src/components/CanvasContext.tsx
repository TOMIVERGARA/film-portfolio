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
  isLost: boolean;
  setIsLost: React.Dispatch<React.SetStateAction<boolean>>;
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
  isLost: false,
  setIsLost: () => {},
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
  const [isLost, setIsLost] = useState(false);
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

      // 3. Precargar imágenes y trackear tiempos de carga
      let loadedCount = 0;
      const loadTimes: number[] = [];
      const preloadStartTime = performance.now();

      await Promise.all(
        allImageUrls.map(
          (url: string) =>
            new Promise((resolve) => {
              const imgStartTime = performance.now();
              const img = new Image();
              img.src = url;
              img.onload = () => {
                const imgLoadTime = performance.now() - imgStartTime;
                loadTimes.push(imgLoadTime);
                loadedCount++;
                setPreloadProgress(
                  Math.round((loadedCount / allImageUrls.length) * 100)
                );
                resolve(true);
              };
              img.onerror = () => {
                loadedCount++;
                setPreloadProgress(
                  Math.round((loadedCount / allImageUrls.length) * 100)
                );
                resolve(false);
              };
            })
        )
      );

      // 4. Calcular y enviar métricas de performance
      if (loadTimes.length > 0) {
        const firstPhotoLoadTime = Math.min(...loadTimes);
        const avgPhotoLoadTime =
          loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
        const totalPhotosLoaded = loadTimes.length;

        console.log("[CanvasContext] Photos preloaded. Metrics:", {
          firstPhotoLoadTime: Math.round(firstPhotoLoadTime),
          avgPhotoLoadTime: Math.round(avgPhotoLoadTime),
          totalPhotosLoaded,
        });

        // Enviar métricas a analytics
        try {
          await fetch("/pages/api/analytics/performance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionStorage.getItem("analytics_session_id"),
              firstPhotoLoadTime: Math.round(firstPhotoLoadTime),
              avgPhotoLoadTime: Math.round(avgPhotoLoadTime),
              totalPhotosLoaded,
            }),
          });
        } catch (error) {
          console.error(
            "[CanvasContext] Failed to track photo load metrics:",
            error
          );
        }
      }

      // 5. Marcar como listo
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
        isLost,
        setIsLost,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
