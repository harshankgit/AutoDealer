import { NextResponse } from 'next/server';
import { paymentServices } from '@/lib/supabase/services/paymentService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { verifyToken } from '@/lib/auth';

// Get a specific payment by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paymentId = params.id;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Get the payment
    const payment = await paymentServices.getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Ensure user has access to this payment (either they own it or they're an admin for the related booking)
    if (payment.user_id !== decoded.userId) {
      // Check if user is an admin for the booking's car
      const booking = await bookingServices.getBookingById(payment.booking_id);
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Check if the car belongs to the admin
      const { supabase } = await import('@/lib/supabase/client');
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('adminid')
        .eq('id', booking.carid)
        .single();

      if (carError || !carData || carData.adminid !== decoded.userId) {
        return NextResponse.json({ error: 'Unauthorized access to payment' }, { status: 403 });
      }
    }

    // Get user details
    const { supabase } = await import('@/lib/supabase/client');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email, phone')
      .eq('id', payment.user_id)
      .single();

    // Get booking details to get car ID
    const booking = await bookingServices.getBookingById(payment.booking_id);

    let carDetails = null;
    if (booking && booking.carid) {
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('id, title, brand, model, year')
        .eq('id', booking.carid)
        .single();

      if (!carError && carData) {
        carDetails = {
          id: carData.id,
          title: carData.title,
          brand: carData.brand,
          model: carData.model,
          year: carData.year
        };
      }
    }

    // Combine payment data with user and car details
    const paymentWithDetails = {
      ...payment,
      user: userData ? {
        username: userData.username,
        email: userData.email,
        phone: userData.phone
      } : undefined,
      car: carDetails,
      booking: booking ? {
        start_date: booking.start_date,
        end_date: booking.end_date
      } : undefined
    };

    return NextResponse.json({ payment: paymentWithDetails }, { status: 200 });

  } catch (error: any) {
    console.error('Get payment API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}