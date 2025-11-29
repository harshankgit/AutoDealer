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

  // Get bookings by user ID
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, car:cars(title, brand, model)')
        .eq('userid', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting bookings by user:', error);
        return [];
      }

      return data as Booking[];
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
  async getBookingsByRoom(roomId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, car:cars(title, brand, model), user:users(username, email)')
        .eq('roomid', roomId)
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