import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/chat';

interface UseConversationListProps {
    viewType: 'user' | 'admin' | 'superadmin';
    userId: string;
}

export function useConversationList({ viewType, userId }: UseConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConversations();

        // Subscribe to conversation updates
        const channel = supabase
            .channel('conversations-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_conversations',
                },
                () => {
                    console.log('Conversation updated, reloading...');
                    loadConversations();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                },
                () => {
                    console.log('New message, reloading conversations...');
                    loadConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [viewType, userId]);

    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            let endpoint = '/api/v2/chat?viewType=user';
            if (viewType === 'admin') {
                endpoint = '/api/v2/admin/chats';
            } else if (viewType === 'superadmin') {
                endpoint = '/api/v2/chat?viewType=superadmin';
            }

            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        conversations,
        isLoading,
        reloadConversations: loadConversations,
    };
}
