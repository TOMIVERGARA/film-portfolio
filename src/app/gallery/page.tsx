"use client";

import { useCanvas } from "@/components/CanvasContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAnalyticsContext } from "@/components/AnalyticsProvider";
import { useEffect } from "react";

export default function GalleryPage() {
  const { rolls } = useCanvas();
  const { trackPageView } = useAnalyticsContext();

  useEffect(() => {
    trackPageView("/gallery", "Gallery View");
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-neutral-200 selection:bg-white/20">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-32">
        {/* Header fijo */}
        <header className="fixed top-0 left-0 w-full p-4 z-50 bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <Button
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-white/10 -ml-4"
              asChild
            >
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>back to canvas</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="pt-24 space-y-32">
          {rolls.map((roll, index) => (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              key={roll.id}
              className="space-y-12"
            >
              {/* Roll Header */}
              <div className="space-y-4 border-l-2 border-neutral-800 pl-6 py-2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                  {roll.metadata?.name || `Roll ${index + 1}`}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500 font-mono uppercase tracking-wider">
                  {roll.metadata?.date && <span>{roll.metadata.date}</span>}
                  {roll.metadata?.filmstock && (
                    <span>{roll.metadata.filmstock}</span>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-24">
                {roll.photos.map((photo) => (
                  <div key={photo.url} className="space-y-4 group">
                    <div className="relative w-full bg-[#0D0D0D]/50 rounded-none overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.photo_metadata?.notes || "Analog photo"}
                        className="w-full h-auto object-contain max-h-[85vh] mx-auto"
                        loading="lazy"
                      />
                    </div>
                    {photo.photo_metadata?.notes && (
                      <div className="flex justify-center">
                        <p className="text-neutral-500 italic text-center max-w-md">
                          *{photo.photo_metadata.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer simple */}
        <div className="mt-32 text-center text-neutral-600 font-mono text-xs uppercase tracking-widest">
          End of rolls
        </div>
      </div>
    </div>
  );
}
