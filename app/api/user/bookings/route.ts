import { NextResponse } from 'next/server';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      );
    }

    // Get bookings for the current user only
    const bookings = await bookingServices.getBookingsByUser(decoded.userId);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}