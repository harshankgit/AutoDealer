import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function populateSampleData() {
  console.log('Populating sample data for graphs...');

  // Sample users data
  const sampleUsers = [
    { id: 'user-1', email: 'john.doe@example.com', username: 'johndoe', created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-2', email: 'jane.smith@example.com', username: 'janesmith', created_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-3', email: 'robert.wilson@example.com', username: 'robertw', created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-4', email: 'emily.davis@example.com', username: 'emilyd', created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-5', email: 'michael.brown@example.com', username: 'mikeb', created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-6', email: 'sarah.johnson@example.com', username: 'sarahj', created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-7', email: 'david.miller@example.com', username: 'davidm', created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-8', email: 'lisa.wilson@example.com', username: 'lisaw', created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-9', email: 'chris.taylor@example.com', username: 'chrisc', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-10', email: 'amy.martinez@example.com', username: 'amym', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  // Sample cars data
  const sampleCars = [
    { id: 'car-1', title: 'Sedan', brand: 'Toyota', model: 'Camry', year: 2022, price: 25000, mileage: 15000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-2', title: 'SUV', brand: 'Honda', model: 'CR-V', year: 2023, price: 32000, mileage: 8000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-3', title: 'Sedan', brand: 'BMW', model: '3 Series', year: 2021, price: 42000, mileage: 20000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-4', title: 'SUV', brand: 'Audi', model: 'Q5', year: 2022, price: 48000, mileage: 12000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-5', title: 'Hatchback', brand: 'Volkswagen', model: 'Golf', year: 2023, price: 28000, mileage: 5000, fuel_type: 'Petrol', transmission: 'Manual' },
    { id: 'car-6', title: 'Sedan', brand: 'Mercedes', model: 'C-Class', year: 2021, price: 45000, mileage: 18000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-7', title: 'Sedan', brand: 'Toyota', model: 'Corolla', year: 2020, price: 22000, mileage: 25000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-8', title: 'SUV', brand: 'Toyota', model: 'RAV4', year: 2022, price: 30000, mileage: 16000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-9', title: 'Sedan', brand: 'Audi', model: 'A4', year: 2023, price: 40000, mileage: 7000, fuel_type: 'Petrol', transmission: 'Automatic' },
    { id: 'car-10', title: 'SUV', brand: 'BMW', model: 'X5', year: 2022, price: 60000, mileage: 10000, fuel_type: 'Petrol', transmission: 'Automatic' },
  ];

  // Insert sample users
  console.log('Inserting sample users...');
  for (const user of sampleUsers) {
    const { error } = await supabase
      .from('users')
      .upsert([user], { onConflict: 'id' });
    if (error) {
      console.error('Error inserting user:', error.message);
    }
  }

  // Insert sample cars
  console.log('Inserting sample cars...');
  for (const car of sampleCars) {
    const { error } = await supabase
      .from('cars')
      .upsert([car], { onConflict: 'id' });
    if (error) {
      console.error('Error inserting car:', error.message);
    }
  }

  // Insert sample global visit count
  console.log('Inserting sample global visit count...');
  const { error: globalVisitError } = await supabase
    .from('counters')
    .upsert([{ id: 'global_visits', count_value: 12450, updated_at: new Date().toISOString() }], { onConflict: 'id' });
  if (globalVisitError) {
    console.error('Error inserting global visit counter:', globalVisitError.message);
  }

  // Insert sample monthly visits data for the last 12 months
  console.log('Inserting sample monthly visits data...');
  const months = [
    { name: 'Jan 2024', year_month: '2024-01', count: 850 },
    { name: 'Feb 2024', year_month: '2024-02', count: 920 },
    { name: 'Mar 2024', year_month: '2024-03', count: 1100 },
    { name: 'Apr 2024', year_month: '2024-04', count: 1250 },
    { name: 'May 2024', year_month: '2024-05', count: 1080 },
    { name: 'Jun 2024', year_month: '2024-06', count: 1320 },
    { name: 'Jul 2024', year_month: '2024-07', count: 1480 },
    { name: 'Aug 2024', year_month: '2024-08', count: 1620 },
    { name: 'Sep 2024', year_month: '2024-09', count: 1550 },
    { name: 'Oct 2024', year_month: '2024-10', count: 1720 },
    { name: 'Nov 2024', year_month: '2024-11', count: 1850 },
    { name: 'Dec 2024', year_month: '2024-12', count: 1980 },
  ];

  for (const month of months) {
    const { error } = await supabase
      .from('monthly_visits')
      .upsert([{ year_month: month.year_month, month_name: month.name, visit_count: month.count, updated_at: new Date().toISOString() }], { onConflict: 'year_month' });
    if (error) {
      console.error('Error inserting monthly visits:', error.message);
    }
  }

  console.log('Sample data populated successfully!');
}

populateSampleData();