import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's notifications
    const notifications = await notificationServices.getNotificationsByUser(decoded.userId);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');
    
    if (notificationId) {
      // Mark specific notification as read
      const updatedNotification = await notificationServices.markNotificationAsRead(notificationId);
      return NextResponse.json({ notification: updatedNotification });
    }

    // If no notificationId, assume it's for marking all as read
    const result = await notificationServices.markAllNotificationsAsRead(decoded.userId);
    return NextResponse.json({ message: 'All notifications marked as read', count: result });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}