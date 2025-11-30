import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

const supabase = createClient(supabaseUrl, serviceRoleKey); // Use service role for querying

async function checkBookings() {
  try {
    // Query all bookings to see what's in the database
    const { data: allBookings, error: allBookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10); // Get the 10 most recent bookings

    if (allBookingsError) {
      console.error('Error fetching all bookings:', allBookingsError);
      return;
    }

    console.log('All recent bookings in database:');
    console.log(JSON.stringify(allBookings, null, 2));

    // Now specifically check for bookings with the user ID from your JWT
    const userIdFromJWT = 'e1c076c4-c117-42e6-a7d7-07fe0c81f264';
    const { data: userBookings, error: userBookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('userid', userIdFromJWT);

    if (userBookingsError) {
      console.error('Error fetching user bookings:', userBookingsError);
      return;
    }

    console.log(`\nBookings for user ${userIdFromJWT}:`);
    console.log(JSON.stringify(userBookings, null, 2));

    // Also check for the specific booking ID we created
    const bookingId = 'b04dd4f2-6c5d-4b2c-9372-be9d0d8ee587';
    const { data: specificBooking, error: specificBookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (specificBookingError) {
      console.error('Error fetching specific booking:', specificBookingError);
    } else {
      console.log(`\nSpecific booking ${bookingId}:`);
      console.log(JSON.stringify(specificBooking, null, 2));
    }
    
  } catch (error) {
    console.error('Check bookings error:', error);
  }
}

// Run the check
checkBookings();