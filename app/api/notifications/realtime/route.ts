import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pusher from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventType, data, targetUserId } = await request.json();

    if (!eventType || !data || !targetUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Trigger real-time event to the specific user's channel
    await pusher.trigger(`notification-${targetUserId}`, eventType, {
      ...data,
      timestamp: new Date().toISOString(),
      senderId: decoded.userId,
      senderRole: decoded.role,
    });

    return NextResponse.json({ 
      message: 'Notification sent successfully', 
      event: eventType,
      targetUserId 
    });
  } catch (error) {
    console.error('Real-time notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}