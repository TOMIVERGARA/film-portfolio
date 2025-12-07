"use client";

import { motion } from "framer-motion";

export function StatsCardSkeleton() {
  return (
    <div className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800 p-6">
      <div className="h-4 bg-neutral-800 w-24 mb-2 rounded-none animate-pulse" />
      <div className="h-8 bg-neutral-800 w-32 mb-1 rounded-none animate-pulse" />
      <div className="h-3 bg-neutral-800 w-40 rounded-none animate-pulse" />
    </div>
  );
}

export function ChartSkeleton({ height = "300px" }: { height?: string }) {
  return (
    <div className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800">
      <div className="p-6 border-b border-neutral-800">
        <div className="h-6 bg-neutral-800 w-48 mb-2 rounded-none animate-pulse" />
        <div className="h-4 bg-neutral-800 w-64 rounded-none animate-pulse" />
      </div>
      <div className="p-6">
        <div
          className="bg-neutral-900 rounded-none animate-pulse"
          style={{ height }}
        />
      </div>
    </div>
  );
}

export function MetricsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto mb-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-10 bg-neutral-800 w-48 rounded-none animate-pulse" />
            <div className="h-5 bg-neutral-800 w-96 rounded-none animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-neutral-800 rounded-none-none animate-pulse"
              />
            ))}
            <div className="h-10 w-10 bg-neutral-800 rounded-none animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Sessions Chart Skeleton */}
        <ChartSkeleton />

        {/* Performance & Devices Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="250px" />
          <ChartSkeleton height="250px" />
        </div>

        {/* Geographic Distribution Skeleton */}
        <ChartSkeleton height="400px" />

        {/* Browsers & OS Skeleton */}
        <ChartSkeleton height="300px" />

        {/* Top Events Skeleton */}
        <ChartSkeleton height="300px" />
      </motion.div>
    </div>
  );
}
