import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    // Get ALL chats across the system for superadmin
    const allChats = await chatServices.getAllChats();

    // Group messages by room to create chat summaries (since in Supabase each row is an individual message)
    const chatsByRoom: { [roomId: string]: any[] } = {};
    allChats.forEach(chat => {
      if (!chatsByRoom[chat.roomid]) {
        chatsByRoom[chat.roomid] = [];
      }
      chatsByRoom[chat.roomid].push(chat);
    });

    // Format the chat summaries to include last message details
    const chatSummaries = Object.entries(chatsByRoom).map(([roomId, roomChats]) => {
      const lastMessage = roomChats.length > 0 ? roomChats[roomChats.length - 1] : null;

      return {
        roomid: roomId,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          timestamp: lastMessage.timestamp,
          senderId: lastMessage.senderid,
        } : null,
        messageCount: roomChats.length,
        updatedAt: lastMessage?.timestamp || new Date().toISOString(),
      };
    });

    return NextResponse.json({ chats: chatSummaries });
  } catch (error) {
    console.error('Get all chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}