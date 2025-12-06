"use client";

import { motion } from "framer-motion";
import {
  ChartArea,
  TrendingUp,
  Image,
  Calendar,
  Users,
  Globe,
  Clock,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { authenticatedFetchJSON } from "@/lib/api-client";

interface AnalyticsStats {
  overview: {
    total_sessions: number;
    unique_sessions: number;
    mobile_blocked: number;
    mobile_visitors: number;
    desktop_visitors: number;
    about_me_views: number;
    avg_duration: number;
    last_visit: string | null;
  };
  pageViews: {
    total_views: number;
  };
  topCountries: Array<{
    country: string;
    country_code: string;
    count: number;
  }>;
  browsers: Array<{
    browser: string;
    count: number;
  }>;
  os: Array<{
    os: string;
    count: number;
  }>;
  performance: {
    avg_page_load: number;
    avg_canvas_init: number;
    avg_first_photo: number;
    avg_photo_load: number;
    avg_photos_loaded: number;
  };
  topEvents: Array<{
    event_type: string;
    event_category: string;
    count: number;
  }>;
  dailySessions: Array<{
    date: string;
    sessions: number;
    unique_visitors: number;
  }>;
}

export default function MetricsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7days" | "30days" | "90days" | "all">(
    "7days"
  );

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await authenticatedFetchJSON(
        `/pages/api/analytics/stats?period=${period}`
      );
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <p className="text-neutral-400 lowercase">cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <p className="text-neutral-400 lowercase">
            no se pudieron cargar las métricas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold lowercase text-white">
              métricas y estadísticas
            </h1>
            <p className="text-neutral-400 lowercase">
              análisis detallado de tu portfolio analógico
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {(["7days", "30days", "90days", "all"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm lowercase transition-colors ${
                  period === p
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {p === "7days"
                  ? "7 días"
                  : p === "30days"
                  ? "30 días"
                  : p === "90days"
                  ? "90 días"
                  : "todo"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                {stats.overview.total_sessions || 0}
              </p>
              <p className="text-sm text-neutral-400 lowercase">
                total sesiones
              </p>
              <p className="text-xs text-neutral-500">
                {stats.overview.unique_sessions || 0} únicos
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Image className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                {stats.pageViews.total_views || 0}
              </p>
              <p className="text-sm text-neutral-400 lowercase">
                vistas de página
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                {formatDuration(stats.overview.avg_duration || 0)}
              </p>
              <p className="text-sm text-neutral-400 lowercase">
                duración promedio
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartArea className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">
                {stats.overview.about_me_views || 0}
              </p>
              <p className="text-sm text-neutral-400 lowercase">
                about me abierto
              </p>
            </div>
          </motion.div>
        </div>

        {/* Device & Access Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4">
              dispositivos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 lowercase">desktop</span>
                <span className="text-white font-bold">
                  {stats.overview.desktop_visitors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 lowercase">
                  mobile (visitantes)
                </span>
                <span className="text-white font-bold">
                  {stats.overview.mobile_visitors || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 lowercase">
                  mobile (bloqueados)
                </span>
                <span className="text-orange-400 font-bold">
                  {stats.overview.mobile_blocked || 0}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              top países
            </h3>
            <div className="space-y-2">
              {stats.topCountries.slice(0, 5).map((country, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-neutral-400">
                    {country.country_code} {country.country}
                  </span>
                  <span className="text-white font-bold">{country.count}</span>
                </div>
              ))}
              {stats.topCountries.length === 0 && (
                <p className="text-neutral-500 text-sm lowercase">sin datos</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              performance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400 lowercase">carga página</span>
                <span className="text-white">
                  {stats.performance.avg_page_load || 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 lowercase">init canvas</span>
                <span className="text-white">
                  {stats.performance.avg_canvas_init || 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 lowercase">primera foto</span>
                <span className="text-white">
                  {stats.performance.avg_first_photo || 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400 lowercase">
                  promedio fotos
                </span>
                <span className="text-white">
                  {stats.performance.avg_photo_load || 0}ms
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Browser & OS Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4">
              navegadores
            </h3>
            <div className="space-y-2">
              {stats.browsers.map((browser, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-neutral-400">{browser.browser}</span>
                  <span className="text-white font-bold">{browser.count}</span>
                </div>
              ))}
              {stats.browsers.length === 0 && (
                <p className="text-neutral-500 lowercase">sin datos</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4">
              sistemas operativos
            </h3>
            <div className="space-y-2">
              {stats.os.map((os, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-neutral-400">{os.os}</span>
                  <span className="text-white font-bold">{os.count}</span>
                </div>
              ))}
              {stats.os.length === 0 && (
                <p className="text-neutral-500 lowercase">sin datos</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Top Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              eventos principales
            </h3>
          </div>
          <div className="p-6">
            {stats.topEvents.length > 0 ? (
              <div className="space-y-2">
                {stats.topEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b border-neutral-800/50 last:border-0"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {event.event_type}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {event.event_category || "sin categoría"}
                      </p>
                    </div>
                    <span className="text-white font-bold">{event.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500 lowercase">
                no hay eventos registrados
              </p>
            )}
          </div>
        </motion.div>

        {/* Daily Sessions Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              sesiones diarias (últimos 30 días)
            </h3>
          </div>
          <div className="p-6">
            {stats.dailySessions.length > 0 ? (
              <div className="space-y-2">
                {stats.dailySessions.slice(-10).map((day, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-neutral-400">
                      {new Date(day.date).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-white">
                        {day.sessions} sesiones
                      </span>
                      <span className="text-neutral-500">
                        ({day.unique_visitors} únicos)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500 lowercase">
                no hay datos de sesiones diarias
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
