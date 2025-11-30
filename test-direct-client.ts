import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create client directly here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectClient() {
  try {
    console.log('Testing direct Supabase client with .eq filter...');

    // Test the same query as used in the API route
    const { data, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('userid', 'e1c076c4-c117-42e6-a7d7-07fe0c81f264')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error with direct client:', error);
    } else {
      console.log('Success with direct client! Data:', JSON.stringify(data, null, 2));
      console.log('Count:', data?.length);
    }
  } catch (err) {
    console.error('Exception in testDirectClient:', err);
  }
}

testDirectClient();