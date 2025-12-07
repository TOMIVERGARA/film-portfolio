"use client";

import { motion } from "framer-motion";
import { Zap, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { authenticatedFetchJSON, authenticatedDelete } from "@/lib/api-client";
import { StatsCards } from "./components/StatsCards";
import { SessionsChart } from "./components/SessionsChart";
import { PerformanceChart } from "./components/PerformanceChart";
import { DevicesChart } from "./components/DevicesChart";
import { BrowsersChart } from "./components/BrowsersChart";
import { GeoMap } from "./components/GeoMap";
import { EventsChart } from "./components/EventsChart";
import { MetricsPageSkeleton } from "./components/SkeletonLoaders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/components/ui/notify";

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
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isClearing, setIsClearing] = useState(false);

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

  const handleClearMetrics = async () => {
    if (confirmText.toLowerCase() !== "eliminar") {
      showError("Por favor escribe 'eliminar' para confirmar");
      return;
    }

    setIsClearing(true);
    try {
      await authenticatedDelete("/pages/api/analytics/clear");

      showSuccess("Todas las métricas han sido eliminadas");
      setClearDialogOpen(false);
      setConfirmText("");

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error("Error clearing metrics:", error);
      showError("Error al eliminar las métricas");
    } finally {
      setIsClearing(false);
    }
  };

  if (loading) {
    return <MetricsPageSkeleton />;
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
    <div className="max-w-7xl mx-auto mb-10">
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

          <div className="flex gap-2">
            {/* Period Selector */}
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
            {/* Clear Metrics Button */}
            <button
              onClick={() => setClearDialogOpen(true)}
              className="px-4 py-2 text-sm lowercase transition-colors bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/50 flex items-center gap-2"
            >
              <Trash2 size={16} />
            </button>
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

      {/* Clear Metrics Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="bg-neutral-950 border border-red-900 rounded-none">
          <DialogHeader>
            <DialogTitle className="text-red-400 lowercase">
              eliminar todas las métricas
            </DialogTitle>
            <DialogDescription className="text-neutral-400 lowercase">
              <span className="font-bold text-red-400">atención:</span> estás a
              punto de eliminar{" "}
              <span className="font-bold">todas las métricas de analytics</span>
              .
              <br />
              <br />
              esta acción es{" "}
              <span className="text-red-400 font-bold">irreversible</span> y
              eliminará permanentemente:
              <ul className="mt-2 space-y-1">
                <li>- todas las sesiones de visitantes</li>
                <li>- todas las vistas de páginas</li>
                <li>- todos los eventos registrados</li>
                <li>- todas las métricas de performance</li>
              </ul>
              <br />
              escribe <span className="text-red-400 font-bold">
                eliminar
              </span>{" "}
              para confirmar:
            </DialogDescription>
          </DialogHeader>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="escribe 'eliminar'"
            className="bg-transparent border-red-900 text-white lowercase rounded-none"
            autoFocus
          />

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setClearDialogOpen(false);
                setConfirmText("");
              }}
              className="rounded-none border border-neutral-700"
              disabled={isClearing}
            >
              cancelar
            </Button>
            <Button
              onClick={handleClearMetrics}
              className="rounded-none bg-red-900 hover:bg-red-800 text-white"
              disabled={isClearing || confirmText.toLowerCase() !== "eliminar"}
            >
              {isClearing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  eliminando métricas...
                </>
              ) : (
                "eliminar todas las métricas"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
