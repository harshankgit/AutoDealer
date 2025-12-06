"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  User,
  Send,
  Loader2,
  Search,
  Bell,
  Settings,
  MoreVertical,
} from "lucide-react";
import { usePusher } from "@/hooks/usePusher";

interface UserChat {
  id: string;
  userid: string;
  roomid: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_active: boolean;
  unread_count: number;
  user: {
    username: string;
    email: string;
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

export default function AdminChatPanel() {
  const params = useParams();
  const router = useRouter();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const [isTypingTimer, setIsTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherService = usePusher();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current admin user from localStorage
  const adminUser = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem("user") || '{}') 
    : {};

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (selectedChat && pusherService) {
      // Subscribe to real-time events for the selected chat
      pusherService.subscribeToChannel(`chat-${selectedChat.id}`, 'new-message', (data: any) => {
        if (data.conversationId === selectedChat.id) {
          setMessages(prev => {
            // Avoid duplicate messages
            if (!prev.some(msg => msg.id === data.message.id)) {
              return [...prev, data.message].sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            }
            return prev;
          });
        }
      });

      // Subscribe to typing events
      pusherService.subscribeToChannel(`chat-${selectedChat.id}`, 'typing-status', (data: any) => {
        if (data.conversationId === selectedChat.id) {
          if (data.userId !== adminUser?.id) { // Show typing status for users, not self
            setAdminIsTyping(data.isTyping);
          }
        }
      });
    }

    return () => {
      if (selectedChat && pusherService) {
        pusherService.unsubscribeFromChannel(`chat-${selectedChat.id}`);
      }

      // Clear typing timer on unmount
      if (isTypingTimer) {
        clearTimeout(isTypingTimer);
      }
    };
  }, [selectedChat, pusherService, adminUser, isTypingTimer]);

  // Function to handle typing indicator for admin
  const handleAdminTyping = async () => {
    if (!selectedChat || !adminUser || !pusherService) return;

    // Send typing indicator via the pusher service
    await pusherService.sendTypingIndicator(selectedChat.id, true);

    // Clear any existing timer
    if (isTypingTimer) {
      clearTimeout(isTypingTimer);
    }

    // Set a new timer to stop typing after 1.5 seconds
    const timer = setTimeout(() => {
      if (selectedChat && adminUser && pusherService) {
        pusherService.sendTypingIndicator(selectedChat.id, false);
      }
    }, 1500);

    setIsTypingTimer(timer);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/v2/chat?viewType=admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort chats: unread first, then by last message time
        const sortedChats = data.conversations.sort((a: UserChat, b: UserChat) => {
          if (a.unread_count > 0 && b.unread_count === 0) return -1;
          if (a.unread_count === 0 && b.unread_count > 0) return 1;
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });
        setChats(sortedChats);
      } else {
        console.error("Failed to load chats");
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Use the conversation ID directly (no more roomid-userid format)
      const response = await fetch(`/api/v2/admin/chats/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.chat.messages || []);
      } else {
        console.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleChatSelect = (chat: UserChat) => {
    setSelectedChat(chat);
    // Use the conversation ID directly (not the old roomid-userid format)
    loadMessages(chat.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setIsSending(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Use the conversation ID directly (not the roomid-userid format)
      const response = await fetch(`/api/v2/admin/chats/${selectedChat.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
          message_type: 'text'
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Messages will be updated via real-time events
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort chats: unread first, then by last message time
  const sortedChats = filteredChats.sort((a, b) => {
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (a.unread_count === 0 && b.unread_count > 0) return 1;
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
  });

  const formatDate = (timestamp: string) => {
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'car_details' && message.car_details) {
      const carDetails = message.car_details;
      return (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <div className="flex items-start space-x-3">
            {carDetails.images && carDetails.images[0] && (
              <div className="flex-shrink-0">
                <img 
                  src={carDetails.images[0]} 
                  alt={carDetails.title} 
                  className="w-12 h-12 object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{carDetails.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {carDetails.year} {carDetails.brand} {carDetails.model}
              </p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                ₹{carDetails.price?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-sm">{message.message}</p>;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Chat List */}
      <div className={`${
        selectedChat ? 'hidden md:flex' : 'flex'
      } w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Customer Chats
            </h2>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : sortedChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No active conversations
            </div>
          ) : (
            sortedChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {chat.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.user.username}
                        </p>
                        {chat.unread_count > 0 && (
                          <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chat.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(chat.last_message_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Back button for mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden mr-2"
                  onClick={() => setSelectedChat(null)}
                >
                  ←
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedChat.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChat.user.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {adminIsTyping ? "User is typing..." : "Online"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="h-12 w-12 mb-4" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderid === adminUser?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                        message.senderid === adminUser?.id
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.senderid === adminUser?.id ? (
                            <div className="bg-blue-500 rounded-full w-full h-full flex items-center justify-center text-white">
                              <User className="h-4 w-4" />
                            </div>
                          ) : (
                            message.sender?.username
                              ?.charAt(0)
                              .toUpperCase() || "U"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.senderid === adminUser?.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        {renderMessageContent(message)}
                        <p
                          className={`text-xs mt-1 ${
                            message.senderid === adminUser?.id
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (selectedChat) {
                      handleAdminTyping();
                    }
                  }}
                  className="flex-1"
                  disabled={isSending}
                  ref={inputRef}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-blue-600 hover:bg-blue-700"
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a customer from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}