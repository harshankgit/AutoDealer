-- SQL Queries to Populate Sample Data for Graphs

-- Insert sample users data
INSERT INTO users (id, email, username, created_at) VALUES
  ('user-1', 'john.doe@example.com', 'johndoe', NOW() - INTERVAL '365 days'),
  ('user-2', 'jane.smith@example.com', 'janesmith', NOW() - INTERVAL '300 days'),
  ('user-3', 'robert.wilson@example.com', 'robertw', NOW() - INTERVAL '250 days'),
  ('user-4', 'emily.davis@example.com', 'emilyd', NOW() - INTERVAL '200 days'),
  ('user-5', 'michael.brown@example.com', 'mikeb', NOW() - INTERVAL '180 days'),
  ('user-6', 'sarah.johnson@example.com', 'sarahj', NOW() - INTERVAL '150 days'),
  ('user-7', 'david.miller@example.com', 'davidm', NOW() - INTERVAL '120 days'),
  ('user-8', 'lisa.wilson@example.com', 'lisaw', NOW() - INTERVAL '90 days'),
  ('user-9', 'chris.taylor@example.com', 'chrisc', NOW() - INTERVAL '60 days'),
  ('user-10', 'amy.martinez@example.com', 'amym', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  created_at = EXCLUDED.created_at;

-- Insert sample cars data
INSERT INTO cars (id, title, brand, model, year, price, mileage, fuel_type, transmission, roomid, adminid) VALUES
  ('car-1', 'Sedan', 'Toyota', 'Camry', 2022, 25000, 15000, 'Petrol', 'Automatic', 'room-1', 'admin-1'),
  ('car-2', 'SUV', 'Honda', 'CR-V', 2023, 32000, 8000, 'Petrol', 'Automatic', 'room-1', 'admin-1'),
  ('car-3', 'Sedan', 'BMW', '3 Series', 2021, 42000, 20000, 'Petrol', 'Automatic', 'room-2', 'admin-2'),
  ('car-4', 'SUV', 'Audi', 'Q5', 2022, 48000, 12000, 'Petrol', 'Automatic', 'room-2', 'admin-2'),
  ('car-5', 'Hatchback', 'Volkswagen', 'Golf', 2023, 28000, 5000, 'Petrol', 'Manual', 'room-3', 'admin-3'),
  ('car-6', 'Sedan', 'Mercedes', 'C-Class', 2021, 45000, 18000, 'Petrol', 'Automatic', 'room-3', 'admin-3'),
  ('car-7', 'Sedan', 'Toyota', 'Corolla', 2020, 22000, 25000, 'Petrol', 'Automatic', 'room-1', 'admin-1'),
  ('car-8', 'SUV', 'Toyota', 'RAV4', 2022, 30000, 16000, 'Petrol', 'Automatic', 'room-4', 'admin-4'),
  ('car-9', 'Sedan', 'Audi', 'A4', 2023, 40000, 7000, 'Petrol', 'Automatic', 'room-4', 'admin-4'),
  ('car-10', 'SUV', 'BMW', 'X5', 2022, 60000, 10000, 'Petrol', 'Automatic', 'room-5', 'admin-5')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  price = EXCLUDED.price,
  mileage = EXCLUDED.mileage,
  fuel_type = EXCLUDED.fuel_type,
  transmission = EXCLUDED.transmission,
  roomid = EXCLUDED.roomid,
  adminid = EXCLUDED.adminid;

-- Insert sample global visit count
INSERT INTO counters (id, count_value, updated_at) VALUES
  ('global_visits', 12450, NOW())
ON CONFLICT (id) DO UPDATE SET
  count_value = EXCLUDED.count_value,
  updated_at = EXCLUDED.updated_at;

-- Insert sample monthly visits data for the last 12 months
INSERT INTO monthly_visits (year_month, month_name, visit_count, updated_at) VALUES
  ('2024-01', 'Jan 2024', 850, NOW()),
  ('2024-02', 'Feb 2024', 920, NOW()),
  ('2024-03', 'Mar 2024', 1100, NOW()),
  ('2024-04', 'Apr 2024', 1250, NOW()),
  ('2024-05', 'May 2024', 1080, NOW()),
  ('2024-06', 'Jun 2024', 1320, NOW()),
  ('2024-07', 'Jul 2024', 1480, NOW()),
  ('2024-08', 'Aug 2024', 1620, NOW()),
  ('2024-09', 'Sep 2024', 1550, NOW()),
  ('2024-10', 'Oct 2024', 1720, NOW()),
  ('2024-11', 'Nov 2024', 1850, NOW()),
  ('2024-12', 'Dec 2024', 1980, NOW())
ON CONFLICT (year_month) DO UPDATE SET
  month_name = EXCLUDED.month_name,
  visit_count = EXCLUDED.visit_count,
  updated_at = EXCLUDED.updated_at;

-- Verify the data has been inserted
SELECT 'Users Count:' as label, COUNT(*) as count FROM users
UNION ALL
SELECT 'Cars Count:' as label, COUNT(*) as count FROM cars
UNION ALL
SELECT 'Global Visits Count:' as label, count_value as count FROM counters WHERE id = 'global_visits'
UNION ALL
SELECT 'Monthly Visits Records:' as label, COUNT(*) as count FROM monthly_visits;