"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, Loader2, Search, Menu, ArrowLeft } from 'lucide-react';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Conversation } from '@/types/chat';
import BackButton from '@/components/BackButton';

export default function AdminChatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useSupabaseChat({
    conversationId: selectedConversation?.id || null,
    userId: user?.id || '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadConversations();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/v2/admin/chats', {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedConversations = filteredConversations.sort((a, b) => {
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (a.unread_count === 0 && b.unread_count > 0) return 1;
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-[calc(100vh-64px)] lg:h-screen">
          {/* User List Panel Skeleton */}
          <div className="lg:block w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="relative">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-120px)]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window Skeleton */}
          <div className="lg:block flex-1 flex flex-col bg-white dark:bg-gray-800">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-blue-500 text-white'} rounded-lg p-3 max-w-xs lg:max-w-md`}>
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10" />
                <Skeleton className="h-10 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <BackButton variant="outline" size="sm" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Admin Chats
          </h1>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen">
        {/* User List Panel */}
        <div
          className={`${showMobileList ? 'block' : 'hidden'
            } lg:block w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 hidden lg:flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              User Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-120px)]">
            {sortedConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No user messages yet</p>
              </div>
            ) : (
              sortedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowMobileList(false);
                  }}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600'
                      : ''
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-300 dark:bg-gray-600">
                        {conversation.user?.username.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.user?.username || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conversation.user?.email || ''}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-blue-600 text-white h-5 min-w-5 rounded-full px-1.5">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div
          className={`${!showMobileList ? 'block' : 'hidden'
            } lg:block flex-1 flex flex-col bg-white dark:bg-gray-800`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="lg:hidden text-gray-600 dark:text-gray-400"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-300 dark:bg-gray-600">
                      {selectedConversation.user?.username.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.user?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversation.user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.senderid === user?.id}
                        senderName={message.sender?.username || user?.username || 'You'}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your reply..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 px-4"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="text-center p-8">
                <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a user from the list to view their messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}