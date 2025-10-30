"use client";

import { motion } from "framer-motion";
import { ChartArea, TrendingUp, Image, Calendar } from "lucide-react";

export default function MetricsPage() {
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
          <h1 className="text-4xl font-['Playfair'] font-bold lowercase text-white">
            métricas y estadísticas
          </h1>
          <p className="text-neutral-400 lowercase">
            análisis detallado de tu portfolio analógico
          </p>
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
              <Image className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-neutral-400 lowercase">total rolls</p>
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
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-neutral-400 lowercase">total fotos</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-6 h-6 text-neutral-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-sm text-neutral-400 lowercase">este mes</p>
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
              <p className="text-3xl font-bold text-white">0%</p>
              <p className="text-sm text-neutral-400 lowercase">crecimiento</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4">
              rolls por mes
            </h3>
            <div className="h-64 flex items-center justify-center text-neutral-500">
              <p className="lowercase">gráfico en desarrollo</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold lowercase text-white mb-4">
              filmstocks más usados
            </h3>
            <div className="h-64 flex items-center justify-center text-neutral-500">
              <p className="lowercase">gráfico en desarrollo</p>
            </div>
          </motion.div>
        </div>

        {/* Recent Rolls Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              rolls recientes
            </h3>
          </div>
          <div className="p-8">
            <p className="text-center text-neutral-500 lowercase">
              no hay datos disponibles
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
