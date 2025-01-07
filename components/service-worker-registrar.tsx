"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        process.env.NODE_ENV === "production"
      ) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          
          // Check if there's an update available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show refresh prompt if needed
                  console.log('New content is available; please refresh.');
                }
              });
            }
          });

          console.log("Service Worker registered successfully.");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    registerServiceWorker();
  }, []);

  return null;
} 