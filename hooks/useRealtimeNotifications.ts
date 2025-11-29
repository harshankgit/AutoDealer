import { useEffect, useState, useRef } from 'react';
import { useUser } from '@/context/user-context';

type NotificationItem = {
  id: string;
  type: string;
  message: string;
  userId?: string;
  carId?: string;
  timestamp: Date;
  read: boolean;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  userId?: string;
  carId?: string;
  createdAt: Date;
  read: boolean;
};

const useRealtimeNotifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const pusherRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.token || !user?.id) return;

    const initPusher = async () => {
      try {
        const Pusher = (await import('pusher-js')).default;
        pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          authEndpoint: '/api/pusher/auth',
          auth: {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          },
        });

        channelRef.current = pusherRef.current.subscribe(`notification-${user.id}`);

        channelRef.current.bind('new-notification', (data: any) => {
          const newNotification: NotificationItem = {
            ...data.notification,
            id: data.notification.id || Date.now().toString(),
            timestamp: new Date(data.notification.createdAt || Date.now()),
            read: false,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          setConnectionStatus('connected');
        });

        channelRef.current.bind('new-chat-message', (data: any) => {
          const newNotification: NotificationItem = {
            ...data,
            id: `chat-${Date.now()}`,
            type: data.type || 'chat',
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          setConnectionStatus('connected');
        });

        channelRef.current.bind('new-booking', (data: any) => {
          const newNotification: NotificationItem = {
            ...data,
            id: `booking-${Date.now()}`,
            type: data.type || 'booking',
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
          };

          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          setConnectionStatus('connected');
        });

        channelRef.current.bind('notification-unread-count', (data: any) => {
          setUnreadCount(data.count || 0);
        });

        channelRef.current.bind('pusher:subscription_succeeded', () => {
          setConnectionStatus('connected');
        });

        channelRef.current.bind('pusher:subscription_error', () => {
          setConnectionStatus('disconnected');
        });
      } catch (error) {
        console.error('Pusher initialization error:', error);
        setConnectionStatus('disconnected');
      }
    };

    initPusher();

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        if (pusherRef.current) {
          pusherRef.current.unsubscribe(`notification-${user.id}`);
        }
      }
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Function to add a local notification (fallback if needed)
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
};

export default useRealtimeNotifications;