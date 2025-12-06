// pages/page.tsx
"use client";

import Canvas from "@/components/canvas/Canvas";
import { BottomBar } from "@/components/BottomBar";
import { useAnalyticsContext } from "@/components/AnalyticsProvider";
import { useEffect } from "react";

export default function HomePage() {
  const { trackEvent } = useAnalyticsContext();

  useEffect(() => {
    // Track canvas initialization
    const startTime = Date.now();

    const handleCanvasReady = () => {
      const initTime = Date.now() - startTime;
      trackEvent({
        eventType: "canvas_initialized",
        eventCategory: "performance",
        eventValue: initTime,
        metadata: { initTimeMs: initTime },
      });
    };

    // Small delay to ensure canvas is mounted
    setTimeout(handleCanvasReady, 100);
  }, [trackEvent]);

  return (
    <div>
      <Canvas />
      <BottomBar />
    </div>
  );
}
