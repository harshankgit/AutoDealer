'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageCircle, Loader2, Send, User, Car, Paperclip, X } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface Message {
  id: string;
  message: string;
  senderId: string;
  senderType: 'user' | 'admin' | 'superadmin';
  timestamp: string;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface Chat {
  id: string;
  carId: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    image: string | null;
  } | null;
  userId: {
    id: string;
    username: string;
    email: string;
    phone: string;
  } | null;
  adminid: {
    id: string;
    username: string;
    email: string;
  } | null;
  roomid: {
    id: string;
    name: string;
  } | null;
  messages: Message[];
  createdAt: string;
}

export default function AdminChatPage({ params }: { params: { chatId: string } }) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && !['admin', 'superadmin'].includes(user.role)) {
      router.push('/');
      return;
    }

    if (user) {
      fetchChat();
    }
  }, [user, loading, params.chatId, router]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages]);

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/admin/chats/${params.chatId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChat(data.chat);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch chat');
      }
    } catch (error) {
      console.error('Fetch chat error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!message.trim() && !selectedFile) || sending) return;

    setSending(true);
    setError('');

    try {
      let fileId = null;
      let fileName = null;
      let fileType = null;

      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.error || 'File upload failed');
        }

        const uploadData = await uploadRes.json();
        fileId = uploadData.fileId;
        fileName = uploadData.fileName;
        fileType = uploadData.fileType;
      }

      const response = await fetch(`/api/admin/chats/${params.chatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim() || null,
          fileId,
          fileName,
          fileType,
        }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        // Update the chat with the new message
        if (chat) {
          setChat({
            ...chat,
            messages: [...chat.messages, newMessage.newMessage],
          });
        }
        setMessage('');
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const canSendMessage = user && (
    user.role === 'superadmin' || 
    (user.role === 'admin' && chat?.adminid?.id === user.id)
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Error Loading Chat</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/admin/chats">
            <Button>Go to Chats</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center">
          <Link href="/admin/chats">
            <Button variant="outline" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chats
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
        </div>

        {chat && (
          <div className="flex flex-col space-y-6">
            {/* Chat Header */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {chat.userId?.username ? getInitials(chat.userId.username) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h2 className="font-bold text-lg dark:text-white">
                        {chat.userId?.username || 'Unknown User'}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {chat.userId?.email || 'No email'} • {chat.userId?.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium dark:text-white">
                        {chat.carId ? `${chat.carId.year} ${chat.carId.brand} ${chat.carId.model}` : 'Unknown Car'}
                      </span>
                    </div>
                    {chat.roomid && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room: {chat.roomid.name} (ID: {chat.roomid.id})
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Messages */}
            <Card className="flex-grow bg-white dark:bg-gray-800">
              <CardContent className="p-4 h-[500px] overflow-y-auto">
                {chat.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chat.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderType === 'user'
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {msg.fileUrl && (
                            <div className="mb-2">
                              {msg.fileType === 'image' && (
                                <img src={msg.fileUrl} alt={msg.fileName || 'Image'} className="max-w-xs rounded-lg" />
                              )}
                              {msg.fileType === 'video' && (
                                <video src={msg.fileUrl} controls className="max-w-xs rounded-lg" />
                              )}
                              {(msg.fileType === 'pdf' || msg.fileType === 'document') && (
                                <a href={msg.fileUrl} download className="flex items-center text-blue-400 hover:underline">
                                  📄 {msg.fileName}
                                </a>
                              )}
                              {msg.fileType === 'audio' && (
                                <audio src={msg.fileUrl} controls />
                              )}
                            </div>
                          )}
                          {msg.message && <p>{msg.message}</p>}
                          <div
                            className={`text-xs mt-1 ${
                              msg.senderType === 'user'
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-blue-100'
                            }`}
                          >
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Input */}
            {canSendMessage ? (
              <div className="space-y-2">
                {selectedFile && (
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                      <Paperclip className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </label>
                  </div>
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || (!message.trim() && !selectedFile)}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}