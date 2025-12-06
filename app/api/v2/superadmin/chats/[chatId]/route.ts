import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { verifyToken } from '@/lib/auth';
import { pusherService } from '@/lib/pusherService';
import { userServices } from '@/lib/supabase/services/userService';

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterRole = decodedToken.role;
    
    // Only superadmin can access this
    if (requesterRole !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - Super admin access only' }, { status: 403 });
    }

    // For superadmin view, the chatId is the conversation ID
    const conversationId = params.chatId;

    if (!conversationId) {
      return NextResponse.json({ error: 'Invalid chat identifier' }, { status: 400 });
    }

    // Check if the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, roomid, userid')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get messages for the conversation
    const { data: messages, error: msgError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        conversation_id,
        senderid,
        message,
        message_type,
        car_details,
        file_url,
        file_name,
        file_type,
        is_read,
        timestamp,
        created_at,
        sender:users(username, role)
      `)
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ 
      chat: {
        id: conversation.id,
        messages
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get superadmin chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add message to chat (for superadmin)
export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, message_type = 'text' } = await request.json();
    const senderId = decodedToken.userId;
    const senderRole = decodedToken.role;

    // Only superadmin can send messages
    if (senderRole !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - Super admin access only' }, { status: 403 });
    }

    // For superadmin view, the chatId is the conversation ID
    const conversationId = params.chatId;

    if (!conversationId) {
      return NextResponse.json({ error: 'Invalid chat identifier' }, { status: 400 });
    }

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check if the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .select('id, roomid, userid')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Create the message
    const { data: newMessage, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        senderid: senderId,
        message,
        message_type
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update conversation's last message time
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    // Get sender info for real-time notification
    const senderInfo = await userServices.getUserById(senderId);

    // Trigger real-time notification for the participants
    try {
      await pusherService.sendNewMessage(conversationId, {
        message: newMessage,
        sender: senderInfo,
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
      });

      // Update unread count for the user and admin
      await pusherService.sendUnreadCountUpdate(conversation.userid, {
        count: 1
      });
      
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('adminid')
        .eq('id', conversation.roomid)
        .single();
        
      if (!roomError && room) {
        await pusherService.sendUnreadCountUpdate(room.adminid, {
          count: 1
        });
      }
    } catch (notificationError) {
      console.error('Real-time notification error:', notificationError);
      // Don't fail the whole operation if real-time notification fails
    }

    return NextResponse.json({ 
      message: 'Message sent successfully', 
      data: newMessage 
    }, { status: 201 });
  } catch (error) {
    console.error('Send superadmin message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE route to close/delete a conversation (for superadmin only)
export async function DELETE(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requesterRole = decodedToken.role;

    // Only superadmin can delete conversations
    if (requesterRole !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized - Super admin access only' }, { status: 403 });
    }

    const conversationId = params.chatId;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    // Get conversation to check it exists
    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete the conversation and all associated messages
    const { error: deleteError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    // Also delete all messages in this conversation
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', conversationId);

    return NextResponse.json({ message: 'Conversation deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete superadmin conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}