'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, Loader2, Car, User } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface ChatSummary {
  id: string;
  roomid: string;
  userid: string;
  car: {
    id: string;
    title: string;
    images: string[] | null;
    room: string;
  } | null;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  lastMessage: {
    message: string;
    timestamp: string;
    senderId: string;
  } | null;
  messageCount: number;
  updatedAt: string;
}

export default function AdminChatsPage() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Super admins should go to the superadmin dashboard
    if (user && user.role === 'superadmin') {
      router.push('/admin/superadmin');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchChats();
    }
  }, [user, loading, router]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/admin/chats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Sort chats by most recent message first
        const sortedChats = data.chats.sort((a: ChatSummary, b: ChatSummary) => {
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateB - dateA;
        });
        
        setChats(sortedChats);
      } else {
        setError(data.error || 'Failed to fetch chats');
      }
    } catch (error) {
      console.error('Fetch chats error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading messages...</p>
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
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Error Loading Chats</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {user?.role === 'superadmin' ? (
            <Link href="/admin/superadmin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Conversations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage all customer inquiries and discussions about your listed cars.
          </p>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Conversations Yet</h3>
            <p className="text-gray-500 mb-6">Customers will contact you here regarding your cars.</p>
            <Link href="/admin/add-car">
              <Button>
                <Car className="h-4 w-4 mr-2" />
                Add a Car to Start Selling
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link href={`/admin/chats/${chat.id}`} key={chat.id} className="block">
                <Card className="mb-4 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {chat.user?.username ? getInitials(chat.user.username) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {chat.user?.username || 'Unknown User'}
                              <span className="text-sm text-gray-500 ml-2">
                                • {chat.car?.title || 'Car Deleted'}
                              </span>
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : formatTime(chat.updatedAt)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {chat.car?.room ? `Room: ${chat.car.room}` : 'No Room'}
                          </p>

                          <div className="flex items-center mt-1">
                            {chat.lastMessage && (
                              <p className="text-sm truncate text-gray-600 dark:text-gray-300">
                                {chat.lastMessage.message ? chat.lastMessage.message.substring(0, 50) : 'No message'}
                                {chat.lastMessage.message && chat.lastMessage.message.length > 50 ? '...' : ''}
                              </p>
                            )}
                            {chat.messageCount > 0 && (
                              <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                              </span>
                            )}
                          </div>

                          {chat.user && (
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {chat.user.email && (
                                <span className="flex items-center truncate">
                                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate max-w-[150px] md:max-w-[200px]">
                                    {chat.user.email}
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
