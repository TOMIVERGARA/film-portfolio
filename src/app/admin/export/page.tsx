"use client";

import { motion } from "framer-motion";
import { Download, FileJson, FileSpreadsheet, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportPage() {
  const handleExport = (format: string) => {
    // TODO: Implementar lógica de exportación
    alert(`Exportando en formato ${format}...`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-['Playfair'] font-bold lowercase text-white">
            exportar datos
          </h1>
          <p className="text-neutral-400 lowercase">
            descarga la información de tu portfolio en diferentes formatos
          </p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-800">
                  <FileJson className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold lowercase text-white">
                    formato json
                  </h3>
                  <p className="text-sm text-neutral-400 lowercase">
                    datos estructurados en formato json
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleExport("JSON")}
                className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                exportar json
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-800">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold lowercase text-white">
                    formato csv
                  </h3>
                  <p className="text-sm text-neutral-400 lowercase">
                    compatible con excel y sheets
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleExport("CSV")}
                className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                exportar csv
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Backup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-neutral-950/40 backdrop-blur-lg p-6 border border-neutral-800"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neutral-800">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold lowercase text-white">
                  backup completo
                </h3>
                <p className="text-sm text-neutral-400 lowercase">
                  descarga todos los datos y las imágenes originales
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleExport("BACKUP")}
              className="w-full bg-transparent hover:bg-neutral-600/20 rounded-none lowercase border border-neutral-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              crear backup completo
            </Button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-blue-900/20 backdrop-blur-sm p-6 border border-blue-400/20"
        >
          <h4 className="text-sm font-semibold lowercase text-blue-400 mb-2">
            información
          </h4>
          <p className="text-sm text-neutral-300 lowercase">
            las exportaciones incluirán toda la información de tus rolls,
            fotografías, notas y metadatos. los archivos de imagen solo se
            incluyen en el backup completo.
          </p>
        </motion.div>

        {/* Recent Exports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-neutral-950/40 backdrop-blur-lg border border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold lowercase text-white">
              exportaciones recientes
            </h3>
          </div>
          <div className="p-8">
            <p className="text-center text-neutral-500 lowercase">
              no hay exportaciones previas
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
