'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatProvider';
import { supabase, createClientWithToken } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

interface SupabaseMessage {
  id: string;
  conversation_id: string;
  senderid: string;
  message: string;
  message_type: string;
  car_details?: any;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  is_read: boolean;
  timestamp: string;
  created_at: string;
  users: {
    username: string;
    role: string;
  };
}

interface Message {
  id: string;
  conversation_id: string;
  senderid: string;
  message: string;
  message_type: string;
  car_details?: any;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  is_read: boolean;
  timestamp: string;
  created_at: string;
  sender: {
    username: string;
    role: string;
  };
}

interface ChatRoomProps {
  conversationId: string;
  currentUserId: string;
  currentUserRole: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ conversationId, currentUserId, currentUserRole }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { subscribeToConversation, unsubscribeFromConversation, typingUsers } = useChat();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentUserTyping = typingUsers[conversationId] || false;

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);

        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        // Create a supabase client with the user's token for RLS
        const supabaseWithAuth = createClientWithToken(token);

        // Fetch messages for this conversation (without join to avoid complex structure)
        const { data, error } = await supabaseWithAuth
          .from('chat_messages')
          .select(`
            id,
            conversation_id,
            senderid,
            message,
            message_type,
            car_details,
            file_url,
            file_name,
            file_type,
            is_read,
            timestamp,
            created_at
          `)
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          // For now, we'll fetch sender info separately for each message
          // But for efficiency, we'll just assign placeholder for now and real implementation would fetch users separately
          const transformedMessages: Message[] = data.map(item => ({
            id: item.id,
            conversation_id: item.conversation_id,
            senderid: item.senderid,
            message: item.message,
            message_type: item.message_type || 'text',
            car_details: item.car_details,
            file_url: item.file_url,
            file_name: item.file_name,
            file_type: item.file_type,
            is_read: item.is_read,
            timestamp: item.timestamp,
            created_at: item.created_at,
            sender: {
              username: 'User', // This would come from actual user data
              role: 'user'
            }
          }));
          setMessages(transformedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Subscribe to real-time messages
  useEffect(() => {
    subscribeToConversation(conversationId);

    return () => {
      unsubscribeFromConversation(conversationId);
    };
  }, [conversationId, subscribeToConversation, unsubscribeFromConversation]);

  // Handle incoming real-time messages via Supabase
  useEffect(() => {
    const channel = supabase
      .channel(`chat-room-messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Add the new message to the list
          setMessages(prev => {
            // Create a properly structured Message object from the payload
            const newMsg: Message = {
              id: payload.new.id,
              conversation_id: payload.new.conversation_id,
              senderid: payload.new.senderid,
              message: payload.new.message,
              message_type: payload.new.message_type || 'text',
              car_details: payload.new.car_details,
              file_url: payload.new.file_url,
              file_name: payload.new.file_name,
              file_type: payload.new.file_type,
              is_read: payload.new.is_read,
              timestamp: payload.new.timestamp,
              created_at: payload.new.created_at,
              sender: {
                username: payload.new.sender?.username || 'Unknown',
                role: payload.new.sender?.role || 'user'
              }
            };

            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) return prev;

            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Handle incoming real-time messages via Pusher (primary for cross-session notifications)
  useEffect(() => {
    const pusher = typeof window !== 'undefined' ? require('pusher-js') : null;

    if (pusher && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const pusherInstance = new pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: '/api/pusher/auth'
      });

      const channel = pusherInstance.subscribe(`chat-${conversationId}`);

      channel.bind('new-message', (data: any) => {
        if (data.message && data.conversationId === conversationId) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === data.message.id);
            if (exists) return prev;

            // Create new message object
            const newMsg = {
              id: data.message.id,
              conversation_id: data.message.conversation_id,
              senderid: data.message.senderid,
              message: data.message.message,
              message_type: data.message.message_type || 'text',
              car_details: data.message.car_details,
              file_url: data.message.file_url,
              file_name: data.message.file_name,
              file_type: data.message.file_type,
              is_read: data.message.is_read,
              timestamp: data.message.timestamp,
              created_at: data.message.created_at,
              sender: data.sender || {
                username: 'Unknown',
                role: 'user'
              }
            };

            // Only add if it's from a different user (to avoid duplication with local send)
            if (newMsg.senderid !== currentUserId) {
              return [...prev, newMsg];
            }
            return prev;
          });
        }
      });

      // Cleanup
      return () => {
        channel.unbind('new-message');
        pusherInstance.unsubscribe(`chat-${conversationId}`);
        pusherInstance.disconnect();
      };
    }
  }, [conversationId, currentUserId]);

  // Handle notification count updates
  useEffect(() => {
    const pusher = typeof window !== 'undefined' ? require('pusher-js') : null;

    if (pusher && process.env.NEXT_PUBLIC_PUSHER_KEY && currentUserId) {
      const pusherInstance = new pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: '/api/pusher/auth'
      });

      const channel = pusherInstance.subscribe(`notification-${currentUserId}`);

      channel.bind('new-chat-notification', (data: any) => {
        console.log('Received new chat notification:', data);
        // Update badge count or show notification as needed
      });

      channel.bind('notification-unread-count', (data: {count: number}) => {
        // Update unread notification count in UI if needed
        console.log('Unread notification count:', data.count);
      });

      // Cleanup
      return () => {
        channel.unbind('new-chat-notification');
        channel.unbind('notification-unread-count');
        pusherInstance.unsubscribe(`notification-${currentUserId}`);
        pusherInstance.disconnect();
      };
    }
  }, [currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      // Send stop typing indicator to server
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/v2/chat/typing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            isTyping: false,
          }),
        });
      } catch (error) {
        console.error('Error sending stop typing indicator:', error);
      }
    }, 1000); // Stop typing indicator after 1 second of inactivity

    // Send typing indicator to server
    const sendTyping = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await fetch('/api/v2/chat/typing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversationId,
            isTyping: true,
          }),
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    };

    sendTyping();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          message: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // The real-time listener will automatically add the message
      } else {
        console.error('Failed to send message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg border-b">
        <h3 className="font-semibold">Chat Room</h3>
        {isCurrentUserTyping && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Other user is typing...
          </div>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderid === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderid === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="text-sm">{msg.message}</div>
              <div className="text-xs opacity-70 mt-1">
                {msg.sender.username} • {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg p-2 resize-none h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;