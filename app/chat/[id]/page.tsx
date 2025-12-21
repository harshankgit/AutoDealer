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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Link href="/user/chats">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h1>
        </div>
      </div>

      <div className="h-[calc(100vh-64px)] lg:h-screen">
        <ChatInterface
          conversation={conversation}
          userId={user?.id || ''}
          userName={user?.username || 'You'}
        />
      </div>
    </div>
  );
}