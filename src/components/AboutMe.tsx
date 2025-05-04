"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin } from "lucide-react";

interface AboutMeProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AboutMe = ({ isVisible, onClose }: AboutMeProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl =
    "https://res.cloudinary.com/dobyiptl5/image/upload/f_auto,q_auto,w_800/profile_ejfesb.jpg";

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Intenta obtener de cache primero
        const cache = await caches.open("portfolio-v1");
        const cachedResponse = await cache.match(imageUrl);

        if (cachedResponse) {
          setImageLoaded(true);
          return;
        }

        // Si no está en cache, carga y guarda
        const img = new Image();
        img.src = imageUrl + "?v=1"; // Versión para forzar cache
        img.fetchPriority = "high";
        img.onload = () => {
          cache.put(imageUrl, new Response(img.src));
          setImageLoaded(true);
        };
      } catch (error) {
        console.error("Error cargando imagen:", error);
      }
    };

    if (isVisible) loadImage();
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center">
            {/* Columna de la imagen */}
            <motion.div
              className="w-full md:w-2/4 p-4 flex justify-center ml-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.2 }} // Pequeño delay para mejor flujo
            >
              <img
                src={imageUrl}
                alt="Profile"
                className={`max-w-full h-auto object-cover aspect-square transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute w-full h-full bg-gray-200 animate-pulse aspect-square" />
              )}
            </motion.div>

            {/* Columna del texto (3/4) */}
            <motion.div
              className="w-full md:w-3/4 max-w-2xl p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.2 }} // Pequeño delay para mejor flujo
            >
              <div className=" p-8 rounded-lg">
                <h3 className="font-medium text-3xl mb-0">hello, i'm</h3>
                <h1 className="font-bold text-7xl mb-4 font-serif">
                  tomas vergara
                </h1>
                <p className="mb-6 text-justify l">
                  i'm a film <i>photography enthusiast</i> and systems
                  engineering student from córdoba, argentina. i shoot mostly on
                  35mm, always chasing that raw, imperfect beauty that only
                  analog can offer. for me, photography is a way to slow things
                  down in a fast-paced world; an intentional pause to notice the
                  details and stories that often go unseen. whether i'm writing
                  code or developing film, i'm always drawn to how things work,
                  how they feel, and how they connect. <br /> <br />
                  <i>
                    hope you enjoy browsing through my photos as much as i
                    enjoyed capturing them.
                  </i>
                </p>

                <div className="flex justify-start">
                  <a
                    href="https://www.instagram.com/tomaaisu_"
                    target="_blank"
                    className="mr-3"
                  >
                    <Instagram className="w-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/tomasvergara0"
                    target="_blank"
                  >
                    <Linkedin className="w-5 ml-3 " />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
