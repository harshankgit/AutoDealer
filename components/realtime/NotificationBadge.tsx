'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize unread count
    const fetchUnreadCount = async () => {
      if (!user.token) return;

      try {
        const response = await fetch(`/api/notifications/unread-count`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Setup Pusher listener for notification count updates
    const pusher = typeof window !== 'undefined' ? require('pusher-js') : null;

    if (pusher && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const pusherInstance = new pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: '/api/pusher/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      });

      const channel = pusherInstance.subscribe(`notification-${user.id}`);

      // Listen for chat message notifications specifically
      channel.bind('new-chat-notification', (data: any) => {
        console.log('Received new chat notification via Pusher:', data);
        setUnreadCount(prev => prev + 1);
      });

      // Listen for general notification count updates
      channel.bind('notification-unread-count', (data: { count: number }) => {
        console.log('Received unread count update:', data.count);
        setUnreadCount(data.count);
      });

      // Listen for any new notifications
      channel.bind('new-notification', (data: any) => {
        console.log('Received new notification:', data);
        setUnreadCount(prev => prev + 1);
      });

      // Cleanup
      return () => {
        channel.unbind('new-chat-notification');
        channel.unbind('notification-unread-count');
        channel.unbind('new-notification');
        pusherInstance.unsubscribe(`notification-${user.id}`);
        pusherInstance.disconnect();
      };
    }
  }, [user]);

  if (unreadCount === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="relative"
      >
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative"
    >
      <Bell className="h-5 w-5" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </Button>
  );
}