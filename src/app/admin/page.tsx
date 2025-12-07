"use client";

import { motion } from "framer-motion";
import {
  CirclePlus,
  ChartArea,
  Download,
  Image,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authenticatedFetchJSON } from "@/lib/api-client";

interface QuickStats {
  totalSessions: number;
  totalPageViews: number;
  avgDuration: number;
  aboutMeViews: number;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<QuickStats>({
    totalSessions: 0,
    totalPageViews: 0,
    avgDuration: 0,
    aboutMeViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const data = await authenticatedFetchJSON(
        "/pages/api/analytics/stats?period=7days"
      );
      setStats({
        totalSessions: data.stats.overview.total_sessions || 0,
        totalPageViews: data.stats.pageViews.total_views || 0,
        avgDuration: data.stats.overview.avg_duration || 0,
        aboutMeViews: data.stats.overview.about_me_views || 0,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold lowercase text-white">
            panel de administración
          </h1>
          <p className="text-neutral-400 lowercase">
            bienvenido al panel de administración
          </p>
        </div>

        {/* Quick Stats Grid - Analytics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold lowercase text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            estadísticas (últimos 7 días)
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 animate-pulse"
                >
                  <div className="h-8 bg-neutral-700 rounded-none mb-4"></div>
                  <div className="h-12 bg-neutral-700 rounded-none"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-neutral-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.totalSessions}
                  </span>
                </div>
                <h3 className="text-sm text-neutral-400 lowercase">
                  sesiones totales
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-neutral-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.totalPageViews}
                  </span>
                </div>
                <h3 className="text-sm text-neutral-400 lowercase">
                  vistas de página
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Image className="w-8 h-8 text-neutral-400" />
                  <span className="text-3xl font-bold text-white">
                    {formatDuration(stats.avgDuration)}
                  </span>
                </div>
                <h3 className="text-sm text-neutral-400 lowercase">
                  duración promedio
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Image className="w-8 h-8 text-neutral-400" />
                  <span className="text-3xl font-bold text-white">
                    {stats.aboutMeViews}
                  </span>
                </div>
                <h3 className="text-sm text-neutral-400 lowercase">
                  about me visto
                </h3>
              </motion.div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold lowercase text-white">
            acciones rápidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/add-roll">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
                    <CirclePlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold lowercase text-white">
                      crear nuevo roll
                    </h3>
                    <p className="text-sm text-neutral-400 lowercase">
                      sube un nuevo conjunto de fotos
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/admin/metrics">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-neutral-700 transition-colors">
                    <ChartArea className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold lowercase text-white">
                      ver estadísticas
                    </h3>
                    <p className="text-sm text-neutral-400 lowercase">
                      métricas y análisis del portfolio
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
