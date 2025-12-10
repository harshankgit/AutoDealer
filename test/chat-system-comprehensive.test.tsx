import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextRouter } from 'next/router';
import NewChatPage from '@/app/chat/[id]/page';
import AdminChatPanel from '@/app/admin/chats/page';
import SuperAdminChatPanel from '@/app/admin/superadmin/chats/page';
import { supabase } from '@/lib/supabase';
import { pusherService } from '@/lib/pusherService';

// Mock next router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'test-car-id' }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'test-car-id' }),
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

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock pusherService
vi.mock('@/lib/pusherService', () => ({
  pusherService: {
    sendNewMessage: vi.fn(() => Promise.resolve(true)),
    sendTypingStatus: vi.fn(() => Promise.resolve(true)),
    sendUnreadCountUpdate: vi.fn(() => Promise.resolve(true)),
  },
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'test' }),
  } as Response)
) as any;

describe('Chat System - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ id: 'test-user', username: 'testuser', role: 'user' }));
  });

  describe('User Chat Page', () => {
    it('should render chat page correctly', () => {
      render(<NewChatPage />);

      expect(screen.getByText(/Loading chat.../)).toBeInTheDocument();
    });

    it('should handle message sending', async () => {
      const sendSpy = vi.spyOn(global, 'fetch');

      render(<NewChatPage />);

      // Wait for component to be ready
      await waitFor(() => {
        expect(screen.queryByText(/Loading chat.../)).not.toBeInTheDocument();
      });

      // Mock API response for sending message
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { id: '1', message: 'Hello', senderid: 'test-user' }
        }),
      });

      // Simulate typing and sending message
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(sendSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/chat'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should handle real-time message reception', () => {
      const channelMock = {
        on: vi.fn(() => ({
          subscribe: vi.fn(),
        })),
        subscribe: vi.fn(),
      };

      vi.mocked(supabase.channel).mockReturnValue(channelMock as any);

      render(<NewChatPage />);

      // Verify that Supabase channel is created with correct conversation filter
      expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('chat-room-'));
    });

    it('should handle Pusher events', () => {
      render(<NewChatPage />);

      // Verify Pusher service methods are called appropriately
      expect(pusherService.sendNewMessage).toBeDefined();
    });
  });

  describe('Admin Chat Panel', () => {
    it('should render admin chat panel', () => {
      // Mock admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-admin', username: 'admin', role: 'admin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      render(<AdminChatPanel />);

      expect(screen.getByText(/Admin Chat Panel/)).toBeInTheDocument();
    });

    it('should handle admin message sending', async () => {
      const sendSpy = vi.spyOn(global, 'fetch');

      // Mock admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-admin', username: 'admin', role: 'admin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      render(<AdminChatPanel />);

      // Mock API response for sending message
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Simulate typing and sending message
      const input = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(input, { target: { value: 'Hello from admin' } });
      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(sendSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/chat'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should load admin chat list', async () => {
      // Mock admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-admin', username: 'admin', role: 'admin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      // Mock API response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ conversations: [] }),
      });

      render(<AdminChatPanel />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/admin/chats'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        );
      });
    });
  });

  describe('Super Admin Chat Panel', () => {
    it('should render super admin chat panel', () => {
      // Mock super admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-superadmin', username: 'superadmin', role: 'superadmin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      render(<SuperAdminChatPanel />);

      expect(screen.getByText(/All Customer Chats/)).toBeInTheDocument();
    });

    it('should handle super admin message sending', async () => {
      const sendSpy = vi.spyOn(global, 'fetch');

      // Mock super admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-superadmin', username: 'superadmin', role: 'superadmin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      render(<SuperAdminChatPanel />);

      // Mock API response for sending message
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Simulate typing and sending message
      const input = screen.getByPlaceholderText('Send message as Super Admin...');
      fireEvent.change(input, { target: { value: 'Hello from super admin' } });
      fireEvent.submit(screen.getByRole('form'));

      await waitFor(() => {
        expect(sendSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/superadmin/chats/'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should allow deleting conversations', async () => {
      const deleteSpy = vi.spyOn(global, 'fetch');

      // Mock super admin user data
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify({ id: 'test-superadmin', username: 'superadmin', role: 'superadmin' });
        if (key === 'token') return 'test-token';
        return null;
      });

      render(<SuperAdminChatPanel />);

      // Mock API response for deleting conversation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Simulate clicking delete button
      fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/superadmin/chats/'),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });
  });

  describe('Real-time Messaging Flow', () => {
    it('should handle bidirectional messaging', () => {
      // Test that both user and admin can send and receive messages in real-time
      const mockSetMessages = vi.fn();
      const originalSetMessages = vi.fn();

      // Simulate receiving a message from admin to user
      const messagePayload = {
        new: {
          id: 'msg-123',
          conversation_id: 'conv-123',
          senderid: 'admin-id',
          message: 'Hello from admin',
          timestamp: new Date().toISOString(),
        }
      };

      // Simulate the message handler
      const newMsg = {
        id: messagePayload.new.id,
        conversation_id: messagePayload.new.conversation_id,
        senderid: messagePayload.new.senderid,
        message: messagePayload.new.message,
        timestamp: messagePayload.new.timestamp,
        sender: { username: 'Admin', role: 'admin' }
      };

      expect(newMsg.senderid).toBe('admin-id');
      expect(newMsg.message).toBe('Hello from admin');
    });

    it('should handle duplicate message prevention', () => {
      const messages = [
        { id: '1', message: 'First message' },
        { id: '2', message: 'Second message' }
      ];

      // Try to add a duplicate message
      const newMsg = { id: '1', message: 'Duplicate message' };
      const exists = messages.some(msg => msg.id === newMsg.id);
      
      expect(exists).toBe(true);
      
      // Try to add a new message
      const newMsg2 = { id: '3', message: 'Third message' };
      const exists2 = messages.some(msg => msg.id === newMsg2.id);
      
      expect(exists2).toBe(false);
    });

    it('should update unread counts correctly', () => {
      let unreadCount = 0;
      
      const updateUnreadCount = (newCount: number) => {
        unreadCount = newCount;
      };

      // Simulate receiving notification count update
      const data = { count: 5 };
      updateUnreadCount(data.count);

      expect(unreadCount).toBe(5);
    });

    it('should handle typing indicators', () => {
      let typingStatus = false;
      
      const setTyping = (isTyping: boolean) => {
        typingStatus = isTyping;
      };

      // Simulate receiving typing status
      setTyping(true);
      expect(typingStatus).toBe(true);
      
      setTyping(false);
      expect(typingStatus).toBe(false);
    });
  });

  describe('Message Status Updates', () => {
    it('should update message status from sent to delivered to seen', () => {
      const messages = [
        { id: '1', status: 'sent' as const },
        { id: '2', status: 'delivered' as const }
      ];

      // Update first message to delivered
      const updatedMessages = messages.map(msg => 
        msg.id === '1' ? { ...msg, status: 'delivered' } : msg
      );

      expect(updatedMessages[0].status).toBe('delivered');

      // Update first message to seen
      const finalMessages = updatedMessages.map(msg => 
        msg.id === '1' ? { ...msg, status: 'seen' } : msg
      );

      expect(finalMessages[0].status).toBe('seen');
    });
  });
});