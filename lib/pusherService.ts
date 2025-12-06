import PusherServer from 'pusher';

const pusher = new PusherServer({
  appId: process.env.PUSHER_APPid!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export default pusher;

// Define types for our real-time events
export interface MessageEvent {
  message: any;
  sender: any;
  conversationId: string;
  timestamp: string;
}

export interface TypingEvent {
  userId: string;
  isTyping: boolean;
  conversationId: string;
}

export interface UnreadCountEvent {
  count: number;
}

export interface NotificationEvent {
  type: string;
  message: string;
  senderId?: string;
  senderName?: string;
  carId?: string;
  carTitle?: string;
  timestamp: string;
}

// Helper functions for common pusher operations
export const pusherService = {
  // Send a new message to a conversation
  async sendNewMessage(conversationId: string, messageData: MessageEvent) {
    try {
      await pusher.trigger(`chat-${conversationId}`, 'new-message', messageData);
      return true;
    } catch (error) {
      console.error('Error sending new message via Pusher:', error);
      return false;
    }
  },

  // Send typing status to a conversation
  async sendTypingStatus(conversationId: string, typingData: TypingEvent) {
    try {
      await pusher.trigger(`chat-${conversationId}`, 'typing-status', typingData);
      return true;
    } catch (error) {
      console.error('Error sending typing status via Pusher:', error);
      return false;
    }
  },

  // Send unread count update to a user
  async sendUnreadCountUpdate(userId: string, countData: UnreadCountEvent) {
    try {
      await pusher.trigger(`user-${userId}`, 'unread-count-update', countData);
      return true;
    } catch (error) {
      console.error('Error sending unread count update via Pusher:', error);
      return false;
    }
  },

  // Send notification to a user
  async sendNotification(userId: string, notificationData: NotificationEvent) {
    try {
      await pusher.trigger(`notification-${userId}`, 'new-notification', notificationData);
      return true;
    } catch (error) {
      console.error('Error sending notification via Pusher:', error);
      return false;
    }
  }
};