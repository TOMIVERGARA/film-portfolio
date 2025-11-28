"use client";

import "./globals.css";
import { CanvasProvider, useCanvas } from "@/components/CanvasContext";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ServiceWorker } from "@/components/ServiceWorker";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") || pathname === "/login";

  return (
    <html lang="en">
      <body>
        {/* Sonner Toaster (shadcn wrapper) - disponible globalmente */}
        {/* Uses components/ui/sonner.tsx added by shadcn */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore-next-line */}
        <Toaster />
        {isAdminRoute ? (
          // Admin routes and login: no CanvasProvider, no loading screen
          <>{children}</>
        ) : (
          // Public routes: with CanvasProvider and loading screen
          <CanvasProvider>
            <PreloadWrapper>{children}</PreloadWrapper>
            <ServiceWorker />
          </CanvasProvider>
        )}
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
