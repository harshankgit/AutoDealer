import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const roomId = params.chatId; // In Supabase, this might be the room ID

    // Find all messages for the room
    const chatMessages = await chatServices.getChatsByRoom(roomId);

    if (!chatMessages || chatMessages.length === 0) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Group messages by room and format response
    const formattedChat = {
      roomid: roomId,
      messages: chatMessages.map((msg) => ({
        id: msg.id,
        message: msg.message,
        senderid: msg.senderid,
        sender_type: 'user', // This would need to be determined from user details
        timestamp: msg.timestamp,
        is_read: false,
      })),
    };

    return NextResponse.json({ chat: formattedChat });
  } catch (error) {
    console.error('Get individual superadmin chat error:', error);
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

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const roomId = params.chatId; // In Supabase, this might be the room ID
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create a new message in Supabase
    const newMessage = await chatServices.createChat({
      roomid: roomId,
      senderid: decoded.userId,
      message: message,
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
    console.error('Add superadmin message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}