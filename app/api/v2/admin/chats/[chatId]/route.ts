import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { pusherService } from '@/lib/pusherService';
import { userServices } from '@/lib/supabase/services/userService';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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

    const requesterId = decodedToken.userId;
    const requesterRole = decodedToken.role;

    // Try to interpret the chatId parameter in multiple formats:
    // Format 1: roomId-userId (to look up conversation)
    // Format 2: direct conversationId

    let conversationId = null;
    let roomid = null;
    let targetUserId = null;
    let roomForRoomIdFormat = null; // Declare room variable at the top level

    // First, try to treat it as a direct conversation ID (UUID format)
    // Create service role client to bypass RLS for admin operations
    const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: conversationByDirectId, error: convByIdError } = await serviceRoleSupabase
      .from('chat_conversations')
      .select('id, roomid, userid')
      .eq('id', params.chatId)
      .single();

    if (conversationByDirectId && !convByIdError) {
      // Successfully found conversation by direct ID
      conversationId = conversationByDirectId.id;
      roomid = conversationByDirectId.roomid;
      targetUserId = conversationByDirectId.userid;
    } else {
      // Otherwise, treat as roomId-userId format
      const parts = params.chatId.split('-');
      // Since UUIDs have 5 parts separated by hyphens, we need to reconstruct the roomid properly
      // Format: [firstPartOfRoomId]-[remainingPartsAsRoomId]-[userId]
      if (parts.length < 2) {
        return NextResponse.json({ error: 'Invalid chat identifier format' }, { status: 400 });
      }

      // Properly handle UUID format: roomId is first UUID (36 chars with hyphens),
      // and userId is the second UUID (36 chars with hyphens)
      // Format: [36-char-uuid]-[36-char-uuid]
      if (parts.length < 10) { // A proper combined ID should have many parts due to UUID hyphens
        return NextResponse.json({ error: 'Invalid chat identifier format' }, { status: 400 });
      }

      // Since both room ID and user ID are UUIDs, we need to identify where the first UUID ends and the second begins
      // A UUID is in format 8-4-4-4-12 hyphens, so look for where the first complete UUID ends
      // Reconstruct the room ID as the first 8-4-4-4-12 pattern (first UUID)
      const roomIdParts = parts.slice(0, 5); // This should capture the first UUID: 8-4-4-4-12 segments
      // Actually, let's be more specific: the first UUID is 5 segments: [8 chars]-[4 chars]-[4 chars]-[4 chars]-[12 chars]
      // So find where to split by looking for the pattern

      // Since it's complex, let's extract the first 36-char UUID pattern manually
      // A UUID has 32 hex chars + 4 hyphens at specific places: 8-4-4-4-12
      const fullIdString = params.chatId;

      // Find the position of the 5th hyphen (after the first UUID)
      let hyphenCount = 0;
      let splitIndex = 0;
      for (let i = 0; i < fullIdString.length; i++) {
          if (fullIdString[i] === '-') {
              hyphenCount++;
              // After 4 hyphens, we've finished the first UUID
              // (8 chars + 1 hyphen + 4 chars + 1 hyphen + 4 chars + 1 hyphen + 4 chars + 1 hyphen + 12 chars)
              if (hyphenCount === 5) {
                  splitIndex = i;
                  break;
              }
          }
      }

      if (splitIndex === 0) {
        return NextResponse.json({ error: 'Invalid chat identifier format - unable to parse UUIDs' }, { status: 400 });
      }

      roomid = fullIdString.substring(0, splitIndex);
      targetUserId = fullIdString.substring(splitIndex + 1);

      // Verify that the admin has access to this room
      const { data: roomLocal, error: roomError } = await serviceRoleSupabase
        .from('rooms')
        .select('id, adminid')
        .eq('id', roomid)
        .single();

      if (roomError || !roomLocal) {
        console.log(`Room not found for ID: ${roomid}. The chat ID might be malformed or the room may have been deleted.`);
        return NextResponse.json({
          error: 'Room not found. The room might have been deleted or the chat identifier is invalid.',
          details: 'Ensure the room exists before accessing conversations in it.'
        }, { status: 404 });
      }

      roomForRoomIdFormat = roomLocal; // Assign to the outer scope variable

      // Check if requester is the admin of this room or a superadmin (before trying to create conversation)
      const isRoomAdmin = requesterId === roomForRoomIdFormat.adminid;
      const isSuperAdmin = requesterRole === 'superadmin';

      if (!(isRoomAdmin || isSuperAdmin)) {
        return NextResponse.json({ error: 'Unauthorized to access this chat' }, { status: 403 });
      }

      // Find the conversation between this room and user
      let convData = null;
      let convError = null;

      const { data: existingConv, error: existingConvError } = await serviceRoleSupabase
        .from('chat_conversations')
        .select('id')
        .eq('roomid', roomid)
        .eq('userid', targetUserId)
        .single();

      if (existingConvError && existingConvError.code === 'PGRST116') { // No rows found
        // Conversation doesn't exist, create it
        const { data: newConversation, error: createError } = await serviceRoleSupabase
          .from('chat_conversations')
          .insert([{
            roomid: roomid,
            userid: targetUserId,
            last_message_at: new Date().toISOString(),
          }])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return NextResponse.json({
            error: 'Failed to create conversation',
            details: createError.message
          }, { status: 500 });
        }

        convData = newConversation;
      } else if (existingConvError) {
        // Some other error occurred
        console.error('Error finding conversation:', existingConvError);
        return NextResponse.json({ error: 'Failed to access conversation' }, { status: 500 });
      } else {
        // Conversation already exists
        convData = existingConv;
      }

      conversationId = convData.id;
    }

    // Check if requester is the admin of this room or a superadmin
    // Fetch room data for direct conversation ID case
    let roomForCheck = null;
    if (conversationByDirectId && !convByIdError) {
      // For direct conversation ID, fetch room data using the roomid from conversation
      const { data: roomData, error: roomError } = await serviceRoleSupabase
        .from('rooms')
        .select('id, adminid')
        .eq('id', conversationByDirectId.roomid)
        .single();

      if (roomError || !roomData) {
        console.log(`Room not found for ID: ${conversationByDirectId.roomid}`);
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      roomForCheck = roomData;
    } else {
      // For roomId-userId format, room is already defined in the previous code block
      roomForCheck = roomForRoomIdFormat;
    }

    if (!roomForCheck) {
      return NextResponse.json({ error: 'Room not found for authorization check' }, { status: 404 });
    }

    const isRoomAdmin = requesterId === roomForCheck.adminid;
    const isSuperAdmin = requesterRole === 'superadmin';

    if (!(isRoomAdmin || isSuperAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to access this chat' }, { status: 403 });
    }

    // Get messages for the conversation
    const { data: messages, error: msgError } = await serviceRoleSupabase
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

    // Mark messages as read if admin is viewing them
    if (messages && messages.length > 0 && requesterId !== messages[0]?.senderid) { // If not sender reading their own messages
      try {
        // Mark messages as read for this admin
        const { error: updateError } = await serviceRoleSupabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('is_read', false)
          .neq('senderid', requesterId); // Only mark messages from others as read

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      } catch (readError) {
        console.error('Error marking messages as read:', readError);
      }
    }

    // Update conversation's unread count to 0
    await serviceRoleSupabase
      .from('chat_conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);

    return NextResponse.json({
      chat: {
        id: conversationId,
        messages
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Get admin chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add message to chat (for admin)
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

    // Try to handle the conversation ID in multiple formats like in the GET method
    let actualConversationId = null;
    let roomidForPost = null;
    let roomid = null; // Declare roomid at the top level for the POST function
    let targetUserId = null; // Also declare targetUserId

    // First, try to treat it as a direct conversation ID
    const { data: conversationByDirectId, error: convByIdError } = await serviceRoleSupabase
      .from('chat_conversations')
      .select('id, roomid')
      .eq('id', params.chatId)
      .single();

    if (conversationByDirectId && !convByIdError) {
      // Successfully found conversation by direct ID
      actualConversationId = conversationByDirectId.id;
      roomidForPost = conversationByDirectId.roomid;
    } else {
      // Otherwise, treat as roomId-userId format
      const parts = params.chatId.split('-');
      if (parts.length < 2) {
        return NextResponse.json({ error: 'Invalid chat identifier format' }, { status: 400 });
      }

      // Properly handle UUID format: roomId is first UUID (36 chars with hyphens),
      // and userId is the second UUID (36 chars with hyphens)
      // Format: [36-char-uuid]-[36-char-uuid]
      if (parts.length < 10) { // A proper combined ID should have many parts due to UUID hyphens
        return NextResponse.json({ error: 'Invalid chat identifier format' }, { status: 400 });
      }

      // Since both room ID and user ID are UUIDs, we need to identify where the first UUID ends and the second begins
      // A UUID is in format 8-4-4-4-12 hyphens, so look for where the first complete UUID ends
      // Reconstruct the room ID as the first 8-4-4-4-12 pattern (first UUID)

      // Since it's complex, let's extract the first 36-char UUID pattern manually
      // A UUID has 32 hex chars + 4 hyphens at specific places: 8-4-4-4-12
      const fullIdString = params.chatId;

      // Find the position of the 5th hyphen (after the first UUID)
      let hyphenCount = 0;
      let splitIndex = 0;
      for (let i = 0; i < fullIdString.length; i++) {
          if (fullIdString[i] === '-') {
              hyphenCount++;
              // After 4 hyphens, we've finished the first UUID
              // (8 chars + 1 hyphen + 4 chars + 1 hyphen + 4 chars + 1 hyphen + 4 chars + 1 hyphen + 12 chars)
              if (hyphenCount === 5) {
                  splitIndex = i;
                  break;
              }
          }
      }

      if (splitIndex === 0) {
        return NextResponse.json({ error: 'Invalid chat identifier format - unable to parse UUIDs' }, { status: 400 });
      }

      roomid = fullIdString.substring(0, splitIndex);
      targetUserId = fullIdString.substring(splitIndex + 1);

      // Find the conversation between this room and user
      let convData = null;
      let convError = null;

      const { data: existingConv, error: existingConvError } = await serviceRoleSupabase
        .from('chat_conversations')
        .select('id, roomid')
        .eq('roomid', roomid)
        .eq('userid', targetUserId)
        .single();

      if (existingConvError && existingConvError.code === 'PGRST116') { // No rows found
        // Conversation doesn't exist, create it
        const { data: newConversation, error: createError } = await serviceRoleSupabase
          .from('chat_conversations')
          .insert([{
            roomid: roomid,
            userid: targetUserId,
            last_message_at: new Date().toISOString(),
          }])
          .select('id, roomid')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return NextResponse.json({
            error: 'Failed to create conversation',
            details: createError.message
          }, { status: 500 });
        }

        convData = newConversation;
      } else if (existingConvError) {
        // Some other error occurred
        console.error('Error finding conversation:', existingConvError);
        return NextResponse.json({ error: 'Failed to access conversation' }, { status: 500 });
      } else {
        // Conversation already exists
        convData = existingConv;
      }

      actualConversationId = convData.id;
      roomidForPost = convData.roomid; // Use the roomid from the found/created conversation
    }

    if (!actualConversationId) {
      return NextResponse.json({ error: 'Invalid conversation identifier' }, { status: 400 });
    }

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Verify that the admin has access to this room
    const { data: room, error: roomError } = await serviceRoleSupabase
      .from('rooms')
      .select('id, adminid')
      .eq('id', roomidForPost)
      .single();

    if (roomError || !room) {
      console.log(`Room not found for ID: ${roomidForPost}. The chat ID might be malformed or the room may have been deleted.`);
      return NextResponse.json({
        error: 'Room not found. The room might have been deleted or the chat identifier is invalid.',
        details: 'Ensure the room exists before sending messages to it.'
      }, { status: 404 });
    }

    // Check if requester is the admin of this room or a superadmin
    const isRoomAdmin = senderId === room.adminid;
    const isSuperAdmin = senderRole === 'superadmin';

    if (!(isRoomAdmin || isSuperAdmin)) {
      return NextResponse.json({ error: 'Unauthorized to send message in this chat' }, { status: 403 });
    }

    // Create the message
    // Using service role key for admin messages to avoid RLS complications
    const { data: newMessage, error: msgError } = await serviceRoleSupabase
      .from('chat_messages')
      .insert({
        conversation_id: actualConversationId,
        senderid: senderId,
        message,
        message_type,
        status: 'sent'
      })
      .select()
      .single();

    if (msgError) {
      console.error('Error creating message:', msgError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update conversation's last message time
    await serviceRoleSupabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', actualConversationId);

    // Get the conversation to get the target user ID for notifications
    const { data: conversationForNotification, error: convNotifError } = await serviceRoleSupabase
      .from('chat_conversations')
      .select('userid')
      .eq('id', actualConversationId)
      .single();

    // Get sender info for real-time notification
    const senderInfo = await userServices.getUserById(senderId);

    // Trigger real-time notification for the user
    try {
      // Get all participants in the conversation (user and admin) to send notifications
      const { data: participants, error: participantsError } = await serviceRoleSupabase
        .from('chat_conversations')
        .select('userid, room:rooms(adminid)')
        .eq('id', actualConversationId)
        .single();

      if (!participantsError && participants) {
        const allParticipants = [
          participants.userid,  // User
          (participants as any).room?.adminid  // Admin
        ].filter(id => id && id !== null);

        for (const participantId of allParticipants) {
          if (participantId && participantId !== senderId) { // Only send to recipients, not sender
            // Send Pusher notification
            await pusherService.sendNewMessage(actualConversationId, {
              message: newMessage,
              sender: senderInfo,
              conversationId: actualConversationId,
              timestamp: new Date().toISOString(),
            });

            // Trigger message delivered notification to sender
            await pusherService.sendDeliveryStatus(actualConversationId, {
              messageId: newMessage.id,
              conversationId: actualConversationId,
              timestamp: new Date().toISOString(),
            });

            // Send OneSignal push notification to recipient
            try {
              const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/onesignal/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: message || 'New message',
                  recipientId: participantId,
                  conversationId: actualConversationId,
                  senderName: senderInfo?.username || 'Someone'
                })
              });

              if (!notificationResponse.ok) {
                console.error('OneSignal notification failed:', await notificationResponse.text());
              } else {
                console.log('OneSignal notification sent successfully to:', participantId);
              }
            } catch (onesignalError) {
              console.error('Error sending OneSignal notification:', onesignalError);
            }

            // Create in-app notification for the recipient
            try {
              const inAppNotificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/chat`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, // Use admin token for internal call
                },
                body: JSON.stringify({
                  conversationId: actualConversationId,
                  message: message || 'New message',
                  senderId,
                  senderName: senderInfo?.username || 'Someone',
                  roomName: (participants as any).room?.name || 'Chat Room'
                })
              });

              if (!inAppNotificationResponse.ok) {
                console.error('In-app notification failed:', await inAppNotificationResponse.text());
              } else {
                console.log('In-app notification created successfully for participants');
              }
            } catch (inAppError) {
              console.error('Error creating in-app notification:', inAppError);
            }

            // Trigger real-time notification for notification bell
            try {
              const realTimeNotificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/realtime`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  eventType: 'new-chat-notification',
                  data: {
                    title: `New message from ${senderInfo?.username || 'Admin'}`,
                    message: message.length > 50 ? message.substring(0, 50) + '...' : message,
                    type: 'chat',
                    relatedId: actualConversationId,
                    senderId,
                    senderName: senderInfo?.username || 'Someone',
                    timestamp: new Date().toISOString()
                  },
                  targetUserId: participantId // Send to the recipient
                })
              });

              if (!realTimeNotificationResponse.ok) {
                console.error('Real-time notification failed:', await realTimeNotificationResponse.text());
              } else {
                console.log('Real-time notification sent to:', participantId);
              }
            } catch (realtimeError) {
              console.error('Error sending real-time notification:', realtimeError);
            }

            // Update unread count for the recipient
            if (participantId === participants.userid) { // If user is recipient
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
    console.error('Send admin message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}