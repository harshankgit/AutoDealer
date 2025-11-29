import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    // Get ALL chats across the system for superadmin
    // The chat structure in Supabase will be different from MongoDB's nested messages
    // We may need to adjust this query based on how the chat data is structured in Supabase
    const chats = await chatServices.getAllChats(); // This method doesn't exist yet, need to add it

    // Format the chat summaries to include last message details
    // This will need to match the Supabase data structure
    const chatSummaries = chats.map(chat => ({
      id: chat.id,
      roomid: chat.roomid,
      senderid: chat.senderid,
      message: chat.message, // Direct message field instead of nested messages
      timestamp: chat.timestamp,
      created_at: chat.created_at,
    }));

    return NextResponse.json({ chats: chatSummaries });
  } catch (error) {
    console.error('Get all chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}