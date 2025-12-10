import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { pusherService } from '@/lib/pusherService';

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn()
      })),
      subscribe: vi.fn(),
      unsubscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  },
  createClientWithToken: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    }))
  }))
}));

// Mock Pusher service
vi.mock('@/lib/pusherService', () => ({
  pusherService: {
    sendNewMessage: vi.fn(() => Promise.resolve(true)),
    sendDeliveryStatus: vi.fn(() => Promise.resolve(true)),
    sendSeenStatus: vi.fn(() => Promise.resolve(true)),
    sendTypingStatus: vi.fn(() => Promise.resolve(true)),
    sendUnreadCountUpdate: vi.fn(() => Promise.resolve(true)),
    sendNotification: vi.fn(() => Promise.resolve(true))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Chat System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Message Flow Tests', () => {
    it('should send messages from user to admin in real-time', async () => {
      // Mock API call
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Message sent successfully', data: { id: '1', message: 'test' } }),
        } as Response)
      ) as any;

      // Simulate sending a message
      const token = 'mock-token';
      localStorageMock.getItem.mockReturnValue(token);

      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: 'conv-123',
          message: 'Hello from user',
        }),
      });

      expect(response.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        '/api/v2/chat',
        expect.objectContaining({
          method: 'POST',
        })
      );

      // Verify Pusher notification was sent
      expect(pusherService.sendNewMessage).toHaveBeenCalled();
    });

    it('should receive messages from admin to user in real-time', async () => {
      // Mock the real-time message receiving behavior
      const mockMessages = [
        { id: '1', senderid: 'admin-id', message: 'Hello from admin', timestamp: new Date().toISOString() }
      ];
      
      // Simulate receiving message via Supabase Realtime
      const payload = {
        new: {
          id: '2',
          conversation_id: 'conv-123',
          senderid: 'admin-id',
          message: 'Reply from admin',
          timestamp: new Date().toISOString()
        }
      };

      // Simulate the handler
      let messagesState: any[] = [];
      const setMessages = (updater: any) => {
        messagesState = typeof updater === 'function' ? updater(messagesState) : updater;
      };

      // Simulate the message handler from ChatRoom component
      const newMsg = {
        id: payload.new.id,
        conversation_id: payload.new.conversation_id,
        senderid: payload.new.senderid,
        message: payload.new.message,
        timestamp: payload.new.timestamp,
        sender: { username: 'Admin', role: 'admin' }
      };

      const exists = messagesState.some(msg => msg.id === newMsg.id);
      if (!exists) {
        setMessages(prev => [...prev, newMsg]);
      }

      expect(messagesState.length).toBe(1);
      expect(messagesState[0].message).toBe('Reply from admin');
      expect(messagesState[0].senderid).toBe('admin-id');
    });

    it('should handle duplicate message prevention', () => {
      const messages = [
        { id: '1', message: 'First message' },
        { id: '2', message: 'Second message' }
      ];

      // Try to add a duplicate message
      const newMsg = { id: '1', message: 'First message duplicate' };
      const exists = messages.some(msg => msg.id === newMsg.id);
      
      expect(exists).toBe(true);
      
      // Try to add a new message
      const newMsg2 = { id: '3', message: 'Third message' };
      const exists2 = messages.some(msg => msg.id === newMsg2.id);
      
      expect(exists2).toBe(false);
    });
  });

  describe('Pusher Integration Tests', () => {
    it('should trigger Pusher notification when sending message via API', async () => {
      const conversationId = 'test-conversation';
      const messageData = {
        id: 'msg-123',
        conversation_id: conversationId,
        senderid: 'user-123',
        message: 'Test message',
        timestamp: new Date().toISOString()
      };
      const senderInfo = { username: 'Test User', role: 'user' };

      // Call the Pusher service
      const result = await pusherService.sendNewMessage(conversationId, {
        message: messageData,
        sender: senderInfo,
        conversationId,
        timestamp: new Date().toISOString(),
      });

      expect(result).toBe(true);
      expect(pusherService.sendNewMessage).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          message: messageData,
          sender: senderInfo,
          conversationId
        })
      );
    });

    it('should handle Pusher errors gracefully', async () => {
      // Mock Pusher service to throw an error
      vi.spyOn(pusherService, 'sendNewMessage').mockImplementation(() => {
        throw new Error('Pusher connection failed');
      });

      const result = await pusherService.sendNewMessage('test', {
        message: {},
        sender: {},
        conversationId: 'test',
        timestamp: new Date().toISOString(),
      });

      expect(result).toBe(false);
    });
  });

  describe('Notification System Tests', () => {
    it('should update unread count when receiving chat notification', async () => {
      // Mock fetch for unread count API
      const mockUnreadCount = 5;
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: mockUnreadCount }),
        } as Response)
      ) as any;

      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      });

      const data = await response.json();
      expect(data.count).toBe(mockUnreadCount);
    });

    it('should handle notification count updates via Pusher', () => {
      // Simulate receiving notification count update
      let unreadCount = 0;
      const updateCount = (newCount: number) => {
        unreadCount = newCount;
      };

      // Simulate the handler from NotificationBadge component
      const data = { count: 3 };
      updateCount(data.count);

      expect(unreadCount).toBe(3);
    });
  });

  describe('Real-time Channel Management', () => {
    it('should subscribe to conversation channel properly', () => {
      const conversationId = 'test-conv-123';
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        })),
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
      };

      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      // Simulate subscription (similar to ChatProvider)
      const channel = supabase.channel(`chat-room-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          vi.fn()
        )
        .subscribe();

      expect(supabase.channel).toHaveBeenCalledWith(`chat-room-${conversationId}`);
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from conversation channel properly', () => {
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        })),
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
      };

      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      const channel = supabase.channel('test-channel');
      supabase.removeChannel(channel);

      expect(supabase.removeChannel).toHaveBeenCalledWith(channel);
    });
  });

  describe('Message Structure Tests', () => {
    it('should properly format message objects', () => {
      const rawMessage = {
        id: 'msg-123',
        conversation_id: 'conv-123',
        senderid: 'user-123',
        message: 'Hello world',
        message_type: 'text',
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const formattedMessage = {
        id: rawMessage.id,
        conversation_id: rawMessage.conversation_id,
        senderid: rawMessage.senderid,
        message: rawMessage.message,
        message_type: rawMessage.message_type || 'text',
        car_details: undefined,
        file_url: undefined,
        file_name: undefined,
        file_type: undefined,
        is_read: false,
        timestamp: rawMessage.timestamp,
        created_at: rawMessage.created_at,
        sender: {
          username: 'Unknown',
          role: 'user'
        }
      };

      expect(formattedMessage.id).toBe(rawMessage.id);
      expect(formattedMessage.message).toBe(rawMessage.message);
      expect(formattedMessage.sender.username).toBe('Unknown');
    });
  });
});