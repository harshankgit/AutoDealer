"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { Conversation } from '@/types/chat';

interface ChatInterfaceProps {
    conversation: Conversation;
    userId: string;
    userName: string;
}

export function ChatInterface({ conversation, userId, userName }: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, isLoading, sendMessage } = useSupabaseChat({
        conversationId: conversation.id,
        userId,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const success = await sendMessage(newMessage);
        if (success) {
            setNewMessage('');
        }
        setIsSending(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area - Only this scrolls */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>
                                <div className={`flex flex-col ${i % 2 === 0 ? 'items-start' : 'items-end'} max-w-[75%]`}>
                                    <div className={`h-12 ${i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-200 dark:bg-blue-700'} rounded-2xl rounded-tl-sm ${i % 2 === 0 ? 'rounded-tr-sm' : 'rounded-tl-sm'} animate-pulse w-40`}></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 animate-fadeIn">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message, index) => (
                            <div
                              key={message.id}
                              className="animate-messageSlideIn"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <MessageBubble
                                    message={message}
                                    isOwnMessage={message.senderid === userId}
                                    senderName={message.sender?.username || userName}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Fixed Message Input at Bottom */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-sm transition-all duration-300">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(e); }} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className="flex-1 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>

            <style jsx global>{`
                @keyframes messageSlideIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }

                .animate-messageSlideIn {
                  animation: messageSlideIn 0.3s ease-out forwards;
                }

                .animate-fadeIn {
                  animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
