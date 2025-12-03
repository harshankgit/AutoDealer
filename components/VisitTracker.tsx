// components/VisitTracker.tsx
'use client';

import { useEffect } from 'react';
import { getDeviceId } from '@/utils/deviceId';

export default function VisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      const deviceId = getDeviceId();
      
      // Don't track server-side
      if (deviceId === 'server-side') return;

      try {
        const deviceType = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          ? "Mobile"
          : "Desktop";

        await fetch("/api/track-visit", {
          method: "POST",
          body: JSON.stringify({
            deviceId,
            browser: navigator.userAgent,
            os: navigator.platform,
            deviceType,
          }),
          headers: { 
            "Content-Type": "application/json" 
          },
        });
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    trackVisit();
  }, []);

  return null; // This component doesn't render anything
}