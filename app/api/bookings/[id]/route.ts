import { NextResponse } from 'next/server';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get the booking
    const booking = await bookingServices.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure the user owns this booking
    if (booking.userid !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    // Get car details for the booking
    const { supabase } = await import('@/lib/supabase/client');
    const { data: carData, error: carError } = await supabase
      .from('cars')
      .select('*, rooms!inner(id, name, location)')
      .eq('id', booking.carid)
      .single();

    if (carError) {
      console.error('Error fetching car details for booking:', carError);
      // Still return the booking without car details
      return NextResponse.json({ booking }, { status: 200 });
    }

    // Add car details to the booking
    const bookingWithCar = {
      ...booking,
      // Include the roomid from the car data
      roomid: carData?.roomid,
      car: carData
    };

    return NextResponse.json({ booking: bookingWithCar }, { status: 200 });

  } catch (error: any) {
    console.error('Get booking API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}