"use client";

import { motion } from "framer-motion";
import { CirclePlus, ChartArea, Download, Image } from "lucide-react";
import Link from "next/link";

export default function AdminHomePage() {
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
            bienvenido al panel de administración de tu portfolio analógico
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Image className="w-8 h-8 text-neutral-400" />
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <h3 className="text-sm text-neutral-400 lowercase">
              total de rolls
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Image className="w-8 h-8 text-neutral-400" />
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <h3 className="text-sm text-neutral-400 lowercase">
              total de fotos
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
              <span className="text-3xl font-bold text-white">0</span>
            </div>
            <h3 className="text-sm text-neutral-400 lowercase">
              último roll subido
            </h3>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold lowercase text-white">
            acciones rápidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/add-roll">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
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

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold lowercase text-white">
            actividad reciente
          </h2>
          <div className="bg-neutral-950/40 backdrop-blur-lg p-8 border border-neutral-800">
            <p className="text-center text-neutral-500 lowercase">
              no hay actividad reciente
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
