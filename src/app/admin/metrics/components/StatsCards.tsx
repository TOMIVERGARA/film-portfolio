"use client";

import { motion } from "framer-motion";
import {
  Users,
  Image,
  Clock,
  ChartArea,
  TrendingUp,
  LucideIcon,
} from "lucide-react";

interface StatsCardsProps {
  overview: {
    total_sessions: number;
    unique_sessions: number;
    about_me_views: number;
    avg_duration: number;
  };
  pageViews: {
    total_views: number;
  };
}

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
  delay: number;
}

function StatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-neutral-400" />
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-neutral-400 lowercase">{label}</p>
        {sublabel && <p className="text-xs text-neutral-500">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

export function StatsCards({ overview, pageViews }: StatsCardsProps) {
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={Users}
        value={overview.total_sessions || 0}
        label="total sesiones"
        sublabel={`${overview.unique_sessions || 0} únicos`}
        delay={0.1}
      />
      <StatCard
        icon={Image}
        value={pageViews.total_views || 0}
        label="vistas de página"
        delay={0.2}
      />
      <StatCard
        icon={Clock}
        value={formatDuration(overview.avg_duration || 0)}
        label="duración promedio"
        delay={0.3}
      />
      <StatCard
        icon={ChartArea}
        value={overview.about_me_views || 0}
        label="about me abierto"
        delay={0.4}
      />
    </div>
  );
}
