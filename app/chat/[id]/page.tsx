"use client";

import { useState, useEffect, useRef } from "react";
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
            subscribeToChatEvents(convData.conversationId);
          }

          // Load messages for this conversation
          await fetchMessages(convData.conversationId, token);

          // If the start-conversation API returned a new message (like car details),
          // make sure it's not duplicated by the Pusher event
          if (convData.newMessage) {
            // The fetchMessages call should have already included this message,
            // so any Pusher event for this message will be deduplicated
            console.log('Start conversation created message:', convData.newMessage);
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

  const subscribeToChatEvents = (conversationId: string) => {
    // Subscribe to real-time message events
    if (pusherService) {
      pusherService.subscribeToChannel(`chat-${conversationId}`, 'new-message', (data: any) => {
        console.log('Received new message via Pusher:', data); // Debug log
        setMessages(prev => {
          // Avoid duplicate messages - check if message exists or if it's the optimistic message we sent
          const existingMsgIndex = prev.findIndex(msg => msg.id === data.message.id);

          if (existingMsgIndex !== -1) {
            // If it's an optimistic message we sent, update it with server data
            const existingMsg = prev[existingMsgIndex];
            if (existingMsg.id.startsWith('temp-')) {
              // Update the optimistic message with server data
              const updatedMessages = [...prev];
              updatedMessages[existingMsgIndex] = {
                ...data.message,
                sender: data.message.sender || data.sender || { username: 'Unknown', role: 'user' }
              };
              return updatedMessages;
            }
            // If it's not a temp message and already exists, return as is to avoid duplicates
            return prev;
          } else {
            // Check if the message is already in the list by content/timestamp to prevent duplicates
            // This handles cases where a message might have been added via fetchMessages before this Pusher event
            const duplicateByContent = prev.some(msg =>
              msg.message === data.message.message &&
              msg.timestamp === data.message.timestamp &&
              msg.senderid === data.message.senderid
            );

            if (duplicateByContent) {
              return prev;
            }

            // If message doesn't exist, add it (this is for messages from other participants)
            // Ensure the message structure is consistent with what the frontend expects
            const formattedMessage = {
              ...data.message,
              sender: data.message.sender || data.sender || { username: 'Unknown', role: 'user' }
            };
            return [...prev, formattedMessage];
          }
        });
      });
    }

    // Subscribe to typing events
    if (pusherService) {
      pusherService.subscribeToChannel(`chat-${conversationId}`, 'typing-status', (data: any) => {
        console.log('Received typing status via Pusher:', data); // Debug log
        if (data.userId !== user?.id) { // Show typing status for others, not self
          if (data.isTyping) {
            setAdminIsTyping(true);
          } else {
            setAdminIsTyping(false);
          }
        }
      });
    }
  };

  const fetchMessages = async (convId: string, token: string) => {
    try {
      console.log('Fetching messages for conversation:', convId); // Debug log
      const response = await fetch(`/api/v2/chat?conversationId=${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched messages:', data.messages); // Debug log

        // Ensure each message has a proper sender object
        const formattedMessages = (data.messages || []).map((msg: Message) => ({
          ...msg,
          sender: msg.sender || { username: 'Unknown', role: 'user' }
        }));

        setMessages(formattedMessages);
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
      const optimisticMessage = {
        id: tempMessageId,
        conversation_id: conversationId,
        senderid: user.id,
        message: newMessage,
        message_type: 'text',
        is_read: false,
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
              ? { ...data.data, sender: data.data.sender || { username: user.username, role: user.role } }
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
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
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderid ===
                                  user?.id
                                    ? "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
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