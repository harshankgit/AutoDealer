import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      bookingId, 
      carId, 
      userId, 
      userName, 
      carTitle, 
      carBrand, 
      carModel, 
      bookingDate,
      roomAdminId
    } = await request.json();

    if (!bookingId || !userId || !roomAdminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use service role key for this internal operation
    let serviceRoleSupabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
    } else {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
    }

    // Create notification for admin about new booking
    const { error: notificationError } = await serviceRoleSupabase
      .from('notifications')
      .insert([{
        user_id: roomAdminId,
        title: 'New Car Booking',
        message: `${userName} has booked ${carBrand || ''} ${carModel || carTitle || 'a car'}`,
        type: 'booking',
        related_id: bookingId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (notificationError) {
      console.error('Error creating booking notification:', notificationError);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    console.log(`Booking notification created for admin ${roomAdminId}`);

    // Optionally, create a notification for the user confirming their booking
    const { error: userNotificationError } = await serviceRoleSupabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: 'Booking Confirmation',
        message: `Your booking for ${carBrand || ''} ${carModel || carTitle || 'a car'} has been submitted`,
        type: 'booking_confirmation',
        related_id: bookingId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (userNotificationError) {
      console.error('Error creating user booking notification:', userNotificationError);
      // Don't fail the entire process if user notification fails
    } else {
      console.log(`Booking confirmation notification created for user ${userId}`);
    }

    return NextResponse.json({ 
      message: 'Booking notifications created successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Create booking notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}