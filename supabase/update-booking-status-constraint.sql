-- Add a check constraint to bookings table to allow specific status values
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('Pending', 'Booked', 'Confirmed', 'Completed', 'Sold', 'Cancelled'));