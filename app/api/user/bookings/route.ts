export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
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

    // Use the service role client since we're verifying the JWT ourselves
    // This bypasses RLS but is secure because we explicitly filter by the verified user ID
    const { data: rawBookings, error } = await getSupabaseServiceRole()
      .from('bookings')
      .select(`
        *,
        cars (
          id,
          title,
          brand,
          model,
          year,
          price,
          images,
          rooms (
            id,
            name,
            location
          )
        )
      `)
      .eq('userid', decoded.userId) // Explicitly filter by verified user ID
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user bookings:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        // status: error.status,  // Supabase error doesn't have status property
        details: error.details
      });
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data to match the expected frontend structure
    const transformedBookings = rawBookings?.map(booking => ({
      id: booking.id,
      carId: {
        id: booking.cars?.id,
        title: booking.cars?.title,
        brand: booking.cars?.brand,
        model: booking.cars?.model,
        year: booking.cars?.year,
        price: booking.cars?.price,
        images: booking.cars?.images || [],
      },
      roomId: booking.cars?.rooms ? {
        id: booking.cars.rooms.id,
        name: booking.cars.rooms.name,
        location: booking.cars.rooms.location,
      } : null,
      roomid: booking.cars?.roomid,
      bookingDetails: {
        phone: '', // No phone field exists in bookings table, provide empty string
        notes: '', // No notes field exists in bookings table, provide empty string
      },
      status: booking.status,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    })) || [];

    return NextResponse.json({ bookings: transformedBookings });
  } catch (error: any) {
    console.error('Get user bookings error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}