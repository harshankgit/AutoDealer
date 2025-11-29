import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import pusher from '@/lib/pusher';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { type, message, userId, carId } = await request.json();

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message' },
        { status: 400 }
      );
    }

    // Prepare notification data
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      userId,
      carId,
      createdAt: new Date(),
      read: false,
    };

    // Trigger Pusher event to notify the admin
    await pusher.trigger(`notification-${decoded.userId}`, 'new-notification', {
      notification,
    });

    return NextResponse.json({
      message: 'Notification sent successfully',
      notification,
    });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}