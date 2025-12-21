"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Search, ArrowLeft, Bell } from 'lucide-react';
import { useSupabaseChat } from '@/hooks/useSupabaseChat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Conversation } from '@/types/chat';
import { ChatListSkeleton, ChatMessagesSkeleton } from '@/components/chat/ChatSkeleton';
import BackButton from '@/components/BackButton';

export default function ChatDashboard() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isLoading: messagesLoading } = useSupabaseChat({
    conversationId: selectedConversation?.id || null,
    userId: user?.id || '',
  });

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/login');
      return;
    }
    if (user) {
      loadConversations();
      const interval = setInterval(loadConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      if (!user) return;
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const viewType = user.role === 'superadmin' ? 'superadmin' : 'admin';
      const response = await fetch(`/api/v2/chat?viewType=${viewType}`, {
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
    conv.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.room?.name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading || isLoading) {
    return (
      <div className="h-screen flex bg-background overflow-hidden">
        <ChatListSkeleton />
        <div className="flex-1">
          <ChatMessagesSkeleton />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton variant="outline" size="sm" />
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {user.role === 'superadmin' ? 'All Chats' : 'Customer Chats'}
          </h1>
          {totalUnread > 0 && (
            <div className="ml-auto relative">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {totalUnread}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - User List (FIXED, NO SCROLL) */}
        <div
          className={`${showMobileList ? 'block' : 'hidden'
            } lg:flex lg:flex-col w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm`}
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                {user.role === 'superadmin' ? 'All Conversations' : 'User Messages'}
              </h2>
              {totalUnread > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                    {totalUnread}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* User List - Scrollable */}
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
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowMobileList(false);
                  }}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 animate-fadeIn ${selectedConversation?.id === conversation.id
                      ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-l-primary'
                      : ''
                    }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-sm">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {conversation.user?.username.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                          <span className="text-white text-xs font-bold">
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className={`font-semibold truncate ${conversation.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {conversation.user?.username || 'Unknown User'}
                          </h3>
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-xs font-bold">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {conversation.room?.name || conversation.user?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat Window (SCROLLABLE) */}
        <div
          className={`${!showMobileList ? 'block' : 'hidden'
            } lg:flex flex-1 flex-col bg-white dark:bg-gray-800 overflow-hidden`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="lg:hidden text-muted-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {selectedConversation.user?.username.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {selectedConversation.user?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.room?.name || selectedConversation.user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                        <div className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                          <div className={`h-16 ${i % 2 === 0 ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'} rounded-2xl w-48 animate-pulse`}></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mt-1 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>No messages yet</p>
                    </div>
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

              {/* Message Input - Fixed */}
              <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-primary hover:bg-primary/90 px-6"
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
            <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center p-8 animate-fadeIn">
                <div className="relative inline-block mb-6">
                  <MessageCircle className="h-24 w-24 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a customer from the list to view their messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}