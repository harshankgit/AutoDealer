"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/user-context';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Conversation } from '@/types/chat';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const carId = params && typeof params.id === 'string'
    ? params.id
    : params && Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (carId) {
      startOrGetConversation();
    }
  }, [user, carId]);

  const startOrGetConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Start conversation with car details
      const response = await fetch('/api/v2/chat/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Fetch full conversation details
        const convResponse = await fetch(`/api/v2/chat?conversationId=${data.conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (convResponse.ok) {
          const convData = await convResponse.json();
          // Create conversation object from response
          const conv: Conversation = {
            id: data.conversationId,
            roomid: convData.conversation?.roomid || '',
            userid: user?.id || '',
            created_at: convData.conversation?.created_at || new Date().toISOString(),
            updated_at: convData.conversation?.updated_at || new Date().toISOString(),
            last_message_at: convData.conversation?.last_message_at || new Date().toISOString(),
            is_active: true,
            unread_count: 0,
            room: convData.conversation?.room,
            user: convData.conversation?.user,
          };
          setConversation(conv);
        }
      } else {
        console.error('Failed to start conversation');
        router.push('/user/chats');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      router.push('/user/chats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Skeleton Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] ${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-600'} p-4 rounded-2xl rounded-tl-sm ${i % 2 === 0 ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                  <div className="space-y-2">
                    <div className={`h-3 rounded w-full ${i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500'} animate-pulse`}></div>
                    <div className={`h-3 rounded w-3/4 ${i % 2 === 0 ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500'} animate-pulse`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="h-10 w-16 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Conversation not found
          </h2>
          <Link href="/user/chats">
            <Button>Go to Chats</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 animate-fadeInPage">
      {/* Fixed Top Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm z-10 sticky top-0 transition-all duration-300">
        <div className="flex items-center gap-3">
          <Link href="/user/chats">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 dark:text-white truncate transition-all duration-300">
              {conversation.room?.name || conversation.user?.username || 'Chat'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate transition-all duration-300">
              {conversation.user?.username || 'Dealer'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface - Flex to take remaining space */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          conversation={conversation}
          userId={user?.id || ''}
          userName={user?.username || 'You'}
        />
      </div>

      <style jsx global>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInPage {
          animation: fadeInPage 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}