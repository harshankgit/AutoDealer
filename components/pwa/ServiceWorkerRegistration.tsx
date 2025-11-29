'use client';

import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        } catch (error) {
          console.log('ServiceWorker registration failed: ', error);
        }
      };

      // Register service worker after the page loads
      if (window) {
        window.addEventListener('load', registerServiceWorker);
      }
    }
  }, []);

  return null; // This component doesn't render anything
};

export default ServiceWorkerRegistration;