require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Exists' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getRooms() {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, location, adminid');

    if (error) {
      console.error('Error fetching rooms:', error);
      return;
    }

    console.log('Available rooms:');
    data.forEach(room => {
      console.log(`ID: ${room.id}`);
      console.log(`Name: ${room.name}`);
      console.log(`Location: ${room.location}`);
      console.log(`Admin ID: ${room.adminid}`);
      console.log('---');
    });

    if (data.length === 0) {
      console.log('No rooms found in the database.');
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
  }
}

getRooms();