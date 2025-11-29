import { NextResponse } from 'next/server';
import { bookingServices } from '@/lib/supabase/services/bookingService';
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

    // Get all bookings
    const bookings = await bookingServices.getAllBookings();

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}