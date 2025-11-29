import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

interface NotificationBadgeProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const handleNotificationClick = (notification: NotificationItem) => {
    onMarkAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifications
          {unreadCount > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs underline"
              onClick={onMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <DropdownMenuItem className="text-center text-gray-500 py-4">
              No notifications
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                <div className="flex flex-col space-y-1 w-full">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{notification.message}</p>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;