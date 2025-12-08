"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin } from "lucide-react";
import { useAnalyticsContext } from "./AnalyticsProvider";

interface AboutMeProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AboutMe = ({ isVisible, onClose }: AboutMeProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { trackEvent } = useAnalyticsContext();
  const imageUrl =
    "https://res.cloudinary.com/dobyiptl5/image/upload/f_auto,q_auto,w_800/profile_ejfesb.jpg";

  useEffect(() => {
    const loadImage = async () => {
      const startTime = Date.now();

      try {
        // Intenta obtener de cache primero
        const cache = await caches.open("portfolio-v1");
        const cachedResponse = await cache.match(imageUrl);

        if (cachedResponse) {
          setImageLoaded(true);
          const loadTime = Date.now() - startTime;
          trackEvent({
            eventType: "about_me_image_loaded",
            eventCategory: "performance",
            eventLabel: "cached",
            eventValue: loadTime,
          });
          return;
        }

        // Si no está en cache, carga y guarda
        const img = new Image();
        img.src = imageUrl + "?v=1"; // Versión para forzar cache
        img.fetchPriority = "high";
        img.onload = () => {
          cache.put(imageUrl, new Response(img.src));
          setImageLoaded(true);
          const loadTime = Date.now() - startTime;
          trackEvent({
            eventType: "about_me_image_loaded",
            eventCategory: "performance",
            eventLabel: "network",
            eventValue: loadTime,
          });
        };
      } catch (error) {
        console.error("Error cargando imagen:", error);
      }
    };

    if (isVisible) {
      loadImage();
      // Track about me opened
      trackEvent({
        eventType: "about_me_opened",
        eventCategory: "engagement",
        eventLabel: "user_interaction",
      });
    }
  }, [isVisible, trackEvent]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 backdrop-blur-xl overflow-y-auto bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <div className="relative min-h-full flex items-center justify-center p-4 md:p-8">
            <div
              className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center md:items-start text-white py-8 md:py-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Columna de la imagen */}
              <motion.div
                className="w-full md:w-2/5 flex justify-center mb-6 md:mb-0 md:mr-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.2 }}
              >
                <div className="relative w-full max-w-xs md:max-w-md">
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className={`w-full h-auto object-cover aspect-square transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse aspect-square" />
                  )}
                </div>
              </motion.div>

              {/* Columna del texto */}
              <motion.div
                className="w-full md:w-3/5 md:flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.2 }}
              >
                <div className="p-4 md:p-8">
                  <h3 className="font-medium text-xl md:text-3xl mb-0 text-white">
                    hello, i'm
                  </h3>
                  <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 md:mb-6 font-serif leading-tight text-white">
                    tomas vergara
                  </h1>
                  <p className="mb-6 text-sm md:text-base text-justify leading-relaxed text-white">
                    i'm a film <i>photography enthusiast</i> and systems
                    engineering student from córdoba, argentina. i shoot mostly
                    on 35mm, always chasing that raw, imperfect beauty that only
                    analog can offer. for me, photography is a way to slow
                    things down in a fast-paced world; an intentional pause to
                    notice the details and stories that often go unseen. whether
                    i'm writing code or developing film, i'm always drawn to how
                    things work, how they feel, and how they connect. <br />{" "}
                    <br />
                    <i>
                      hope you enjoy browsing through my photos as much as i
                      enjoyed capturing them.
                    </i>
                  </p>

                  <div className="flex justify-start gap-6">
                    <a
                      href="https://www.instagram.com/tomaaisu_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:opacity-70 transition-opacity"
                      onClick={() =>
                        trackEvent({
                          eventType: "social_click",
                          eventCategory: "engagement",
                          eventLabel: "instagram",
                        })
                      }
                    >
                      <Instagram className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/tomasvergara0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:opacity-70 transition-opacity"
                      onClick={() =>
                        trackEvent({
                          eventType: "social_click",
                          eventCategory: "engagement",
                          eventLabel: "linkedin",
                        })
                      }
                    >
                      <Linkedin className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
