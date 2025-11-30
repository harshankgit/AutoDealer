'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';
import Pusher from 'pusher-js';
import { toast } from 'sonner';

interface RealTimeNotification {
  type: string;
  message: string;
  senderId?: string;
  senderName?: string;
  carId?: string;
  carTitle?: string;
  roomName?: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
}

interface RealTimeNotificationsProps {
  onNewNotification?: (notification: RealTimeNotification) => void;
}

export default function RealTimeNotifications({ onNewNotification }: RealTimeNotificationsProps) {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Configure Pusher
    const pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    });

    // Subscribe to the user's specific notification channel
    const channel = pusherInstance.subscribe(`notification-${user.id}`);

    // Listen for new chat messages
    channel.bind('new-chat-message', (data: RealTimeNotification) => {
      toast(`New message from ${data.senderName || 'someone'} about ${data.carTitle || 'a car'}`, {
        description: data.message,
        position: 'top-right',
      });

      if (onNewNotification) {
        onNewNotification(data);
      }
    });

    // Listen for general notifications
    channel.bind('new-notification', (data: RealTimeNotification) => {
      toast('New Notification', {
        description: data.message,
        position: 'top-right',
      });

      if (onNewNotification) {
        onNewNotification({
          ...data,
          type: 'general'
        });
      }
    });

    // Listen for new user interactions (especially for admins/superadmins)
    channel.bind('new-user-interaction', (data: RealTimeNotification) => {
      const title = user.role === 'admin' || user.role === 'superadmin'
        ? 'New User Interaction'
        : 'New Interaction';

      toast(title, {
        description: data.message,
        position: 'top-right',
      });

      if (onNewNotification) {
        onNewNotification({
          ...data,
          type: 'user_interaction'
        });
      }
    });

    // Listen for new bookings
    channel.bind('new-booking', (data: RealTimeNotification) => {
      toast('New Booking', {
        description: data.message,
        position: 'top-right',
      });

      if (onNewNotification) {
        onNewNotification({
          ...data,
          type: 'booking'
        });
      }
    });

    // Listen for car updates
    channel.bind('car-update', (data: RealTimeNotification) => {
      toast('Car Update', {
        description: data.message,
        position: 'top-right',
      });

      if (onNewNotification) {
        onNewNotification({
          ...data,
          type: 'car_update'
        });
      }
    });

    // Listen for unread count updates
    channel.bind('notification-unread-count', (data: {count: number}) => {
      // Update unread notification count in UI
      document.title = data.count > 0 ? `(${data.count}) CarSelling` : 'CarSelling';
    });

    // Connection events
    pusherInstance.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('Pusher connected');
    });

    pusherInstance.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('Pusher disconnected');
    });

    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      pusherInstance.unsubscribe(`notification-${user.id}`);
      pusherInstance.disconnect();
    };
  }, [user, onNewNotification]);

  return null; // This component doesn't render anything but manages real-time connections
}