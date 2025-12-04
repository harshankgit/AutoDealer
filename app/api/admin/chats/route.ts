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
    // We need to group messages by room and user combination to create unique chat summaries
    // Group messages by a combination of roomid and user senderid to create user-car chat summaries
    const chatGroups: { [key: string]: any[] } = {};

    for (const chat of chats) {
      // Create a composite key combining roomid and the user who sent the message
      // This allows us to group chats by user for the same room
      const userKey = `${chat.roomid}-${chat.senderid}`;

      if (!chatGroups[userKey]) {
        chatGroups[userKey] = [];
      }
      chatGroups[userKey].push(chat);
    }

    // Format the chat summaries to include detailed information
    const chatSummaries = await Promise.all(Object.entries(chatGroups).map(async ([userKey, userChats]) => {
      // Parse the composite key (roomid-userid) - UUIDs have hyphens, so extract properly
      const roomIdLength = 36; // UUID length with hyphens
      const roomid = userKey.substring(0, roomIdLength);
      const senderid = userKey.substring(roomIdLength + 1); // +1 to skip the separator hyphen

      // Get room details
      const room = await roomServices.getRoomById(roomid);

      // Get user details for the sender of the messages
      let user = null;
      if (senderid) {
        user = await userServices.getUserById(senderid);
      }

      // Find the most recent message to represent the chat
      const lastMessage = userChats.length > 0 ? userChats[0] : null; // Assuming latest first, adjust if needed

      // For car identification, we need to get the correct cars based on the room context
      let relevantCar = null;
      if (decoded.role === 'admin') {
        // For admin, get their cars specifically for this room
        const adminCars = await carServices.getCarsByAdmin(decoded.userId);
        relevantCar = adminCars.find(car => car.roomid === roomid);
      } else {
        // For superadmin, get cars for this specific room
        const allCarsInRoom = await carServices.getAllCars({ roomid });
        if (allCarsInRoom.length > 0) {
          relevantCar = allCarsInRoom[0]; // Take first car in the room
        }
      }

      return {
        id: userKey, // Use the composite key as the unique ID
        roomid: roomid,
        userid: senderid,
        car: relevantCar ? {
          id: relevantCar.id,
          title: relevantCar.title,
          images: relevantCar.images,
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
        messageCount: userChats.length,
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