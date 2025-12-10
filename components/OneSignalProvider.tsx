'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

const OneSignalProvider = () => {
  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window !== 'undefined') {
        // Initialize OneSignal
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
          allowLocalhostAsSecureOrigin: true, // For development
        });

        // Optional: Handle notification events
        OneSignal.Notifications.addEventListener('click', (event: any) => {
          console.log('OneSignal notification clicked:', event);
          // Handle notification click (e.g., navigate to chat)
          if (event?.notification?.additionalData?.conversationId) {
            window.location.href = `/chat/${event.notification.additionalData.conversationId}`;
          }
        });

        OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
          console.log('OneSignal notification permission changed:', permission);
        });
      }
    };

    initOneSignal();
  }, []);

  return null; // This component doesn't render anything
};

export default OneSignalProvider;