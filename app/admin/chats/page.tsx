"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Menu,
  Home,
  Car,
  Calendar,
  BarChart3,
  Users,
  LogOut,
  Shield,
  FileText,
  Upload,
  Mail,
  Phone
} from "lucide-react";
import { usePusher } from "@/hooks/usePusher";
import { useUser } from "@/context/user-context";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  status: 'sent' | 'delivered' | 'seen';
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
  const { user: adminUser, logout } = useUser();
  const [chats, setChats] = useState<UserChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const [isTypingTimer, setIsTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherService = usePusher();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  // Use Supabase Realtime for messages
  useEffect(() => {
    if (!selectedChat) return;

    // Subscribe to real-time messages for the selected chat with enhanced error handling
    const channel = supabase
      .channel(`chat-room-${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          console.log('Admin received new message via Supabase Realtime:', payload.new);

          // Check if this is the admin's own message to avoid duplication
          const isAdminSender = payload.new.senderid === adminUser?.id;
          if (isAdminSender) {
            console.log('Admin received own message via Supabase Realtime, skipping to avoid duplication');
            // Update status of the optimistic message if needed
            setMessages(prev => prev.map(msg => {
              if (msg.id === payload.new.id) {
                return { ...msg, status: payload.new.status || 'sent' };
              }
              return msg;
            }));
            return;
          }

          setMessages(prev => {
            // Avoid duplicate messages
            const existingMessage = prev.some(msg => msg.id === payload.new.id);
            if (!existingMessage) {
              // Create a properly structured Message object
              const newMessage: Message = {
                id: payload.new.id,
                conversation_id: payload.new.conversation_id,
                senderid: payload.new.senderid,
                message: payload.new.message,
                message_type: payload.new.message_type || 'text',
                car_details: payload.new.car_details,
                file_url: payload.new.file_url,
                file_name: payload.new.file_name,
                file_type: payload.new.file_type,
                is_read: payload.new.is_read,
                status: payload.new.status || 'sent',
                timestamp: payload.new.timestamp,
                created_at: payload.new.created_at,
                sender: {
                  username: payload.new.sender?.username || 'User',
                  role: payload.new.sender?.role || 'user'
                }
              };
              return [...prev, newMessage].sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            }
            return prev;
          });
        }
      )
      .on('broadcast', { event: '*' }, (payload) => {
        console.log('Admin received broadcast event via Supabase Realtime:', payload);
      })
      .on('presence', { event: 'sync' }, () => {
        console.log('Admin Supabase channel presence sync');
      })
      .subscribe();

    console.log('Admin Supabase channel subscribed:', channel); // Debug log

    // Also subscribe to Pusher for new messages and typing indicators using the service
    if (pusherService) {
      pusherService.subscribeToChatEvents(selectedChat.id, {
        onNewMessage: (data: any) => {
          console.log('Admin received new message via Pusher:', data); // Debug log

          // Check if this is a status update rather than a new message
          if (data.type === 'message-delivered') {
            // Update message status
            setMessages(prev => prev.map(msg => {
              if (msg.id === data.messageId) {
                return { ...msg, status: 'delivered' };
              }
              return msg;
            }));
            return;
          }

          // Create a properly structured Message object from the Pusher data
          const newMessage: Message = {
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
            // Avoid duplicate messages
            const existingMessage = prev.some(msg => msg.id === newMessage.id);
            if (!existingMessage) {
              return [...prev, newMessage].sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            }
            return prev;
          });
        },
        onTypingStatus: (data: any) => {
          console.log('Admin received typing status via Pusher:', data); // Debug log
          console.log('Admin user ID:', adminUser?.id); // Debug log
          console.log('Typing user ID:', data?.userId); // Debug log
          if (data.conversationId === selectedChat.id) {
            if (data.userId !== adminUser?.id) { // Show typing status for users, not self
              setAdminIsTyping(data.isTyping);
            } else {
              console.log('Ignoring typing status from self'); // Debug log
            }
          }
        },
        onMessageDelivered: (data: any) => {
          console.log('Message delivered status received:', data);
          setMessages(prev => prev.map(msg => {
            if (msg.id === data.messageId) {
              return { ...msg, status: 'delivered' };
            }
            return msg;
          }));
        },
        onMessageSeen: (data: any) => {
          console.log('Message seen status received:', data);
          setMessages(prev => prev.map(msg => ({
            ...msg,
            status: 'seen'
          })));
        }
      });
    }

    return () => {
      supabase.removeChannel(channel);
      if (selectedChat && pusherService) {
        pusherService.unsubscribeFromChannel(`chat-${selectedChat.id}`);
      }

      // Clear typing timer on unmount
      if (isTypingTimer) {
        clearTimeout(isTypingTimer);
      }
    };
  }, [selectedChat, pusherService, adminUser]);

  // Function to handle typing indicator for admin
  const handleAdminTyping = async () => {
    if (!selectedChat || !adminUser) return;

    // Send typing indicator via the pusher service
    if (pusherService) {
      await pusherService.sendTypingIndicator(selectedChat.id, true);
    }

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

      const response = await fetch(`/api/v2/admin/chats`, {
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
        setMessages(data.chat?.messages || []);
      } else {
        console.error("Failed to load messages");
        // Try to fetch using the new endpoint
        const response2 = await fetch(`/api/v2/chat?conversationId=${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response2.ok) {
          const data2 = await response2.json();
          setMessages(data2.messages || []);
        } else {
          console.error("Failed to load messages from both endpoints");
        }
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
    if (!newMessage.trim() || !selectedChat || !adminUser) return;

    setIsSending(true);
    console.log('Admin sending message:', newMessage, 'to conversation:', selectedChat.id); // Debug log

    // Optimistically add the message to UI before API call
    const tempMessageId = `temp-${Date.now()}`;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Create optimistic message
      const optimisticMessage: Message = {
        id: tempMessageId,
        conversation_id: selectedChat.id,
        senderid: adminUser.id,
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
          username: adminUser.username,
          role: adminUser.role || 'admin',
        }
      };

      console.log('Adding optimistic admin message:', optimisticMessage); // Debug log
      setMessages(prev => [...prev, optimisticMessage]);

      // Use the unified chat API endpoint for better real-time support
      console.log('Admin attempting to send via main API:', `/api/v2/chat`); // Debug log
      const response = await fetch(`/api/v2/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedChat.id,
          message: newMessage,
          message_type: 'text'
        }),
      });

      console.log('Admin main API response status:', response.status); // Debug log

      if (response.ok) {
        console.log('Admin message sent successfully via main API'); // Debug log
        setNewMessage("");
        // Message will be updated via real-time events (Supabase Realtime + Pusher)
        // The optimistic message will be replaced when Supabase Realtime receives the actual message
      } else {
        console.error("Failed to send message via main API");
        // Log error details
        const errorDetails = await response.json().catch(() => ({}));
        console.error("Main API error details:", errorDetails);

        // Remove the optimistic message if main API fails
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));

        // Fallback to admin-specific endpoint
        console.log('Admin falling back to admin-specific API:', `/api/v2/admin/chats/${selectedChat.id}`); // Debug log
        const response2 = await fetch(`/api/v2/admin/chats/${selectedChat.id}`, {
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

        console.log('Admin fallback API response status:', response2.status); // Debug log

        if (response2.ok) {
          console.log('Admin message sent successfully via fallback API'); // Debug log
          setNewMessage("");
          // Message will be updated via real-time events
        } else {
          console.error("Failed to send message from both endpoints");
          // Try to get error details
          const errorData = await response2.json().catch(() => ({}));
          console.error("Fallback API error details:", errorData);
          // Show error to user
          // Keep optimistic message in case the error is temporary
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message if there's a network error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    // In a real app, you would make an API call here
    console.log('Changing password for user:', adminUser?.id);
    // Reset form and close dialog
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsChangePasswordOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = () => {
    if (!profileImage) return;

    // In a real app, you would upload the image to the server
    console.log('Uploading image:', profileImage);
    setProfileImage(null);
    // Reset preview after upload simulation
    setTimeout(() => {
      if (adminUser) {
        // You might want to refresh user data after upload
      }
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          <a
            href="/admin"
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-md group"
          >
            <BarChart3 className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span>Dashboard</span>
          </a>
          <a
            href="/admin/chats"
            className="flex items-center text-blue-600 dark:text-blue-300 font-medium px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-md"
          >
            <MessageCircle className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
            <span>Chats</span>
          </a>
          <a
            href="/admin/bookings"
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-md group"
          >
            <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span>Bookings</span>
          </a>
          <a
            href="/admin/users"
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-md group"
          >
            <Users className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span>Users</span>
          </a>
          <a
            href="/admin/add-car"
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-md group"
          >
            <Car className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span>Add Car</span>
          </a>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={previewImage || adminUser?.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${adminUser?.username}`}
              alt={adminUser?.username}
            />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
              {adminUser?.username ? getInitials(adminUser.username) : 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {adminUser?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {adminUser?.email}
            </p>
            <Badge variant="outline" className="mt-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              {adminUser?.role ? adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1) : 'User'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar for desktop */}
      {renderSidebar()}

      {/* Main content */}
      <div className="md:ml-64 flex flex-col flex-1">
        {/* Top navigation bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden mr-2"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <BackButton variant="outline" size="sm" className="flex items-center" />
                <div className="ml-4 flex items-center">
                  <div className="bg-blue-600 rounded-lg p-1.5 mr-3">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Chat Panel</h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={previewImage || adminUser?.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${adminUser?.username}`}
                          alt={adminUser?.username}
                        />
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                          {adminUser?.username ? getInitials(adminUser.username) : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{adminUser?.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-0 bg-white dark:bg-gray-800" align="end">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={previewImage || adminUser?.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${adminUser?.username}`}
                            alt={adminUser?.username}
                          />
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                            {adminUser?.username ? getInitials(adminUser.username) : 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                            {adminUser?.username}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-200 truncate">
                            {adminUser?.email}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            {adminUser?.role ? adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1) : 'User'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-white dark:bg-gray-800">
                      <DropdownMenuItem asChild>
                        <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-2 rounded-md cursor-pointer">
                          <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm">Profile</span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-2 rounded-md cursor-pointer">
                          <Settings className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm">Settings</span>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-2 rounded-md cursor-pointer w-full">
                              <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm">Change Password</span>
                            </div>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Update your account password for better security
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                              />
                            </div>
                            {passwordError && (
                              <p className="text-sm text-red-500">{passwordError}</p>
                            )}
                            <Button type="submit" className="w-full">
                              Update Password
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuSeparator />

                      <div className="p-2 bg-gray-50 dark:bg-gray-700/50">
                        <Label className="text-xs text-blue-700 dark:text-blue-300 mb-2 block">Profile Image</Label>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={previewImage || adminUser?.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${adminUser?.username}`}
                              alt={adminUser?.username}
                            />
                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                              {adminUser?.username ? getInitials(adminUser.username) : 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="text-sm"
                            />
                            {profileImage && (
                              <Button
                                type="button"
                                size="sm"
                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                                onClick={handleImageUpload}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-2 py-2 rounded-md cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="w-full max-w-6xl h-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="flex flex-1 min-h-0">
              {/* Left Panel - Chat List */}
              <div className={`${
                selectedChat ? 'hidden md:flex' : 'flex'
              } w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                  <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
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
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
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
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
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
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  message.senderid === adminUser?.id
                                    ? "text-blue-100"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                              {message.senderid === adminUser?.id && (
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
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8 max-w-md">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Choose a customer from your showroom to start chatting
                  </p>
                  <div className="flex justify-center">
                    <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
}