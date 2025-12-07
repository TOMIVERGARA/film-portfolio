"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useAnalytics,
  AnalyticsEvent,
  PerformanceMetrics,
} from "@/hooks/use-analytics";

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  trackPageView: (
    pagePath: string,
    pageTitle?: string,
    viewDuration?: number
  ) => Promise<void>;
  trackPerformance: (metrics: PerformanceMetrics) => Promise<void>;
  endSession: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const analytics = useAnalytics();

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    // Return no-op functions if not within provider
    return {
      trackEvent: async () => {},
      trackPageView: async () => {},
      trackPerformance: async () => {},
      endSession: async () => {},
    };
  }
  return context;
}
