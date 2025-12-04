import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

interface MessageResponse {
  id: any;
  message: any;
  senderId: any;
  senderType: any;
  timestamp: any;
  isRead: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileId?: string; // Add fileId field
}

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // The chatId parameter here is actually the userKey (format: roomid-senderid)
    // We need to extract the roomid (first 36 chars including hyphens) and senderid
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (8-4-4-4-12 = 36 chars total)
    const roomIdLength = 36;
    if (params.chatId.length <= roomIdLength + 1) { // +1 for the separator hyphen
      return NextResponse.json(
        { error: 'Invalid chat identifier format' },
        { status: 400 }
      );
    }

    const roomid = params.chatId.substring(0, roomIdLength);
    const senderid = params.chatId.substring(roomIdLength + 1); // +1 to skip the separator hyphen

    if (!roomid || !senderid || roomid.length !== 36 || senderid.length === 0) {
      return NextResponse.json(
        { error: 'Invalid chat identifier' },
        { status: 400 }
      );
    }

    // Authorization check - ensure admin can only access their room's chats (do this first)
    if (decoded.role === 'admin') {
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'No room found for this admin' },
          { status: 404 }
        );
      }

      // Check if the chat's room belongs to admin's room
      if (roomid !== adminRoom.id) {
        return NextResponse.json(
          { error: 'Unauthorized - This chat does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // Get all messages for this specific room
    const chatMessages = await chatServices.getChatsByRoom(roomid);

    if (!chatMessages || chatMessages.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // For now, since we don't have recipient tracking in the schema, we'll return all messages
    // from the room since this user is involved. In a complete implementation, we'd want to
    // properly track and filter for messages between this admin and this specific user
    // For now, return all messages in the room since the admin is viewing this user's chat
    // (which they opened from the chat list showing this user's activity in this room)
    const userMessages = chatMessages;

    // In a more complete implementation, we might want to filter to show both user and admin messages
    // For now, we'll show all messages in the room that involve the specific user
    // In a real implementation, we'd have a more sophisticated system to track 1:1 conversations

    // Format the chat for response, with each row as a separate message
    const formattedChat = {
      roomid: roomid,
      messages: chatMessages.map((msg) => {
        const messageData:MessageResponse = {
          id: msg.id,
          message: msg.message,
          senderId: msg.senderid,
          senderType: 'user', // This will need to be determined from the user info
          timestamp: msg.timestamp,
          isRead: false, // Read status would need to be a separate table in Supabase
        };

        return messageData;
      }),
    };

    return NextResponse.json({ chat: formattedChat });
  } catch (error) {
    console.error('Get individual admin chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add message to chat
export async function POST(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // The chatId parameter here is actually the userKey (format: roomid-senderid)
    // We need to extract the roomid to post the message
    const [roomid, targetUserId] = params.chatId.split('-');

    if (!roomid || !targetUserId) {
      return NextResponse.json(
        { error: 'Invalid chat identifier' },
        { status: 400 }
      );
    }

    const { message, fileId, fileName, fileType } = await request.json();

    if (!message && !fileId) {
      return NextResponse.json(
        { error: 'Either message or file is required' },
        { status: 400 }
      );
    }

    // Check authorization - only allow admin to send messages about their own cars, unless superadmin
    if (decoded.role === 'admin') {
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'No room found for this admin' },
          { status: 404 }
        );
      }

      // Check if the room belongs to admin's room
      if (roomid !== adminRoom.id) {
        return NextResponse.json(
          { error: 'Unauthorized - This chat does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // Create a new message in Supabase
    const newMessage = await chatServices.createChat({
      roomid: roomid,
      senderid: decoded.userId,
      message: message || '',
      timestamp: new Date().toISOString(),
    });

    if (!newMessage) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Add admin message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}