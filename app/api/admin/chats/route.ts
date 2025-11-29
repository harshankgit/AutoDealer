import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    let chats;

    if (decoded.role === 'admin') {
      // For regular admin: only show chats related to their room
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'No room found for this admin' },
          { status: 404 }
        );
      }

      // Find chats for this admin's room
      chats = await chatServices.getChatsByRoom(adminRoom.id);
    } else {
      // For superadmin: show all chats
      chats = await chatServices.getAllChats();
    }

    // In Supabase, each row in the chats table is an individual message, not a conversation
    // We need to group messages by room to create the chat summaries
    // This requires restructuring the data compared to MongoDB's approach

    // Group messages by roomid to create chat summaries
    const chatsByRoom: { [roomId: string]: any[] } = {};
    chats.forEach(chat => {
      if (!chatsByRoom[chat.roomid]) {
        chatsByRoom[chat.roomid] = [];
      }
      chatsByRoom[chat.roomid].push(chat);
    });

    // Format the chat summaries to include detailed information
    const chatSummaries = await Promise.all(Object.entries(chatsByRoom).map(async ([roomId, roomChats]) => {
      // Get room details
      const room = await roomServices.getRoomById(roomId);

      // Get car details associated with this room (if any)
      const cars = await carServices.getCarsByAdmin(decoded.userId); // This might not be the right approach
      const car = cars.find(c => c.roomid === roomId); // Find a car associated with the room

      // Get user details for the sender of the last message
      const lastMessage = roomChats.length > 0 ? roomChats[0] : null; // Assuming latest first, adjust if needed
      let user = null;
      if (lastMessage?.senderid) {
        user = await userServices.getUserById(lastMessage.senderid);
      }

      return {
        id: roomId,
        roomid: roomId,
        car: car ? {
          id: car.id,
          title: car.title,
          images: car.images,
          room: room?.name || 'Unknown Room'
        } : null,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email
        } : null,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          timestamp: lastMessage.timestamp,
          senderId: lastMessage.senderid,
        } : null,
        messageCount: roomChats.length,
        updatedAt: lastMessage?.timestamp || new Date().toISOString()
      };
    }));

    return NextResponse.json({ chats: chatSummaries });
  } catch (error) {
    console.error('Get admin chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}