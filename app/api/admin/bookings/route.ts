import { NextResponse } from 'next/server';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // For superadmin: get all bookings
    if (decoded.role === 'superadmin') {
      const bookings = await bookingServices.getAllBookings();
      return NextResponse.json({ bookings });
    }

    // For regular admin: only show bookings for their room
    const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
    if (!adminRoom) {
      console.log('No room found for admin ID:', decoded.userId);
      return NextResponse.json(
        { error: 'No room found for this admin' },
        { status: 404 }
      );
    }

    console.log('Found room for admin:', adminRoom.id, adminRoom.name);

    // Debug: Get all cars in this room first
    const { data: carsInRoom, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('roomid', adminRoom.id);

    console.log('Cars in admin room:', carsInRoom, 'Error:', carsError);

    // Debug: Get all bookings and their car IDs
    const { data: allBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, carid');

    console.log('All bookings:', allBookings, 'Error:', bookingsError);

    const bookings = await bookingServices.getBookingsByRoom(adminRoom.id);
    console.log('Found', bookings.length, 'bookings for room');

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Pending', 'Booked', 'Confirmed', 'Completed', 'Sold', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await bookingServices.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If it's a regular admin, ensure they own the room for this booking
    if (decoded.role === 'admin') {
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'Admin room not found' },
          { status: 404 }
        );
      }

      // Check if the booking's car belongs to the admin's room
      // First get the car for this booking
      const { supabase } = await import('@/lib/supabase/client');
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('roomid')
        .eq('id', booking.carid)
        .single();

      if (carError || !carData) {
        return NextResponse.json(
          { error: 'Car for this booking not found' },
          { status: 404 }
        );
      }

      if (carData.roomid !== adminRoom.id) {
        return NextResponse.json(
          { error: 'Unauthorized - This booking does not belong to your room' },
          { status: 403 }
        );
      }
    }

    // Update the booking status
    const updatedBooking = await bookingServices.updateBooking(bookingId, { status });

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}