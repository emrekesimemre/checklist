'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js', {
          updateViaCache: 'none', // Always check for updates, don't use cache
        })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates immediately and then periodically
          registration.update();
          
          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                  // New service worker activated, reload to get fresh chunks
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
      
      // Handle chunk loading errors - reload page to get fresh chunks
      window.addEventListener('error', (event) => {
        if (
          event.message?.includes('ChunkLoadError') ||
          event.message?.includes('Loading chunk') ||
          (event.target as HTMLElement)?.tagName === 'SCRIPT'
        ) {
          const script = event.target as HTMLScriptElement;
          if (script?.src?.includes('/_next/static/')) {
            console.warn('Chunk load error detected, reloading page...');
            // Small delay to avoid infinite reload loops
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      }, true);
    }
  }, []);

  return null;
}

