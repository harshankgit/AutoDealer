import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, message, senderId, senderName, roomName } = await request.json();

    if (!conversationId || !message || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the conversation to identify participants
    // Use service role key for this internal operation
    let serviceRoleSupabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
    } else {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    // First get the conversation details
    const { data: conversation, error: convError } = await serviceRoleSupabase
      .from('chat_conversations')
      .select('id, userid, roomid')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('Error getting conversation:', convError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Then get the room to get admin ID
    const { data: room, error: roomError } = await serviceRoleSupabase
      .from('rooms')
      .select('adminid')
      .eq('id', conversation.roomid)
      .single();

    if (roomError || !room) {
      console.error('Error getting room for conversation:', roomError);
      return NextResponse.json({ error: 'Room not found for conversation' }, { status: 500 });
    }

    // Create notifications for both participants (except the sender)
    const notificationsToCreate = [];

    // Add notification for user if sender is not user
    if (senderId !== conversation.userid) {
      notificationsToCreate.push({
        user_id: conversation.userid,
        title: `New message from ${senderName || 'Admin'}`,
        message: message.length > 50 ? message.substring(0, 50) + '...' : message,
        type: 'chat',
        related_id: conversationId,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Add notification for admin if sender is not admin
    if (senderId !== room.adminid) {
      notificationsToCreate.push({
        user_id: room.adminid,
        title: `New message from ${senderName || 'User'}`,
        message: message.length > 50 ? message.substring(0, 50) + '...' : message,
        type: 'chat',
        related_id: conversationId,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Insert notifications if there are any to create
    if (notificationsToCreate.length > 0) {
      const { error: notificationError } = await serviceRoleSupabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
      }

      console.log(`Created ${notificationsToCreate.length} notifications for chat message`);
    }

    return NextResponse.json({ 
      message: 'Notifications created successfully',
      count: notificationsToCreate.length
    }, { status: 200 });

  } catch (error) {
    console.error('Create chat notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}