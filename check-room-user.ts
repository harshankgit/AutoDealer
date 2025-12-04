import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRoomAndUser() {
  try {
    // Check the specific room
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', 'd15c6994-3cac-4120-b49f-29e67e6cf6d5')
      .single();

    console.log('Room data:', JSON.stringify(roomData, null, 2));

    // Check the admin user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', '230024dc-0f3e-4855-a92d-f8f26149811c')
      .single();

    console.log('Admin user data:', JSON.stringify(userData, null, 2));

    // Check if the room has an adminid field that links to the admin user
    const { data: roomsWithAdmin, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('adminid', '230024dc-0f3e-4855-a92d-f8f26149811c');

    console.log('Rooms with admin ID:', JSON.stringify(roomsWithAdmin, null, 2));
    
    // Also check all rooms to see the adminid field structure
    const { data: allRooms, error: allRoomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(10);

    console.log('All rooms sample:', JSON.stringify(allRooms, null, 2));
  } catch (error) {
    console.error('Error in checkRoomAndUser:', error);
  }
}

checkRoomAndUser();