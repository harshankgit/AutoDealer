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
  status: string; // pending, confirmed, cancelled, completed
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
            status: bookingData.status || 'pending'
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
      // First get all cars in the room
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('id')
        .eq('roomid', roomid);

      if (carsError) {
        console.error('Error getting cars by room:', carsError);
        return [];
      }

      if (!carsData || carsData.length === 0) {
        return [];
      }

      // Extract car IDs
      const carIds = carsData.map(car => car.id);

      // Then get bookings for those cars
      const { data, error } = await supabase
        .from('bookings')
        .select('*, car:cars(title, brand, model, roomid), user:users(username, email)')
        .in('carid', carIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting bookings by room:', error);
        return [];
      }

      return data as Booking[];
    } catch (error) {
      console.error('Error in getBookingsByRoom:', error);
      return [];
    }
  },

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { error } = await supabase
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