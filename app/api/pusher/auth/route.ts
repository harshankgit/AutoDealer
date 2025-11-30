import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Pusher from 'pusher';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const { socket_id, channel_name } = body;

    // Verify the user's token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Pusher server instance
    const pusher = new Pusher({
      appId: process.env.PUSHER_APPid!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Verify that the user is authorized to subscribe to this channel
    const userId = decoded.userId;
    const expectedChannel = `notification-${userId}`;

    if (channel_name !== expectedChannel) {
      return NextResponse.json({ error: 'Forbidden: Not authorized to access this channel' }, { status: 403 });
    }

    // Authenticate the user for this channel
    const authResponse = pusher.authenticateUser(socket_id, {
      id: userId,
      username: decoded.username || 'User',
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}