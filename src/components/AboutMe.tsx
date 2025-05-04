"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin } from "lucide-react";

interface AboutMeProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AboutMe = ({ isVisible, onClose }: AboutMeProps) => {
  // Bloquear el scroll cuando el modal está abierto
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
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
          {/* Fondo con efecto frosted glass */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Contenedor principal centrado */}
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center">
            {/* Columna de la imagen (1/4) */}
            <div className="w-full md:w-2/4 p-4 flex justify-center ml-auto">
              <img
                src="https://res.cloudinary.com/dobyiptl5/image/upload/profile_ejfesb.jpg"
                alt="Profile"
                className="max-w-full h-auto  object-cover aspect-square"
              />
            </div>

            {/* Columna del texto (3/4) */}
            <div className="w-full md:w-3/4 max-w-2xl p-4">
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
