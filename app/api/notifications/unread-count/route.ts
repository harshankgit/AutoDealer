import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationServices } from '@/lib/supabase/services/generalServices';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unread notification count for the user
    const count = await notificationServices.getUnreadNotificationsCount(decoded.userId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}