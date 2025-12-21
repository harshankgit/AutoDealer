"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Conversation } from '@/types/chat';
import { Loader2, MessageCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function UserChatsPage() {
    const router = useRouter();
    const { user } = useUser();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadConversations();

        // Poll for conversation updates every 5 seconds
        const interval = setInterval(loadConversations, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/v2/chat?viewType=user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            } else {
                console.error('Failed to load conversations');
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your chats...</p>
                </div>
            </div>
        );
    }

    const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <BackButton variant="outline" size="sm" />
                    <h1 className="text-lg font-semibold text-foreground">My Chats</h1>
                    {unreadCount > 0 && (
                        <div className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            {unreadCount}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex h-[calc(100vh-64px)] lg:h-screen">
                {/* Chat List - Hidden on mobile when chat is selected */}
                <div className={`w-full lg:w-96 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
                    <ChatList
                        conversations={conversations}
                        selectedConversationId={selectedConversation?.id || null}
                        onSelectConversation={setSelectedConversation}
                    />
                </div>

                {/* Chat Interface */}
                <div className={`flex-1 ${!selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col bg-white dark:bg-gray-800`}>
                    {selectedConversation ? (
                        <>
                            {/* Mobile back button */}
                            <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="text-primary text-sm font-medium flex items-center gap-2"
                                >
                                    ← Back to chats
                                </button>
                            </div>
                            <ChatInterface
                                conversation={selectedConversation}
                                userId={user?.id || ''}
                                userName={user?.username || 'You'}
                            />
                        </>
                    ) : (
                        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center p-8 animate-fadeIn">
                                <div className="relative inline-block mb-6">
                                    <MessageCircle className="h-24 w-24 text-muted-foreground opacity-30" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-muted-foreground">
                                    Choose a chat from the list to start messaging
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}
