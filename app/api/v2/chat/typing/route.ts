import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { pusherService } from '@/lib/pusherService';

// Initialize Supabase client
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

    const { conversationId, isTyping } = await request.json();
    const userId = decodedToken.userId;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    // Validate that the user has access to this conversation (optimized - only check once)
    // Create a Supabase client with the user's token to enable RLS policies
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Use service role client to avoid JWT issues
    let conversation: any = null;
    let convError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('chat_conversations')
        .select('id, roomid, userid')
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    } else {
      // Fallback to user client with RLS
      const result = await userSupabase
        .from('chat_conversations')
        .select('id, roomid, userid')
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    }

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user has permission to send typing indicator
    const isUser = userId === conversation.userid;

    // Get room to check admin
    // Use service role client for room query as well
    let room: any = null;
    let roomError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('rooms')
        .select('adminid')
        .eq('id', conversation.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    } else {
      // Fallback to user client
      const result = await userSupabase
        .from('rooms')
        .select('adminid')
        .eq('id', conversation.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    }

    if (roomError) {
      console.error('Error fetching room for typing indicator:', roomError);
      return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 500 });
    }

    const isAdmin = room && userId === room.adminid;

    if (!(isUser || isAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to send typing indicator' }, { status: 403 });
    }

    // Notify other participants in the conversation directly via Pusher
    // (Skip database operations for typing indicators for better performance)
    // Use service role client for participants query as well
    const { data: participants, error: participantsError } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_conversations')
          .select('userid, room:rooms(adminid)')
          .eq('id', conversationId)
          .single()
      : await userSupabase
          .from('chat_conversations')
          .select('userid, room:rooms(adminid)')
          .eq('id', conversationId)
          .single();

    if (!participantsError && participants) {
      const adminId = (participants as any).room?.adminid;
      const otherParticipants = [
        participants.userid,
        adminId
      ].filter(id => id && id !== userId);

      for (const participantId of otherParticipants) {
        if (participantId) {
          await pusherService.sendTypingStatus(conversationId, {
            userId,
            isTyping: isTyping, // Send the actual typing status
            conversationId
          });
        }
      }
    }

    return NextResponse.json({
      message: isTyping ? 'Typing indicator sent' : 'Stopped typing indicator',
      isTyping
    }, { status: 200 });
  } catch (error) {
    console.error('Typing indicator error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    // Validate that the user has access to this conversation
    // Create a Supabase client with the user's token to enable RLS policies
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Use service role client to avoid JWT issues
    let conversation: any = null;
    let convError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('chat_conversations')
        .select('id, roomid, userid')
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    } else {
      // Fallback to user client with RLS (this might cause the JWT error)
      const result = await userSupabase
        .from('chat_conversations')
        .select('id, roomid, userid')
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    }

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user has permission to view typing indicators
    const requesterId = decodedToken.userId;

    // Get room info using service role client
    let room: any = null;
    let roomError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('rooms')
        .select('adminid')
        .eq('id', conversation.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    } else {
      // Fallback to user client
      const result = await userSupabase
        .from('rooms')
        .select('adminid')
        .eq('id', conversation.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    }

    const isAdmin = room && requesterId === room.adminid;
    const isUser = requesterId === conversation.userid;

    if (!(isUser || isAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to view typing indicators' }, { status: 403 });
    }

    // Get typing indicators for this conversation (excluding the current user)
    // Use service role client to avoid JWT issues
    const { data: typingIndicators, error } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_typing_indicators')
          .select(`
            id,
            conversation_id,
            userid,
            is_typing,
            timestamp,
            user:users(username)
          `)
          .eq('conversation_id', conversationId)
          .eq('is_typing', true)
          .neq('userid', requesterId) // Don't include the current user
      : await userSupabase
          .from('chat_typing_indicators')
          .select(`
            id,
            conversation_id,
            userid,
            is_typing,
            timestamp,
            user:users(username)
          `)
          .eq('conversation_id', conversationId)
          .eq('is_typing', true)
          .neq('userid', requesterId); // Don't include the current user

    if (error) {
      console.error('Error fetching typing indicators:', error);
      return NextResponse.json({ error: 'Failed to fetch typing indicators' }, { status: 500 });
    }

    return NextResponse.json({ typingIndicators }, { status: 200 });
  } catch (error) {
    console.error('Fetch typing indicators error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}