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

    const chatId = params.chatId;

    // Find the specific chat by ID (this is different in Supabase - each row represents a single message)
    // In Supabase we need to get all messages for a room, not a single chat object with nested messages
    const chatMessages = await chatServices.getChatsByRoom(chatId); // Note: This might need adjustment

    if (!chatMessages || chatMessages.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // For Supabase, we might need to get the room information differently
    // In Supabase, each row in the chats table is an individual message, not a conversation object
    // Let's restructure this approach:

    // First, we need to get the room associated with these messages
    // Since each message has a roomid, we can get the first one to use for authorization checks
    if (chatMessages.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const roomId = chatMessages[0].roomid;

    // Only allow admin to access chats related to their room, unless superadmin
    if (decoded.role === 'admin') {
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'No room found for this admin' },
          { status: 404 }
        );
      }

      // Check if the chat's room belongs to admin's room
      if (roomId !== adminRoom.id) {
        return NextResponse.json(
          { error: 'Unauthorized - This chat does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // Format the chat for response, with each row as a separate message
    const formattedChat = {
      roomid: roomId,
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

    const roomId = params.chatId; // In the current code chatId might be the room ID
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
      if (roomId !== adminRoom.id) {
        return NextResponse.json(
          { error: 'Unauthorized - This chat does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // Create a new message in Supabase
    const newMessage = await chatServices.createChat({
      roomid: roomId,
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