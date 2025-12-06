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

    // Get ALL conversations across the system for superadmin
    const allConversations = await chatServices.getAllConversations();

    // Format the chat summaries to include last message details
    const chatSummaries = allConversations.map((conversation) => {
      return {
        id: conversation.id,
        roomid: conversation.roomid,
        userid: conversation.userid,
        roomName: (conversation as any).room?.name || 'Unknown Room',
        userName: (conversation as any).user?.username || 'Unknown User',
        lastMessageAt: conversation.last_message_at,
        updatedAt: conversation.updated_at,
        isActive: conversation.is_active,
        unreadCount: conversation.unread_count
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