import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterId = decodedToken.userId;
    const requesterRole = decodedToken.role;

    // For admin view, get all conversations for the admin's room(s)
    let conversationsQuery;
    
    if (requesterRole === 'superadmin') {
      // Super admin can see all conversations
      conversationsQuery = supabase
        .from('chat_conversations')
        .select(`
          id,
          userid,
          roomid,
          created_at,
          updated_at,
          last_message_at,
          is_active,
          unread_count,
          user:users(username, email)
        `)
        .order('last_message_at', { ascending: false });
    } else if (requesterRole === 'admin') {
      // Regular admin can only see conversations for their rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .eq('adminid', requesterId);

      if (roomsError) {
        console.error('Error fetching admin rooms:', roomsError);
        return NextResponse.json({ error: 'Failed to fetch admin rooms' }, { status: 500 });
      }

      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map(room => room.id);
        conversationsQuery = supabase
          .from('chat_conversations')
          .select(`
            id,
            userid,
            roomid,
            created_at,
            updated_at,
            last_message_at,
            is_active,
            unread_count,
            user:users(username, email)
          `)
          .in('roomid', roomIds)
          .order('last_message_at', { ascending: false });
      } else {
        // If admin has no rooms, return empty array
        return NextResponse.json({ conversations: [] }, { status: 200 });
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized to access admin chats' }, { status: 403 });
    }

    const { data: conversations, error: convError } = await conversationsQuery;

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Fetch the latest message for each conversation to show preview
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const { data: latestMessage, error: msgError } = await supabase
          .from('chat_messages')
          .select('message, timestamp, senderid')
          .eq('conversation_id', conv.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conv,
          lastMessage: msgError ? null : latestMessage
        };
      })
    );

    return NextResponse.json({
      conversations: enhancedConversations
    }, { status: 200 });
  } catch (error) {
    console.error('Get admin chats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}