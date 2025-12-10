import PusherServer from 'pusher';

const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
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
      console.log('Pusher service: Attempting to trigger new-message event', {
        channel: `chat-${conversationId}`,
        messageData
      }); // Debug log
      const result = await pusher.trigger(`chat-${conversationId}`, 'new-message', messageData);
      console.log('Pusher service: New-message event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending new message via Pusher:', error);
      return false;
    }
  },

  // Send message delivery status to sender
  async sendDeliveryStatus(conversationId: string, deliveryData: any) {
    try {
      console.log('Pusher service: Attempting to trigger message-delivered event', {
        channel: `chat-${conversationId}`,
        deliveryData
      }); // Debug log
      const result = await pusher.trigger(`chat-${conversationId}`, 'message-delivered', deliveryData);
      console.log('Pusher service: Message-delivered event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending delivery status via Pusher:', error);
      return false;
    }
  },

  // Send message seen status to sender
  async sendSeenStatus(conversationId: string, seenData: any) {
    try {
      console.log('Pusher service: Attempting to trigger message-seen event', {
        channel: `chat-${conversationId}`,
        seenData
      }); // Debug log
      const result = await pusher.trigger(`chat-${conversationId}`, 'message-seen', seenData);
      console.log('Pusher service: Message-seen event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending seen status via Pusher:', error);
      return false;
    }
  },

  // Send typing status to a conversation
  async sendTypingStatus(conversationId: string, typingData: TypingEvent) {
    try {
      console.log('Pusher service: Attempting to trigger typing-status event', {
        channel: `chat-${conversationId}`,
        typingData
      }); // Debug log
      const result = await pusher.trigger(`chat-${conversationId}`, 'typing-status', typingData);
      console.log('Pusher service: Typing-status event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending typing status via Pusher:', error);
      return false;
    }
  },

  // Send unread count update to a user
  async sendUnreadCountUpdate(userId: string, countData: UnreadCountEvent) {
    try {
      console.log('Pusher service: Attempting to trigger unread-count-update event', {
        channel: `user-${userId}`,
        countData
      }); // Debug log
      const result = await pusher.trigger(`user-${userId}`, 'unread-count-update', countData);
      console.log('Pusher service: Unread-count-update event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending unread count update via Pusher:', error);
      return false;
    }
  },

  // Send notification to a user
  async sendNotification(userId: string, notificationData: NotificationEvent) {
    try {
      console.log('Pusher service: Attempting to trigger new-notification event', {
        channel: `notification-${userId}`,
        notificationData
      }); // Debug log
      const result = await pusher.trigger(`notification-${userId}`, 'new-notification', notificationData);
      console.log('Pusher service: New-notification event triggered successfully', result); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending notification via Pusher:', error);
      return false;
    }
  }
};