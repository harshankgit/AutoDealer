import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function populateSampleVisits() {
  console.log('Populating sample visits data for monthly visits graph...');

  // First, get a valid car and user ID to create visits
  const { data: cars } = await supabase
    .from('cars')
    .select('id')
    .limit(1);

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (!cars || cars.length === 0) {
    console.log('No cars found, creating a sample car first...');
    // Create a sample car
    const { data: sampleCar } = await supabase
      .from('cars')
      .insert([{
        title: 'Sample Car',
        brand: 'Sample',
        model: 'Test',
        year: 2022,
        price: 25000,
        mileage: 15000,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        ownership_history: '1st Owner',
        description: 'Sample car for testing',
        condition: 'Good',
        availability: 'Available',
        roomid: 'sample-room', // This might need to be an existing room
        adminid: users && users.length > 0 ? users[0].id : 'sample-admin'
      }])
      .select()
      .single();
    
    if (sampleCar) {
      console.log('Created sample car:', sampleCar.id);
    } else {
      console.log('Could not create sample car');
      return;
    }
  }
  
  if (!users || users.length === 0) {
    console.log('No users found, creating a sample user...');
    // Create a sample user
    const { data: sampleUser } = await supabase
      .from('users')
      .insert([{
        email: 'sample@user.com',
        username: 'sample_user',
        password: 'password123',
        role: 'user'
      }])
      .select()
      .single();
    
    if (sampleUser) {
      console.log('Created sample user:', sampleUser.id);
    } else {
      console.log('Could not create sample user');
      return;
    }
  }

  // Refresh data to get the created records
  const { data: finalCars } = await supabase
    .from('cars')
    .select('id')
    .limit(1);
  
  const { data: finalUsers } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (!finalCars || finalCars.length === 0 || !finalUsers || finalUsers.length === 0) {
    console.log('Could not get valid car and user IDs');
    return;
  }

  const carId = finalCars[0].id;
  const userId = finalUsers[0].id;

  console.log(`Using car ID: ${carId} and user ID: ${userId}`);

  // Create sample visit data for the last 12 months
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 12; i++) {
    // For each month, create some random number of visits
    const visitsThisMonth = Math.floor(Math.random() * 20) + 10; // 10-30 visits per month
    
    // Calculate start and end of the month
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    
    for (let j = 0; j < visitsThisMonth; j++) {
      // Random day in the month
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const visitDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 
                                Math.floor(Math.random() * 24), // Random hour
                                Math.floor(Math.random() * 60)); // Random minute

      const { error } = await supabase
        .from('visits')
        .insert([{
          carid: carId,
          userid: userId,
          visited_at: visitDate.toISOString()
        }]);
      
      if (error) {
        console.error('Error inserting visit:', error);
      }
    }
    
    console.log(`Added ${visitsThisMonth} visits for ${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`);
  }

  console.log('Sample visits data populated successfully!');
}

populateSampleVisits();