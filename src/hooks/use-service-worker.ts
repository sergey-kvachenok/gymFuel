import { useEffect } from 'react';

/**
 * Custom hook to register and manage service worker
 * Handles registration, updates, and error cases
 */
export function useServiceWorker() {
  useEffect(() => {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker is not supported by this browser');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration.scope);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available, prompt user to reload
                console.log('New service worker available');
                // TODO: In the future, we could show a notification to the user
                // about the update and offer to reload the page
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    };

    registerServiceWorker();
  }, []);
}
