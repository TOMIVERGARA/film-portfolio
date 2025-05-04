"use client";

import "./globals.css";
import { BottomBar } from "@/components/BottomBar";
import { CanvasProvider, useCanvas } from "@/components/CanvasContext";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ServiceWorker } from "@/components/ServiceWorker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CanvasProvider>
          <PreloadWrapper>
            {children}
            <BottomBar />
          </PreloadWrapper>
          <ServiceWorker />
        </CanvasProvider>
      </body>
    </html>
  );
}

const PreloadWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isAppReady, preloadProgress } = useCanvas();
  console.log("isAppReady", isAppReady);
  console.log("preloadProgress", preloadProgress);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isAppReady ? (
          <motion.div
            key="loading-screen"
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen progress={preloadProgress} />
          </motion.div>
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }} // Pequeño delay para mejor flujo
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
