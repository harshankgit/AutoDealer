import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the socketid and channel_name from the request body
    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socketid');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Check if the channel name follows our convention (e.g., "private-notification-{userId}")
    const userId = decoded.userId;
    const expectedChannelName = `notification-${userId}`;
    
    if (!channelName.endsWith(expectedChannelName)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate the Pusher signature
    const stringToSign = `${socketId}:${channelName}`;
    const signature = crypto
      .createHmac('sha256', process.env.PUSHER_SECRET!)
      .update(stringToSign)
      .digest('hex');

    const auth = `${process.env.PUSHER_KEY!}:${signature}`;

    return NextResponse.json({ auth });
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}