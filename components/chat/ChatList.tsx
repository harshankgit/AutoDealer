"use client";

import { useState } from 'react';
import { Conversation } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';

interface ChatListProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    onSelectConversation: (conversation: Conversation) => void;
}

export function ChatList({ conversations, selectedConversationId, onSelectConversation }: ChatListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = conversations.filter((conv) =>
        conv.room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedConversations = filteredConversations.sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (a.unread_count === 0 && b.unread_count > 0) return 1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    Messages
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {sortedConversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    sortedConversations.map((conversation, index) => (
                        <div
                            key={conversation.id}
                            onClick={() => onSelectConversation(conversation)}
                            className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 animate-fadeIn ${selectedConversationId === conversation.id
                                    ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-l-primary'
                                    : ''
                                }`}
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                                            {conversation.room?.name.charAt(0).toUpperCase() || 'R'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conversation.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                            <span className="text-white text-xs font-bold">{conversation.unread_count > 9 ? '9+' : conversation.unread_count}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold truncate ${conversation.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {conversation.room?.name || 'Unknown Room'}
                                        </h3>
                                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                            {formatTime(conversation.last_message_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {conversation.user?.username || 'Dealer'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
