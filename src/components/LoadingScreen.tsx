"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingScreen = ({ progress }: { progress: number }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="spinner border-4 border-t-transparent rounded-full w-12 h-12 animate-spin mb-4"></div>
        <motion.div
          className="h-1 bg-white/20 w-64 mx-auto rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
        >
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
        <p className="mt-4 text-sm text-white/70">
          Cargando colección completa... {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
};
