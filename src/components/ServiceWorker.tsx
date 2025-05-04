"use client";

import { useEffect } from "react";

export const ServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registrado:", registration.scope);
        })
        .catch((err) => {
          console.error("Error registrando ServiceWorker:", err);
        });
    }
  }, []);

  return null;
};
