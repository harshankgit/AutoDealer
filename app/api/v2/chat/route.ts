import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { pusherService } from '@/lib/pusherService';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Function to get or create a chat conversation
async function getOrCreateConversation(roomid: string, userid: string) {
  // Create a client to use - use service role if available
  let client;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    client = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  // Try to find existing conversation
  const { data: existingConversation, error } = await client
    .from('chat_conversations')
    .select('*')
    .eq('roomid', roomid)
    .eq('userid', userid)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
    console.error('Error finding conversation:', error);
    return null;
  }

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation if it doesn't exist
  const { data: newConversation, error: createError } = await client
    .from('chat_conversations')
    .insert({
      roomid,
      userid,
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating conversation:', createError);
    return null;
  }

  return newConversation;
}

// Function to get all conversations for a user (for user chat list)
async function getUserConversations(userId: string) {
  // Create a client to use - use service role if available
  let client;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    client = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  const { data, error } = await client
    .from('chat_conversations')
    .select(`
      id,
      roomid,
      userid,
      created_at,
      updated_at,
      last_message_at,
      is_active,
      unread_count,
      room:rooms(name, adminid)
    `)
    .eq('userid', userId)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }

  return data;
}

// Function to get all conversations for an admin (for admin chat list)
async function getAdminConversations(adminId: string) {
  // Create a client to use - use service role if available
  let client;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    client = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  // First, get all rooms where the user is admin
  const { data: rooms, error: roomsError } = await client
    .from('rooms')
    .select('id')
    .eq('adminid', adminId);

  if (roomsError) {
    console.error('Error getting rooms for admin:', roomsError);
    return [];
  }

  if (!rooms || rooms.length === 0) {
    return []; // No rooms means no conversations
  }

  // Extract room IDs
  const roomIds = rooms.map(room => room.id);

  // Then get conversations for those rooms
  const { data, error } = await client
    .from('chat_conversations')
    .select(`
      id,
      roomid,
      userid,
      created_at,
      updated_at,
      last_message_at,
      is_active,
      unread_count,
      user:users(username, email),
      room:rooms(name)
    `)
    .in('roomid', roomIds)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error getting admin conversations:', error);
    return [];
  }

  return data;
}

// Function to get all conversations for super admin
async function getSuperAdminConversations() {
  // Create a client to use - use service role if available
  let client;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    client = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  const { data, error } = await client
    .from('chat_conversations')
    .select(`
      id,
      roomid,
      userid,
      created_at,
      updated_at,
      last_message_at,
      is_active,
      unread_count,
      room:rooms(name),
      user:users(username, email)
    `)
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error getting super admin conversations:', error);
    return [];
  }

  return data;
}

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

    const { conversationId, message, carId, message_type = 'text', fileId, fileName, fileType } = await request.json();
    const senderId = decodedToken.userId;
    const senderType = decodedToken.role;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    // Create a Supabase client with the user's token to enable RLS policies
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Validate that the conversation exists and user has permission
    // Use service role client to avoid JWT issues
    let conversation: any = null;
    let convError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('chat_conversations')
        .select(`
          id,
          roomid,
          userid,
          room:rooms(adminid)
        `)
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    } else {
      // Fallback to user client with RLS (this might cause the JWT error)
      const result = await userSupabase
        .from('chat_conversations')
        .select(`
          id,
          roomid,
          userid,
          room:rooms(adminid)
        `)
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    }

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Determine if sender has permission to send message in this conversation
    const isSenderUser = senderId === conversation.userid;
    const isSenderRoomAdmin = senderId === conversation.room.adminid;
    const isSuperAdmin = senderType === 'superadmin';

    // Check permissions
    if (!(isSenderUser || isSenderRoomAdmin || isSuperAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to send message in this conversation' }, { status: 403 });
    }

    // Prepare car details if this is a car details message
    let carDetails = null;
    if (carId && message_type === 'car_details') {
      const car = await carServices.getCarById(carId);
      if (car) {
        carDetails = {
          id: car.id,
          title: car.title,
          brand: car.brand,
          model: car.model,
          year: car.year,
          price: car.price,
          images: car.images,
          description: car.description
        };
      }
    }

    // Create the message
    // Use service role client to avoid JWT issues
    const { data: newMessage, error: msgError } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            senderid: senderId,
            message: message || '',
            message_type,
            car_details: carDetails,
            file_url: fileId ? `/api/files/${fileId}` : null,
            file_name: fileName || null,
            file_type: fileType || null
          })
          .select()
          .single()
      : await userSupabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            senderid: senderId,
            message: message || '',
            message_type,
            car_details: carDetails,
            file_url: fileId ? `/api/files/${fileId}` : null,
            file_name: fileName || null,
            file_type: fileType || null
          })
          .select()
          .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      console.error('Conversation ID:', conversationId);
      console.error('Sender ID:', senderId);
      console.error('Message:', message);
      return NextResponse.json({ error: `Failed to send message: ${msgError.message || msgError}` }, { status: 500 });
    }

    console.log('Message created successfully:', newMessage); // Debug log

    // Update conversation's last message time
    // Use service role client to avoid JWT issues
    const updateResult = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId)
      : await userSupabase
          .from('chat_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);

    // Get sender info for real-time notification
    const senderInfo = await userServices.getUserById(senderId);

    console.log('Sender info retrieved:', senderInfo); // Debug log

    // Trigger real-time notification for participants in the conversation
    try {
      // Get all participants in the conversation (user and admin)
      // Use service role client to avoid JWT issues
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
        const allParticipants = [
          participants.userid,  // User
          (participants as any).room?.adminid  // Admin
        ].filter(id => id && id !== null);

        for (const participantId of allParticipants) {
          if (participantId) {
            console.log('Sending new message via Pusher to participant:', participantId, {
              message: newMessage,
              sender: senderInfo,
              conversationId,
              timestamp: new Date().toISOString(),
            }); // Debug log

            // Trigger notification for the participant
            await pusherService.sendNewMessage(conversationId, {
              message: newMessage,
              sender: senderInfo,
              conversationId,
              timestamp: new Date().toISOString(),
            });

            // Update unread count for the recipient (only for non-sender)
            if (participantId !== senderId && participantId === participants.userid) { // If user is recipient and not sender
              await pusherService.sendUnreadCountUpdate(participantId, {
                count: 1
              });
            }
          }
        }
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
    console.error('Send message error:', error);
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
    const carId = searchParams.get('carId');
    const userId = searchParams.get('userId'); // For admin view
    const viewType = searchParams.get('viewType') || 'user'; // user, admin, superadmin

    const requesterId = decodedToken.userId;
    const requesterRole = decodedToken.role;

    // If fetching specific conversation messages
    if (conversationId) {
      // Create a Supabase client with the user's token to enable RLS policies
      const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Check if requester has access to this conversation
      // Use service role client to avoid JWT issues
      let conversation: any = null;
      let convError: any = null;

      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const result = await serviceRoleSupabase
          .from('chat_conversations')
          .select(`
            id,
            roomid,
            userid,
            room:rooms(adminid)
          `)
          .eq('id', conversationId)
          .single();

        conversation = result.data;
        convError = result.error;
      } else {
        // Fallback to user client with RLS (this might cause the JWT error)
        const result = await userSupabase
          .from('chat_conversations')
          .select(`
            id,
            roomid,
            userid,
            room:rooms(adminid)
          `)
          .eq('id', conversationId)
          .single();

        conversation = result.data;
        convError = result.error;
      }

      if (convError || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const isUser = requesterId === conversation.userid;
      const isAdmin = requesterId === conversation.room.adminid;
      const isSuperAdmin = requesterRole === 'superadmin';

      if (!(isUser || isAdmin || isSuperAdmin)) {
        return NextResponse.json({ error: 'Unauthorized to access this conversation' }, { status: 403 });
      }

      // Get messages for the conversation
      // Use service role client to avoid JWT issues
      const { data: messages, error: msgError } = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
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
            .order('timestamp', { ascending: true })
        : await userSupabase
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

      console.log(`Fetched ${messages.length} messages for conversation ${conversationId}`); // Debug log
      console.log('Sample message structure:', messages.length > 0 ? messages[0] : 'No messages'); // Debug log

      // Mark messages as read if the recipient is viewing them
      if (messages.length > 0 && requesterId !== messages[0]?.senderid) { // If not sender reading their own messages
        try {
          // Mark messages as read for this user
          // Use service role client to avoid JWT issues
          const updateResult = process.env.SUPABASE_SERVICE_ROLE_KEY
            ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
                .from('chat_messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('is_read', false)
                .neq('senderid', requesterId) // Only mark messages from others as read
            : await userSupabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('is_read', false)
                .neq('senderid', requesterId); // Only mark messages from others as read

          if (updateResult.error) {
            console.error('Error marking messages as read:', updateResult.error);
          }
        } catch (readError) {
          console.error('Error calling mark as read function:', readError);
        }
      }

      // Update conversation's unread count to 0
      // Use service role client to avoid JWT issues
      const unreadUpdateResult = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
            .from('chat_conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId)
            .eq('userid', requesterId) // Only update for the user viewing the chat
        : await userSupabase
            .from('chat_conversations')
            .update({ unread_count: 0 })
            .eq('id', conversationId)
            .eq('userid', requesterId); // Only update for the user viewing the chat

      return NextResponse.json({ messages }, { status: 200 });
    }

    // If fetching conversations list
    if (!conversationId) {
      let conversations = [];

      if (viewType === 'admin') {
        // Admin view: get conversations in their room
        conversations = await getAdminConversations(requesterId);
      } else if (viewType === 'superadmin') {
        // Super admin view: get all conversations
        conversations = await getSuperAdminConversations();
      } else {
        // User view: get conversations for this user
        conversations = await getUserConversations(requesterId);
      }

      return NextResponse.json({ conversations }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE route to close/delete a conversation (for admin/superadmin only)
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await request.json();
    const requesterId = decodedToken.userId;
    const requesterRole = decodedToken.role;

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    // Create a Supabase client with the user's token to enable RLS policies
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Get conversation to check permissions
    // Use service role client to avoid JWT issues
    let conversation: any = null;
    let convError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('chat_conversations')
        .select(`
          id,
          roomid,
          userid,
          room:rooms(adminid)
        `)
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    } else {
      // Fallback to user client with RLS (this might cause the JWT error)
      const result = await userSupabase
        .from('chat_conversations')
        .select(`
          id,
          roomid,
          userid,
          room:rooms(adminid)
        `)
        .eq('id', conversationId)
        .single();

      conversation = result.data;
      convError = result.error;
    }

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const isAdmin = requesterId === conversation.room.adminid;
    const isSuperAdmin = requesterRole === 'superadmin';

    // Only admin of the room or superadmin can delete/close conversations
    if (!(isAdmin || isSuperAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to delete this conversation' }, { status: 403 });
    }

    // Delete the conversation and all associated messages
    // Use service role client to avoid JWT issues
    const { error: deleteError } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_conversations')
          .delete()
          .eq('id', conversationId)
      : await userSupabase
          .from('chat_conversations')
          .delete()
          .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    // Also delete all messages in this conversation
    // Use service role client to avoid JWT issues
    const deleteMessagesResult = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_messages')
          .delete()
          .eq('conversation_id', conversationId)
      : await userSupabase
          .from('chat_messages')
          .delete()
          .eq('conversation_id', conversationId);

    return NextResponse.json({ message: 'Conversation deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}