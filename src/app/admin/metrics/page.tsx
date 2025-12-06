"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { authenticatedFetchJSON } from "@/lib/api-client";
import { StatsCards } from "./components/StatsCards";
import { SessionsChart } from "./components/SessionsChart";
import { PerformanceChart } from "./components/PerformanceChart";
import { DevicesChart } from "./components/DevicesChart";
import { BrowsersChart } from "./components/BrowsersChart";
import { GeoMap } from "./components/GeoMap";
import { EventsChart } from "./components/EventsChart";

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
              analytics
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

        {/* Stats Cards */}
        <StatsCards overview={stats.overview} pageViews={stats.pageViews} />

        {/* Sessions Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              Sesiones en el Tiempo
            </h3>
            <p className="text-sm text-neutral-500 lowercase mt-1">
              Evolución de sesiones y visitantes únicos
            </p>
          </div>
          <div className="p-6">
            {stats.dailySessions.length > 0 ? (
              <SessionsChart data={stats.dailySessions} />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-neutral-500 lowercase">
                  no hay datos de sesiones
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Performance & Devices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
          >
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold lowercase text-white">
                Performance
              </h3>
              <p className="text-sm text-neutral-500 lowercase mt-1">
                Tiempos de carga promedio (ms)
              </p>
            </div>
            <div className="p-6">
              <PerformanceChart data={stats.performance} />
            </div>
          </motion.div>

          {/* Devices Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
          >
            <div className="p-6 border-b border-neutral-800">
              <h3 className="text-lg font-semibold lowercase text-white">
                Dispositivos
              </h3>
              <p className="text-sm text-neutral-500 lowercase mt-1">
                Distribución de visitantes por dispositivo
              </p>
            </div>
            <div className="p-6">
              <DevicesChart data={stats.overview} />
            </div>
          </motion.div>
        </div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              Distribución Geográfica
            </h3>
            <p className="text-sm text-neutral-500 lowercase mt-1">
              Visitantes por país
            </p>
          </div>
          <div className="p-6">
            <GeoMap countries={stats.topCountries} />
          </div>
        </motion.div>

        {/* Browsers & OS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              Navegadores y Sistemas Operativos
            </h3>
          </div>
          <div className="p-6">
            <BrowsersChart browsers={stats.browsers} os={stats.os} />
          </div>
        </motion.div>

        {/* Top Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              Eventos Principales
            </h3>
            <p className="text-sm text-neutral-500 lowercase mt-1">
              Interacciones más frecuentes
            </p>
          </div>
          <div className="p-6">
            <EventsChart events={stats.topEvents} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
