import { useCallback } from 'react';
import { useUser } from '@/context/user-context';

interface NotificationData {
  eventType: string;
  data: any;
  targetUserId: string;
}

export const useRealTimeNotifications = () => {
  const { user } = useUser();

  const sendNotification = useCallback(async (data: NotificationData) => {
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/notifications/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending real-time notification:', error);
      throw error;
    }
  }, [user]);

  return { sendNotification };
};