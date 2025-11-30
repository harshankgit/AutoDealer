'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, Car, User, CheckCircle, MoreVertical } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface Notification {
  id: string;
  type: 'chat' | 'booking' | 'system' | 'car_update' | 'room_update' | 'new_user';
  title: string;
  message: string;
  sender?: string;
  carTitle?: string;
  roomName?: string;
  timestamp: string;
  read: boolean;
  userId?: string; // For admin notifications about specific users
}

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        } else {
          console.error('Failed to fetch notifications:', response.statusText);
          // Fallback to empty array if API fails
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user?.token) return;

    try {
      // Update notification as read in the backend
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update locally
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.token) return;

    try {
      // Mark all notifications as read in the backend
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update locally
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'booking':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'car_update':
        return <Car className="h-5 w-5 text-purple-500" />;
      case 'room_update':
        return <Car className="h-5 w-5 text-indigo-500" />;
      case 'new_user':
        return <User className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch(type) {
      case 'chat': return 'New Message';
      case 'booking': return 'Booking Update';
      case 'car_update': return 'Car Update';
      case 'room_update': return 'Showroom Update';
      case 'new_user': return 'New User';
      default: return 'Notification';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-l-4 ${
                  notification.read
                    ? 'border-l-gray-300 dark:border-l-gray-600'
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold ${
                            notification.read
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-900 dark:text-white font-bold'
                          }`}>
                            {notification.title || getNotificationTitle(notification.type)}
                          </h3>
                          {!notification.read && (
                            <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                          )}
                        </div>

                        <p className={`mt-1 text-gray-600 dark:text-gray-300 ${
                          notification.read ? '' : 'font-medium'
                        }`}>
                          {notification.message}
                        </p>

                        {(notification.carTitle || notification.roomName) && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Car className="h-4 w-4 mr-1" />
                            <span>{notification.carTitle || notification.roomName}</span>
                          </div>
                        )}

                        {notification.sender && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4 mr-1" />
                            <span>From: {notification.sender}</span>
                          </div>
                        )}

                        {notification.userId && user?.role !== 'user' && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="h-4 w-4 mr-1" />
                            <span>User ID: {notification.userId}</span>
                          </div>
                        )}

                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        aria-label="Mark as read"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {notification.read && (
                      <div className="text-gray-300 dark:text-gray-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}