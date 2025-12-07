"use client";

import { useEffect } from "react";

export const ServiceWorker = () => {
  useEffect(() => {
    // Solo registrar el SW en producción
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registrado:", registration.scope);
        })
        .catch((err) => {
          console.error("Error registrando ServiceWorker:", err);
        });
    } else {
      console.log("ServiceWorker deshabilitado en modo desarrollo");
    }
  }, []);

  return null;
};
