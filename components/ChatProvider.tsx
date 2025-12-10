'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatContextType {
  isRealtimeConnected: boolean;
  typingUsers: Record<string, boolean>; // conversationId -> typing status
  unreadCounts: Record<string, number>; // conversationId -> unread count
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  subscribeToTyping: (conversationId: string) => void;
  unsubscribeFromTyping: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [activeChannels, setActiveChannels] = useState<Record<string, any>>({});
  const [typingChannels, setTypingChannels] = useState<Record<string, any>>({});

  useEffect(() => {
    setIsRealtimeConnected(true);

    return () => {
      // Clean up all channels when component unmounts
      Object.values(activeChannels).forEach(channel => {
        supabase.removeChannel(channel);
      });
      Object.values(typingChannels).forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsRealtimeConnected(false);
    };
  }, []);

  // Function to subscribe to a specific conversation
  const subscribeToConversation = (conversationId: string) => {
    if (activeChannels[conversationId]) {
      // Already subscribed
      return;
    }

    const channel = supabase
      .channel(`chat-room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log(`New message in conversation ${conversationId}:`, payload.new);
          // Here you can trigger notifications or update state as needed
        }
      )
      .subscribe();

    setActiveChannels(prev => ({
      ...prev,
      [conversationId]: channel
    }));
  };

  // Function to unsubscribe from a specific conversation
  const unsubscribeFromConversation = (conversationId: string) => {
    const channel = activeChannels[conversationId];
    if (channel) {
      supabase.removeChannel(channel);
      setActiveChannels(prev => {
        const newChannels = { ...prev };
        delete newChannels[conversationId];
        return newChannels;
      });
    }
  };

  // Function to subscribe to typing indicators for a conversation
  const subscribeToTyping = (conversationId: string) => {
    if (typingChannels[conversationId]) {
      // Already subscribed
      return;
    }

    const channel = supabase
      .channel(`chat-typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log(`Typing indicator updated in conversation ${conversationId}:`, payload.new);
          setTypingUsers(prev => ({
            ...prev,
            [conversationId]: payload.new.is_typing
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log(`Typing indicator updated in conversation ${conversationId}:`, payload.new);
          setTypingUsers(prev => ({
            ...prev,
            [conversationId]: payload.new.is_typing
          }));
        }
      )
      .subscribe();

    setTypingChannels(prev => ({
      ...prev,
      [conversationId]: channel
    }));
  };

  // Function to unsubscribe from typing indicators
  const unsubscribeFromTyping = (conversationId: string) => {
    const channel = typingChannels[conversationId];
    if (channel) {
      supabase.removeChannel(channel);
      setTypingChannels(prev => {
        const newChannels = { ...prev };
        delete newChannels[conversationId];
        return newChannels;
      });
    }
  };

  const value: ChatContextType = {
    isRealtimeConnected,
    typingUsers,
    unreadCounts,
    subscribeToConversation,
    unsubscribeFromConversation,
    subscribeToTyping,
    unsubscribeFromTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};