"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingScreen = ({ progress }: { progress: number }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-neutral-950 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-left prose prose-invert prose-neutral">
        <h1 className="font-serif">we are preparing the experience...</h1>
        <p>
          this may take a bit, but trust me, <i>its ALL worth it.</i>
          <br />
          preloading all the content allows for a smoother experience, so you
          can fully immerse yourself without interruptions.
        </p>
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
          progress... {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
};
