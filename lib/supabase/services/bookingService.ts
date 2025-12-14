import { createClient } from '@supabase/supabase-js';
import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';

// Define the Booking type
export interface Booking {
  id: string;
  userid: string;
  carid: string;
  roomid?: string; // Optional roomid for bookings associated with a specific room
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'Pending' | 'Booked' | 'Confirmed' | 'Completed' | 'Sold' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

// Booking Service Functions
export const bookingServices = {
  // Create a new booking
  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    try {
      console.log('Creating booking for user:', bookingData.userid, 'and car:', bookingData.carid);

      const { data, error } = await getSupabaseServiceRole()
        .from('bookings')
        .insert([
          {
            userid: bookingData.userid,
            carid: bookingData.carid,
            start_date: bookingData.start_date,
            end_date: bookingData.end_date,
            total_price: bookingData.total_price,
            status: bookingData.status || 'Pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking in database:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code || 'unknown'})`);
      }

      console.log('Booking created successfully:', data?.id);
      return data as Booking;
    } catch (error: any) {
      console.error('Error in createBooking service:', {
        message: error?.message,
        stack: error?.stack,
        bookingData: {
          userid: bookingData.userid,
          carid: bookingData.carid,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date
        }
      });
      return null;
    }
  },

  // Get all bookings
  async getAllBookings(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, user:users(username, email), car:cars(title, brand, model)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all bookings:', error);
        return [];
      }

      return data as Booking[];
    } catch (error) {
      console.error('Error in getAllBookings:', error);
      return [];
    }
  },

  // Get bookings by user ID - Uses RLS so requires client scoped with user JWT
  async getBookingsByUser(userId: string, userToken?: string): Promise<Booking[]> {
    try {
      let supabaseClient;
      if (userToken) {
        // Create client scoped with user token for RLS enforcement
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: { Authorization: `Bearer ${userToken}` },
          },
        });
      } else {
        // Use regular client but explicitly filter by user ID
        supabaseClient = supabase;
      }

      // Get bookings with associated car data
      const { data: bookingsData, error } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          cars!inner (
            title,
            brand,
            model,
            roomid,
            images
          )
        `)
        .eq('userid', userId) // Explicitly filter by user ID when not using token-scoped client
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting bookings by user:', error);
        return [];
      }

      // Extract all unique car room IDs to fetch rooms in a single query
      const uniqueRoomIds = Array.from(new Set(bookingsData
        .map(b => b.cars?.roomid)
        .filter(roomid => roomid)
      )) as string[];

      let roomsMap: Record<string, any> = {};
      if (uniqueRoomIds.length > 0) {
        // Use service role for fetching rooms since they're not directly tied to user auth
        const { data: roomsData, error: roomsError } = await getSupabaseServiceRole()
          .from('rooms')
          .select('id, name, location')
          .in('id', uniqueRoomIds);

        if (!roomsError && roomsData) {
          roomsMap = roomsData.reduce((acc, room) => {
            acc[room.id] = room;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Add room information to bookings
      const bookingsWithRoom = bookingsData.map(booking => {
        if (booking.cars?.roomid && roomsMap[booking.cars.roomid]) {
          return {
            ...booking,
            // Add the roomid at the top level to match UI expectations
            roomid: booking.cars.roomid,
            roomId: roomsMap[booking.cars.roomid] // For name/location access
          };
        }
        return {
          ...booking,
          roomid: booking.cars?.roomid || null
        };
      });

      return bookingsWithRoom as Booking[];
    } catch (error) {
      console.error('Error in getBookingsByUser:', error);
      return [];
    }
  },

  // Get bookings by car ID
  async getBookingsByCar(carId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, user:users(username, email)')
        .eq('carid', carId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting bookings by car:', error);
        return [];
      }

      return data as Booking[];
    } catch (error) {
      console.error('Error in getBookingsByCar:', error);
      return [];
    }
  },

  // Get bookings by room ID
  async getBookingsByRoom(roomid: string): Promise<Booking[]> {
    try {
      // First get all car IDs in the specified room
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id')
        .eq('roomid', roomid);

      if (carsError) {
        console.error('Error getting cars for room:', carsError);
        return [];
      }

      if (!carsData || carsData.length === 0) {
        console.log('No cars found in room:', roomid);
        return [];
      }

      const carIds = carsData.map(car => car.id);

      // Get bookings for those cars
      const { data: bookingsData, error: bookingsError } = await getSupabaseServiceRole()
        .from('bookings')
        .select('*')
        .in('carid', carIds)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error getting bookings by room:', bookingsError);
        return [];
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for cars in room:', roomid, 'Car IDs:', carIds);
        return [];
      }

      // Now fetch car and user details separately to enrich the data
      const bookingIds = bookingsData.map(b => b.id);
      const userIds = Array.from(new Set(bookingsData.map(b => b.userid)));
      const carIdsInBookings = Array.from(new Set(bookingsData.map(b => b.carid)));

      // Fetch car details
      const { data: carDetails, error: carDetailsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id, title, brand, model, roomid')
        .in('id', carIdsInBookings);

      // Fetch user details
      const { data: userDetails, error: userDetailsError } = await getSupabaseServiceRole()
        .from('users')
        .select('id, username, email')
        .in('id', userIds);

      // Create maps for quick lookup
      const carMap = carDetails?.reduce((acc, car) => {
        acc[car.id] = car;
        return acc;
      }, {} as Record<string, any>) || {};

      const userMap = userDetails?.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>) || {};

      // Add car and user details to bookings
      return bookingsData.map(booking => ({
        ...booking,
        car: carMap[booking.carid],
        user: userMap[booking.userid]
      })) as Booking[];
    } catch (error) {
      console.error('Error in getBookingsByRoom:', error);
      return [];
    }
  },

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) {
        console.error('Error getting booking by ID:', error);
        return null;
      }

      return data as Booking;
    } catch (error) {
      console.error('Error in getBookingById:', error);
      return null;
    }
  },

  // Update booking
  async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<Booking | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('bookings')
        .update(bookingData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        return null;
      }

      return data as Booking;
    } catch (error) {
      console.error('Error in updateBooking:', error);
      return null;
    }
  },

  // Delete booking
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseServiceRole()
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('Error deleting booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteBooking:', error);
      return false;
    }
  }
};