import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types/chat';

interface UseSupabaseChatProps {
    conversationId: string | null;
    userId: string;
    onNewMessage?: (message: Message) => void;
}

export function useSupabaseChat({ conversationId, userId, onNewMessage }: UseSupabaseChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const channelRef = useRef<any>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastMessageCountRef = useRef(0);

    // Load messages when conversation changes
    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }
        loadMessages();
    }, [conversationId]);

    // Subscribe to real-time updates with polling fallback
    useEffect(() => {
        if (!conversationId) return;

        console.log('🔌 Setting up real-time for conversation:', conversationId);

        const channel = supabase
            .channel(`chat-room-${conversationId}`, {
                config: { broadcast: { self: true } },
            })
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload) => {
                    console.log('✅ Real-time message received:', payload);
                    await loadMessages();
                }
            )
            .subscribe((status, err) => {
                console.log('📡 Subscription status:', status);
                if (err) console.error('❌ Subscription error:', err);
            });

        channelRef.current = channel;

        // Polling fallback every 3 seconds
        pollingIntervalRef.current = setInterval(async () => {
            const currentMessages = await fetchMessages();
            if (currentMessages && currentMessages.length > lastMessageCountRef.current) {
                console.log('📨 New messages via polling');
                setMessages(currentMessages);
                lastMessageCountRef.current = currentMessages.length;
            }
        }, 3000);

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [conversationId]);

    const fetchMessages = async (): Promise<Message[] | null> => {
        if (!conversationId) return null;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/v2/chat?conversationId=${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                return data.messages || [];
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
        return null;
    };

    const loadMessages = async () => {
        if (!conversationId) return;
        setIsLoading(true);
        try {
            const fetchedMessages = await fetchMessages();
            if (fetchedMessages) {
                setMessages(fetchedMessages);
                lastMessageCountRef.current = fetchedMessages.length;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (message: string, carId?: string) => {
        if (!conversationId || !message.trim()) return false;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v2/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    conversationId,
                    message,
                    message_type: carId ? 'car_details' : 'text',
                    carId,
                }),
            });
            if (!response.ok) throw new Error('Failed to send message');
            await loadMessages();
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    };

    return { messages, isLoading, sendMessage, reloadMessages: loadMessages };
}
