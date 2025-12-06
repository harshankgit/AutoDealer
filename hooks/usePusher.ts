"use client";

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

interface PusherEventCallback {
  (data: any): void;
}

export class PusherService {
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      // Add debug logging to help troubleshoot Pusher connection
      this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true,
      });

      // Enable Pusher logging by configuring in the options

      // Add connection event listeners for debugging
      if (this.pusher) {
        this.pusher.connection.bind('connected', function() {
          console.log('Pusher: Connected to channel');
        });

        this.pusher.connection.bind('disconnected', function() {
          console.log('Pusher: Disconnected from channel');
        });

        this.pusher.connection.bind('failed', function() {
          console.error('Pusher: Connection failed');
        });

        this.pusher.connection.bind('error', function(err: any) {
          console.error('Pusher: Connection error', err);
        });
      }
    }
  }

  subscribeToChannel(channelName: string, eventName: string, callback: PusherEventCallback) {
    if (!this.pusher) return;

    // Get or create channel
    let channel = this.channels.get(channelName);
    if (!channel) {
      channel = this.pusher.subscribe(channelName);
      this.channels.set(channelName, channel);

      // Add error handling for the channel
      channel.bind('pusher:subscription_error', (status: any) => {
        console.error(`Pusher subscription error for channel ${channelName}:`, status);
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`Pusher subscription succeeded for channel ${channelName}`);
      });
    }

    // Bind event to channel
    channel.bind(eventName, callback);
  }

  unsubscribeFromChannel(channelName: string) {
    if (!this.pusher || !channelName) return;

    const channel = this.channels.get(channelName);
    if (channel) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Specific methods for chat events
  subscribeToChatEvents(conversationId: string, callbacks: {
    onNewMessage?: (data: any) => void;
    onTypingStatus?: (data: any) => void;
  }) {
    if (callbacks.onNewMessage) {
      this.subscribeToChannel(`chat-${conversationId}`, 'new-message', callbacks.onNewMessage);
    }

    if (callbacks.onTypingStatus) {
      this.subscribeToChannel(`chat-${conversationId}`, 'typing-status', callbacks.onTypingStatus);
    }
  }

  // Method to send typing indicator directly via Pusher (optimized)
  async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (!conversationId) return;

    try {
      // Get user from localStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error('User not found in localStorage');
        return false;
      }

      const user = JSON.parse(userData);

      // Send typing status directly via Pusher
      const typingData = {
        userId: user.id,
        isTyping: isTyping,
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      };

      // Use the pusher client to trigger the event
      if (this.pusher) {
        const channel = this.pusher.channel(`chat-${conversationId}`);
        if (channel) {
          channel.trigger('client-typing-status', typingData);
        }
      }
      return true;
    } catch (error) {
      console.error('Error sending typing indicator directly via Pusher:', error);
      return false;
    }
  }

  // Disconnect from all channels
  disconnect() {
    if (this.pusher) {
      this.channels.forEach((channel, channelName) => {
        this.pusher!.unsubscribe(channelName);
      });
      this.channels.clear();
      this.pusher.disconnect();
    }
  }
}

// React Hook for Pusher
export const usePusher = () => {
  const pusherService = useRef<PusherService | null>(null);

  useEffect(() => {
    pusherService.current = new PusherService();

    // Clean up on unmount
    return () => {
      if (pusherService.current) {
        pusherService.current.disconnect();
      }
    };
  }, []);

  return pusherService.current;
};