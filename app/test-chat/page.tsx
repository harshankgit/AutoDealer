'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/components/ChatProvider';
import ChatRoom from '@/components/ChatRoom';
import { verifyToken } from '@/lib/auth';

const TestChatPage = () => {
  const { isRealtimeConnected, typingUsers } = useChat();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState('');
  const [allConversations, setAllConversations] = useState<any[]>([]);

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = verifyToken(token);
      if (decodedToken) {
        setCurrentUser(decodedToken);
      }
    }
    
    // Load sample conversations
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/v2/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  if (!currentUser) {
    return <div className="p-4">Please log in to test chat functionality</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Chat System Test</h1>
      
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">System Status</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isRealtimeConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            Real-time: {isRealtimeConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="text-sm">
            Current User: {currentUser.username} (ID: {currentUser.userId})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {allConversations.length === 0 ? (
              <p className="text-gray-500">No conversations found</p>
            ) : (
              allConversations.map((conv) => (
                <div 
                  key={conv.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    conversationId === conv.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500' : ''
                  }`}
                  onClick={() => setConversationId(conv.id)}
                >
                  <div className="font-medium">
                    {conv.room?.name || 'Chat Room'} {conv.unread_count > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {conv.room?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Room */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Chat Room</h2>
          {conversationId ? (
            <div className="border rounded-lg overflow-hidden h-[500px] flex flex-col">
              <ChatRoom 
                conversationId={conversationId} 
                currentUserId={currentUser.userId} 
                currentUserRole={currentUser.role} 
              />
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}

          {/* Typing Status */}
          {conversationId && typingUsers[conversationId] && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Other user is typing...
            </div>
          )}
        </div>
      </div>

      {/* Test Controls */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Test Functions</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={loadConversations}
          >
            Refresh Conversations
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => {
              // Test sending a test notification
              if (conversationId && currentUser) {
                fetch('/api/notifications/onesignal/send', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: 'Test notification from admin',
                    recipientId: 'test-user-id',
                    conversationId,
                    senderName: 'System'
                  })
                });
              }
            }}
          >
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestChatPage;