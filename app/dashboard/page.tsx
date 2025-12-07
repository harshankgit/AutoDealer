"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  Car,
  Eye,
  X,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import { usePusher } from "@/hooks/usePusher";
import Link from "next/link";

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
  room?: {
    name: string;
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

export default function ChatDashboard() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const [isTypingTimer, setIsTypingTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pusherService = usePusher();

  useEffect(() => {
    if (
      !loading &&
      (!user || (user.role !== "admin" && user.role !== "superadmin"))
    ) {
      router.push("/login");
      return;
    }

    if (user) {
      loadChats();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedChat && pusherService) {
      // Subscribe to real-time events for the selected chat
      pusherService.subscribeToChannel(
        `chat-${selectedChat.id}`,
        "new-message",
        (data: any) => {
          if (data.conversationId === selectedChat.id) {
            setMessages((prev) => {
              // Avoid duplicate messages
              if (!prev.some((msg) => msg.id === data.message.id)) {
                return [...prev, data.message].sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                );
              }
              return prev;
            });
          }
        }
      );

      // Subscribe to typing events
      pusherService.subscribeToChannel(
        `chat-${selectedChat.id}`,
        "typing-status",
        (data: any) => {
          if (data.conversationId === selectedChat.id) {
            if (data.userId !== user?.id) {
              // Show typing status for users, not self
              setAdminIsTyping(data.isTyping);
            }
          }
        }
      );
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
  }, [selectedChat, pusherService, user, isTypingTimer]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      if (!user) return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const viewType = user.role === "superadmin" ? "superadmin" : "admin";
      const response = await fetch(`/api/v2/chat?viewType=${viewType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort chats: unread first, then by last message time
        const sortedChats = data.conversations.sort(
          (a: UserChat, b: UserChat) => {
            if (a.unread_count > 0 && b.unread_count === 0) return -1;
            if (a.unread_count === 0 && b.unread_count > 0) return 1;
            return (
              new Date(b.last_message_at).getTime() -
              new Date(a.last_message_at).getTime()
            );
          }
        );
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
      if (!user) return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Use different endpoint based on user role
      let endpoint = "";
      if (user.role === "superadmin") {
        endpoint = `/api/v2/superadmin/chats/${chatId}`;
      } else {
        // For admin, the chatId is roomid-userid
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          endpoint = `/api/v2/admin/chats/${chat.roomid}-${chat.userid}`;
        } else {
          return;
        }
      }

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
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
    loadMessages(chat.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setIsSending(true);

    try {
      if (!user) return;

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Use different endpoint based on user role
      let endpoint = "";
      if (user.role === "superadmin") {
        endpoint = `/api/v2/superadmin/chats/${selectedChat.id}`;
      } else {
        // For admin, the chatId is roomid-userid
        endpoint = `/api/v2/admin/chats/${selectedChat.roomid}-${selectedChat.userid}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
          message_type: "text",
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

  // Function to handle typing indicator for admin/superadmin
  const handleAdminTyping = async () => {
    if (!selectedChat || !user || !pusherService) return;

    // Send typing indicator via the pusher service
    await pusherService.sendTypingIndicator(selectedChat.id, true);

    // Clear any existing timer
    if (isTypingTimer) {
      clearTimeout(isTypingTimer);
    }

    // Set a new timer to stop typing after 1.5 seconds
    const timer = setTimeout(() => {
      if (selectedChat && user && pusherService) {
        pusherService.sendTypingIndicator(selectedChat.id, false);
      }
    }, 1500);

    setIsTypingTimer(timer);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(
    (chat) =>
      chat.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chat.room?.name &&
        chat.room.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort chats: unread first, then by last message time
  const sortedChats = filteredChats.sort((a, b) => {
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (a.unread_count === 0 && b.unread_count > 0) return 1;
    return (
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime()
    );
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
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
    if (message.message_type === "car_details" && message.car_details) {
      const carDetails = message.car_details;
      return (
        <div
          className={`${
            message.senderid === user?.id
              ? "bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30"
              : "bg-white dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600"
          } rounded-lg p-3`}
        >
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
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {carDetails.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {carDetails.year} {carDetails.brand} {carDetails.model}
              </p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                ₹{carDetails.price?.toLocaleString()}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {carDetails.room_name}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-sm">{message.message}</p>;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading chat dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header - Shown only on mobile when chat is selected */}
      <div className="lg:hidden p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        {selectedChat ? (
          <>
            <button
              onClick={() => setSelectedChat(null)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {selectedChat.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {selectedChat.user.username}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {adminIsTyping ? (
                    <span className="text-blue-500">typing...</span>
                  ) : (
                    <span className="text-green-500">online</span>
                  )}
                </p>
              </div>
            </div>
            <div className="w-8"></div> {/* Spacer to center the chat info */}
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <h1 className="text-lg font-bold flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              {user.role === "superadmin"
                ? "All Customer Chats"
                : "Customer Chats"}
            </h1>
          </div>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar - Shown on desktop always, mobile when no chat selected */}
        <div className={`${selectedChat ? "hidden" : ""} md:flex flex-col md:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900`}>
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <div className="relative">
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
            {sortedChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {user.role === "superadmin"
                  ? "No active conversations across the system"
                  : "No active conversations in your showroom"}
              </div>
            ) : (
              sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
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
                            <Badge
                              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                              variant="destructive"
                            >
                              {chat.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {chat.room?.name || "Unknown Room"}
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

          {/* User Info Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2 bg-gray-100 dark:bg-gray-800">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role === "superadmin" ? "Super Admin" : "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Window - Shown when chat is selected, hidden when no chat is selected */}
        <div className={`${selectedChat ? "flex" : "hidden"} flex-1 flex-col bg-white dark:bg-gray-800`}>
          {selectedChat && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-3">
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
                      {selectedChat.room?.name || "Customer"} •{" "}
                      {adminIsTyping ? (
                        <span className="text-blue-500">User is typing...</span>
                      ) : (
                        <span className="text-green-500">Online</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Link href={`/admin/user/${selectedChat.userid}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
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
                        message.senderid === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                          message.senderid === user?.id
                            ? "flex-row-reverse space-x-reverse"
                            : ""
                        }`}
                      >
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback>
                            {message.senderid === user?.id ? (
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
                          className={`rounded-2xl px-4 py-3 ${
                            message.senderid === user?.id
                              ? "bg-blue-600 text-white rounded-br-none shadow-md"
                              : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600 shadow-sm"
                          }`}
                        >
                          {renderMessageContent(message)}
                          <p
                            className={`text-xs mt-1 ${
                              message.senderid === user?.id
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
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
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
                    className="flex-1 py-3"
                    disabled={isSending}
                    ref={inputRef}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="bg-blue-600 hover:bg-blue-700 py-3 px-4"
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
          )}
        </div>

        {/* Show when no chat is selected */}
        {!selectedChat && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center p-8">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                {user.role === "superadmin"
                  ? "Choose a customer chat from the list to start messaging"
                  : "Choose a customer from your showroom to start chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}