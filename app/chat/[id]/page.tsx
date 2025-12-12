"use client";

import { useState, useEffect, useRef } from "react";

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    chatChannels?: Record<string, any>;
  }
}
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Send,
  Car,
  User,
  MessageCircle,
  Loader2,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  MapPin,
  Clock,
  Calendar,
  DollarSign
} from "lucide-react";
import { usePusher } from "@/hooks/usePusher";
import { supabase } from "@/lib/supabase";
import { ChatSkeleton } from '@/components/skeletons/ChatSkeleton';

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  roomid: {
    id: string;
    name: string;
  };
  adminid: string | {
    id: string;
    username: string;
  };
  description?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
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
  status: 'sent' | 'delivered' | 'seen';
  timestamp: string;
  created_at: string;
  sender: {
    username: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  roomid: string;
  userid: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_active: boolean;
  unread_count: number;
  room: {
    name: string;
    adminid: string;
  };
}

export default function NewChatPage() {
  const params = useParams();
  const router = useRouter();
  const p = params ?? {};
  const carId =
    typeof (p as any).id === "string"
      ? (p as any).id
      : Array.isArray((p as any).id)
      ? (p as any).id[0]
      : undefined;

  const [car, setCar] = useState<Car | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoadedFromApi, setMessagesLoadedFromApi] = useState(false); // Track if messages are loaded from API
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('Loading room...');
  const [isTyping, setIsTyping] = useState(false);
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const [isTypingTimer, setIsTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pusherService = usePusher();

  useEffect(() => {
    if (!carId) return;
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    initializeChat(token);

    return () => {
      if (conversationId && pusherService) {
        pusherService.unsubscribeFromChannel(`chat-${conversationId}`);
      }

      // Clean up Supabase Realtime channel
      if (conversationId && window.chatChannels && window.chatChannels[conversationId]) {
        supabase.removeChannel(window.chatChannels[conversationId]);
        delete window.chatChannels[conversationId];
      }

      // Clear typing timer on unmount
      if (isTypingTimer) {
        clearTimeout(isTypingTimer);
      }
    };
  }, [carId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const initializeChat = async (token: string) => {
    try {
      // Fetch car details (public)
      const carResponse = await fetch(`/api/cars/${carId}`);
      const carData = await carResponse.json();

      if (carResponse.ok) {
        setCar(carData.car);

        // Fetch room details to get room name
        if (carData.car?.roomid) {
          const roomResponse = await fetch(`/api/rooms/${carData.car.roomid}`);
          const roomData = await roomResponse.json();

          if (roomResponse.ok) {
            setRoomName(roomData.room?.name || 'Unknown Room');
          } else {
            setRoomName('Unknown Room');
          }
        }

        // Start or get conversation
        const startConvResponse = await fetch('/api/v2/chat/start-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ carId }),
        });

        if (startConvResponse.ok) {
          const convData = await startConvResponse.json();
          setConversationId(convData.conversationId);

          // Subscribe to real-time events
          if (convData.conversationId) {

            // Subscribe to typing status via local function
            subscribeToChatEvents(convData.conversationId, {
              onTypingStatus: (data: any) => {
                // Handle typing status for others, not self
                if (data.userId !== user?.id) {
                  if (data.isTyping) {
                    setAdminIsTyping(true);
                  } else {
                    setAdminIsTyping(false);
                  }
                }

              }
            });

            // Directly subscribe to additional Pusher events using the service
            if (pusherService) {

              // Subscribe to new messages - update optimistically for better UX
              pusherService.subscribeToChannel(`chat-${convData.conversationId}`, 'new-message', (data: any) => {

                // Check if this is a status update rather than a new message
                if (data.type === 'message-delivered') {
                  // Update message status optimistically
                  setMessages(prev => prev.map(msg => {
                    if (msg.id === data.messageId) {
                      return { ...msg, status: 'delivered' };
                    }
                    return msg;
                  }));
                  return;
                } else if (data.type === 'message-seen') {
                  // Update message status optimistically
                  setMessages(prev => prev.map(msg => {
                    if (msg.id === data.messageId) {
                      return { ...msg, status: 'seen' };
                    }
                    return msg;
                  }));
                  return;
                }

                // For new messages, add them optimistically to the UI
                // Create a properly structured Message object from the Pusher data
                const newMsg: Message = {
                  id: data.message?.id,
                  conversation_id: data.message?.conversation_id,
                  senderid: data.message?.senderid,
                  message: data.message?.message,
                  message_type: data.message?.message_type || 'text',
                  car_details: data.message?.car_details,
                  file_url: data.message?.file_url,
                  file_name: data.message?.file_name,
                  file_type: data.message?.file_type,
                  is_read: data.message?.is_read || false,
                  status: data.message?.status || 'sent', // Default to 'sent' if not provided
                  timestamp: data.message?.timestamp || data.timestamp,
                  created_at: data.message?.created_at || data.timestamp,
                  sender: data.sender || { username: 'Unknown', role: 'user' }
                };

                setMessages(prev => {
                  // Only add if it doesn't exist to prevent duplicates
                  const exists = prev.some(msg => msg.id === newMsg.id);
                  if (!exists) {
                    return [...prev, newMsg];
                  }
                  return prev; // Message already exists, return as is
                });
              });

              // Subscribe to message delivered status - refresh from API to get all updated statuses
              pusherService.subscribeToChannel(`chat-${convData.conversationId}`, 'message-delivered', async (data: any) => {
                // Refresh from API to get all updated statuses
                const token = localStorage.getItem("token");
                if (token && convData.conversationId) {
                  await fetchMessages(convData.conversationId, token);
                }
              });

              // Subscribe to message seen status - refresh from API to get all updated statuses
              pusherService.subscribeToChannel(`chat-${convData.conversationId}`, 'message-seen', async (data: any) => {
                // Refresh from API to get all updated statuses
                const token = localStorage.getItem("token");
                if (token && convData.conversationId) {
                  await fetchMessages(convData.conversationId, token);
                }
              });
            }
          }

          // Load messages for this conversation
          await fetchMessages(convData.conversationId, token);

          // If the start-conversation API returned a new message (like car details),
          // make sure it's not duplicated by the Pusher event
          if (convData.newMessage) {
            // The fetchMessages call should have already included this message,
            // so any Pusher event for this message will be deduplicated
          }
        } else {
          const errorData = await startConvResponse.json();
          setError(errorData.error || "Failed to start conversation");
        }
      } else {
        setCar(null);
        setError(carData.error || "Car not found");
      }
    } catch (err) {
      console.error("initializeChat error:", err);
      setError("Failed to initialize chat");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChatEvents = (conversationId: string, callbacks: {
    onNewMessage?: (data: any) => void;
    onTypingStatus?: (data: any) => void;
  }) => {

    // Subscribe to Supabase Realtime message events for direct database updates - refresh from API
    const supabaseChannel = supabase
      .channel(`chat-room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Refresh messages from API to get the most up-to-date data with proper formatting
          const token = localStorage.getItem("token");
          if (token && conversationId) {
            await fetchMessages(conversationId, token);
          }
        }
      )
      .subscribe();


    // Subscribe to Pusher events using the service
    if (pusherService) {
      pusherService.subscribeToChatEvents(conversationId, callbacks);
    } else {
      console.error('Pusher service not available in subscribeToChatEvents'); // Debug log
    }

    // Store channel for cleanup
    if (!window.chatChannels) {
      window.chatChannels = {};
    }
    window.chatChannels[conversationId] = supabaseChannel;
  };

  const fetchMessages = async (convId: string, token: string) => {
    try {
      const response = await fetch(`/api/v2/chat?conversationId=${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Ensure each message has a proper sender object
        const formattedMessages = (data.messages || []).map((msg: any) => ({
          ...msg,
          status: msg.status || 'sent', // Default to 'sent' if not provided by API
          sender: msg.sender || { username: 'Unknown', role: 'user' }
        }));

        // Sort messages by timestamp to ensure proper order
        const sortedMessages = formattedMessages.sort((a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setMessages(sortedMessages);
        setMessagesLoadedFromApi(true); // Mark that messages were loaded from API
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
      setError("Failed to fetch messages");
    }
  };

  // Function to handle typing indicator for user with proper rate limiting
  const handleUserTyping = () => {
    if (!conversationId || !user || !pusherService) return;

    // Set typing to true if not already
    if (!isTyping) {
      setIsTyping(true);

      // Send typing indicator via the pusher service
      pusherService.sendTypingIndicator(conversationId, true);
    }

    // Clear any existing timer
    if (isTypingTimer) {
      clearTimeout(isTypingTimer);
    }

    // Set a new timer to stop typing after a delay of inactivity
    const timer = setTimeout(() => {
      setIsTyping(false);

      // Send stop typing indicator via the pusher service
      pusherService.sendTypingIndicator(conversationId, false);
    }, 1500); // Stop typing indicator after 1.5 seconds of inactivity

    setIsTypingTimer(timer);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    setIsSending(true);
    setError("");

    // Optimistically add the message to UI before API call
    const tempMessageId = `temp-${Date.now()}`;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        setIsSending(false);
        router.push("/login");
        // Remove the optimistic message if there's an issue
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        return;
      }

      const optimisticMessage: Message = {
        id: tempMessageId,
        conversation_id: conversationId,
        senderid: user.id,
        message: newMessage,
        message_type: 'text',
        car_details: undefined,
        file_url: undefined,
        file_name: undefined,
        file_type: undefined,
        is_read: false,
        status: 'sent',
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        sender: {
          username: user.username,
          role: user.role,
        }
      };

      setMessages(prev => [...prev, optimisticMessage]);

      const response = await fetch("/api/v2/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          message: newMessage,
          message_type: 'text',
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Unauthorized. Please login again.");
        router.push("/login");
        // Remove the optimistic message if auth fails
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
        return;
      }

      if (response.ok) {
        // Update the optimistic message with the actual server response data
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessageId
              ? {
                  ...data.data,
                  status: data.data.status as 'sent' | 'delivered' | 'seen' || 'sent',
                  sender: data.data.sender || { username: user.username, role: user.role }
                }
              : msg
          )
        );

        // Reset input
        setNewMessage("");
      } else {
        setError(data.error || "Failed to send message");
        // Remove the optimistic message if API fails
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      }
    } catch (error) {
      setError("Network error. Please try again.");
      // Remove the optimistic message if there's a network error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      console.error('Error sending message:', error); // Debug log
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'car_details' && message.car_details) {
      const carDetails = message.car_details;
      return (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-start space-x-3">
            {carDetails.images && carDetails.images[0] && (
              <div className="flex-shrink-0">
                <img
                  src={carDetails.images[0]}
                  alt={carDetails.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{carDetails.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {carDetails.year} {carDetails.brand} {carDetails.model}
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatPrice(carDetails.price)}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{carDetails.room_name || roomName}</span>
              </div>
              <Button
                className="mt-2 text-xs"
                onClick={() => router.push(`/cars/${carDetails.id}`)}
              >
                View Car
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (message.file_url) {
      return (
        <div className="mt-2">
          {message.file_type?.startsWith('image') && (
            <a href={message.file_url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.file_url}
                alt={message.file_name}
                className="max-w-xs rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </a>
          )}
          {message.file_type?.startsWith('video') && (
            <video
              src={message.file_url}
              controls
              className="max-w-xs rounded-lg border border-gray-200 dark:border-gray-600"
            />
          )}
          {(message.file_type === 'application/pdf' || message.file_type?.includes('pdf')) && (
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:underline"
            >
              <FileText className="h-4 w-4 mr-1" />
              {message.file_name || "PDF Document"}
            </a>
          )}
        </div>
      );
    }

    return <p className="text-sm">{message.message}</p>;
  };

  if (isLoading) {
    return <ChatSkeleton />;
  }

  if (!car || !conversationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Chat Not Available
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "Unable to load chat for this car."}
          </p>
          <Link href="/rooms">
            <Button>Browse Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/cars/${car.id}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Car Details
            </Button>
          </Link>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Car Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Car className="h-5 w-5 mr-2" />
                  Car Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <img
                    src={
                      car.images[0] ||
                      "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg"
                    }
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {car.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {car.year} {car.brand} {car.model}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {formatPrice(car.price)}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Showroom:</strong> {roomName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Dealer:</strong> {car.adminid && typeof car.adminid === 'object' ? car.adminid.username : "Car Dealer"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat with {car.adminid && typeof car.adminid === 'object' ? car.adminid.username : "Car Dealer"}
                  </CardTitle>
                  {adminIsTyping && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Dealer is typing...
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-12 w-12 mb-4" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    // Group messages by same sender and date
                    const currentMessageDate = formatDate(message.timestamp);
                    const prevMessageDate = index > 0 ? formatDate(messages[index - 1].timestamp) : null;

                    return (
                      <div key={message.id}>
                        {(index === 0 || prevMessageDate !== currentMessageDate) && (
                          <div className="text-center my-4">
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                              {currentMessageDate}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex ${
                            message.senderid === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                              message.senderid === user?.id
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {message.senderid === user?.id ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  message.sender?.username
                                    ?.charAt(0)
                                    .toUpperCase() || "D"
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.senderid ===
                                user?.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              {renderMessageContent(message)}
                              <div className="flex items-center justify-between mt-1">
                                <p
                                  className={`text-xs ${
                                    message.senderid ===
                                    user?.id
                                      ? "text-blue-100"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatTime(message.timestamp)}
                                </p>
                                {message.senderid === user?.id && (
                                  <span className="text-xs ml-1">
                                    {message.status === 'sent' ? '✓' :
                                     message.status === 'delivered' ? '✓✓' :
                                     message.status === 'seen' ? '✓✓✓' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4 space-y-3">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleUserTyping();
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}