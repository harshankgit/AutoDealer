import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateMissingRoomIds() {
  try {
    // First, get bookings that have no roomid but have a carid
    const { data: bookingsWithoutRoom, error: fetchError } = await supabase
      .from('bookings')
      .select('id, carid')
      .is('roomid', null);

    if (fetchError) {
      console.error('Error fetching bookings without roomid:', fetchError);
      return;
    }

    console.log(`Found ${bookingsWithoutRoom.length} bookings without roomid, updating them...`);

    for (const booking of bookingsWithoutRoom) {
      // For each booking, get the car to get its roomid
      const { data: car, error: carError } = await supabase
        .from('cars')
        .select('roomid')
        .eq('id', booking.carid)
        .single();

      if (carError) {
        console.error(`Error getting car for booking ${booking.id}:`, carError);
        continue;
      }

      if (!car || !car.roomid) {
        console.log(`No room found for car ${booking.carid} in booking ${booking.id}`);
        continue;
      }

      // Update the booking with the roomid
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ roomid: car.roomid })
        .eq('id', booking.id);

      if (updateError) {
        console.error(`Error updating booking ${booking.id} with roomid:`, updateError);
      } else {
        console.log(`Successfully updated booking ${booking.id} with roomid ${car.roomid}`);
      }
    }

    console.log('Finished updating bookings with missing room IDs');
  } catch (error) {
    console.error('Error in updateMissingRoomIds:', error);
  }
}

updateMissingRoomIds();