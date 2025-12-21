import { createClient } from '@supabase/supabase-js';
import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';

// Define the Payment type
export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_receipt_image: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_details: any; // JSONB field
  admin_notes: string | null;
  admin_scanner_image: string | null;
  approved_by: string | null;
  approved_at: string | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
  };
  car?: {
    title: string;
    brand: string;
    model: string;
  };
}

// Payment Service Functions
export const paymentServices = {
  // Create a new payment
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'payment_status' | 'approved_at' | 'approved_by'>): Promise<Payment | null> {
    try {
      console.log('Creating payment for user:', paymentData.user_id, 'and booking:', paymentData.booking_id);

      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .insert([
          {
            booking_id: paymentData.booking_id,
            user_id: paymentData.user_id,
            amount: paymentData.amount,
            payment_receipt_image: paymentData.payment_receipt_image,
            payment_method: paymentData.payment_method,
            payment_details: paymentData.payment_details,
            admin_notes: paymentData.admin_notes,
            admin_scanner_image: paymentData.admin_scanner_image,
            expected_delivery_date: paymentData.expected_delivery_date
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment in database:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code || 'unknown'})`);
      }

      console.log('Payment created successfully:', data?.id);
      return data as Payment;
    } catch (error: any) {
      console.error('Error in createPayment service:', {
        message: error?.message,
        stack: error?.stack,
        paymentData: {
          user_id: paymentData.user_id,
          booking_id: paymentData.booking_id,
          amount: paymentData.amount
        }
      });
      return null;
    }
  },

  // Get all payments (for superadmin)
  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all payments:', error);
        return [];
      }

      return data as Payment[];
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return [];
    }
  },

  // Get payments by user ID
  async getPaymentsByUser(userId: string, userToken?: string): Promise<Payment[]> {
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

      const { data, error } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('user_id', userId) // Explicitly filter by user ID when not using token-scoped client
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting payments by user:', error);
        return [];
      }

      return data as Payment[];
    } catch (error) {
      console.error('Error in getPaymentsByUser:', error);
      return [];
    }
  },

  // Get payments by booking ID
  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting payments by booking:', error);
        return [];
      }

      return data as Payment[];
    } catch (error) {
      console.error('Error in getPaymentsByBooking:', error);
      return [];
    }
  },

  // Get payments by admin/room (for admin users)
  async getPaymentsByAdmin(adminId: string): Promise<Payment[]> {
    try {
      // Get rooms for the admin
      const { data: roomsData, error: roomsError } = await getSupabaseServiceRole()
        .from('rooms')
        .select('id')
        .eq('adminid', adminId);

      if (roomsError) {
        console.error('Error getting rooms for admin:', roomsError);
        return [];
      }

      if (!roomsData || roomsData.length === 0) {
        console.log('No rooms found for admin:', adminId);
        return [];
      }

      const roomIds = roomsData.map(room => room.id);

      // Get cars in admin's rooms
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id')
        .in('roomid', roomIds);

      if (carsError) {
        console.error('Error getting cars for admin:', carsError);
        return [];
      }

      if (!carsData || carsData.length === 0) {
        console.log('No cars found for admin:', adminId);
        return [];
      }

      const carIds = carsData.map(car => car.id);

      // Get bookings for admin's cars
      const { data: bookingsData, error: bookingsError } = await getSupabaseServiceRole()
        .from('bookings')
        .select('id')
        .in('carid', carIds);

      if (bookingsError) {
        console.error('Error getting bookings for admin:', bookingsError);
        return [];
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for admin:', adminId);
        return [];
      }

      const bookingIds = bookingsData.map(booking => booking.id);

      // Finally, get payments for those bookings
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting payments by admin:', error);
        return [];
      }

      return data as Payment[];
    } catch (error) {
      console.error('Error in getPaymentsByAdmin:', error);
      return [];
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error getting payment by ID:', error);
        return null;
      }

      return data as Payment;
    } catch (error) {
      console.error('Error in getPaymentById:', error);
      return null;
    }
  },

  // Update payment
  async updatePayment(paymentId: string, paymentData: Partial<Payment>): Promise<Payment | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .update({
          ...paymentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        return null;
      }

      return data as Payment;
    } catch (error) {
      console.error('Error in updatePayment:', error);
      return null;
    }
  },

  // Delete payment
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseServiceRole()
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error('Error deleting payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePayment:', error);
      return false;
    }
  },

  // Get payments with user and car details
  async getPaymentsWithDetails(): Promise<Payment[]> {
    try {
      // First, get all payments
      const { data: paymentsData, error: paymentsError } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error getting payments:', paymentsError);
        return [];
      }

      if (!paymentsData || paymentsData.length === 0) {
        return [];
      }

      // Get unique user IDs and booking IDs to fetch user and booking details in batches
      const userIds = Array.from(new Set(paymentsData.map(p => p.user_id)));
      const bookingIds = Array.from(new Set(paymentsData.map(p => p.booking_id)));

      // Get user details
      const { data: usersData, error: usersError } = await getSupabaseServiceRole()
        .from('users')
        .select('id, username, email')
        .in('id', userIds);

      if (usersError) {
        console.error('Error getting user details:', usersError);
        return paymentsData as Payment[];
      }

      // Get bookings to get car IDs
      const { data: bookingsData, error: bookingsError } = await getSupabaseServiceRole()
        .from('bookings')
        .select('id, carid')
        .in('id', bookingIds);

      if (bookingsError) {
        console.error('Error getting booking details:', bookingsError);
        return paymentsData as Payment[];
      }

      // Get unique car IDs from bookings
      const carIds = Array.from(new Set(bookingsData.filter(b => b.carid).map(b => b.carid)));

      // Get car details
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id, title, brand, model')
        .in('id', carIds);

      if (carsError) {
        console.error('Error getting car details:', carsError);
        return paymentsData as Payment[];
      }

      // Create lookup maps for efficient data matching
      const userMap = new Map(usersData.map(u => [u.id, { username: u.username, email: u.email }]));
      const bookingMap = new Map(bookingsData.map(b => [b.id, b.carid]));
      const carMap = new Map(carsData.map(c => [c.id, { title: c.title, brand: c.brand, model: c.model }]));

      // Combine payment data with user and car details
      const paymentsWithDetails = paymentsData.map(payment => {
        const user = userMap.get(payment.user_id);
        const carId = bookingMap.get(payment.booking_id);
        const car = carId ? carMap.get(carId) : undefined;

        return {
          ...payment,
          user,
          car
        } as Payment;
      });

      return paymentsWithDetails;
    } catch (error) {
      console.error('Error in getPaymentsWithDetails:', error);
      return [];
    }
  },

  // Get payments with user and car details for a specific user
  async getPaymentsWithDetailsByUser(userId: string, userToken?: string): Promise<Payment[]> {
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

      const { data: paymentsData, error: paymentsError } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error getting payments by user:', paymentsError);
        return [];
      }

      if (!paymentsData || paymentsData.length === 0) {
        return [];
      }

      // Get unique booking IDs to fetch booking details
      const bookingIds = Array.from(new Set(paymentsData.map(p => p.booking_id)));

      // Get bookings to get car IDs
      const { data: bookingsData, error: bookingsError } = await getSupabaseServiceRole()
        .from('bookings')
        .select('id, carid')
        .in('id', bookingIds);

      if (bookingsError) {
        console.error('Error getting booking details:', bookingsError);
        return paymentsData as Payment[];
      }

      // Get unique car IDs from bookings
      const carIds = Array.from(new Set(bookingsData.filter(b => b.carid).map(b => b.carid)));

      // Get car details
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id, title, brand, model')
        .in('id', carIds);

      if (carsError) {
        console.error('Error getting car details:', carsError);
        return paymentsData as Payment[];
      }

      // Create lookup maps for efficient data matching
      const bookingMap = new Map(bookingsData.map(b => [b.id, b.carid]));
      const carMap = new Map(carsData.map(c => [c.id, { title: c.title, brand: c.brand, model: c.model }]));

      // Combine payment data with user and car details
      const paymentsWithDetails = paymentsData.map(payment => {
        const user = { username: 'You', email: 'user@example.com' }; // User's own data would come from token
        const carId = bookingMap.get(payment.booking_id);
        const car = carId ? carMap.get(carId) : undefined;

        return {
          ...payment,
          user,
          car
        } as Payment;
      });

      return paymentsWithDetails;
    } catch (error) {
      console.error('Error in getPaymentsWithDetailsByUser:', error);
      return [];
    }
  },

  // Get payments with user and car details for admin
  async getPaymentsWithDetailsByAdmin(adminId: string): Promise<Payment[]> {
    try {
      // Get rooms for the admin
      const { data: roomsData, error: roomsError } = await getSupabaseServiceRole()
        .from('rooms')
        .select('id')
        .eq('adminid', adminId);

      if (roomsError) {
        console.error('Error getting rooms for admin:', roomsError);
        return [];
      }

      if (!roomsData || roomsData.length === 0) {
        console.log('No rooms found for admin:', adminId);
        return [];
      }

      const roomIds = roomsData.map(room => room.id);

      // Get cars in admin's rooms
      const { data: carsData, error: carsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id')
        .in('roomid', roomIds);

      if (carsError) {
        console.error('Error getting cars for admin:', carsError);
        return [];
      }

      if (!carsData || carsData.length === 0) {
        console.log('No cars found for admin:', adminId);
        return [];
      }

      const carIds = carsData.map(car => car.id);

      // Get bookings for admin's cars
      const { data: bookingsData, error: bookingsError } = await getSupabaseServiceRole()
        .from('bookings')
        .select('id, carid')
        .in('carid', carIds);

      if (bookingsError) {
        console.error('Error getting bookings for admin:', bookingsError);
        return [];
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for admin:', adminId);
        return [];
      }

      const bookingIds = bookingsData.map(booking => booking.id);

      // Finally, get payments for those bookings
      const { data: paymentsData, error: paymentsError } = await getSupabaseServiceRole()
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Error getting payments by admin:', paymentsError);
        return [];
      }

      // Get unique user IDs to fetch user details
      const userIds = Array.from(new Set(paymentsData.map(p => p.user_id)));

      // Get user details
      const { data: usersData, error: usersError } = await getSupabaseServiceRole()
        .from('users')
        .select('id, username, email')
        .in('id', userIds);

      if (usersError) {
        console.error('Error getting user details:', usersError);
        return paymentsData as Payment[];
      }

      // Get unique car IDs from bookings
      const carIdsForDetails = Array.from(new Set(bookingsData.filter(b => b.carid).map(b => b.carid)));

      // Get car details
      const { data: carsDetailsData, error: carsDetailsError } = await getSupabaseServiceRole()
        .from('cars')
        .select('id, title, brand, model')
        .in('id', carIdsForDetails);

      if (carsDetailsError) {
        console.error('Error getting car details:', carsDetailsError);
        return paymentsData as Payment[];
      }

      // Create lookup maps for efficient data matching
      const userMap = new Map(usersData.map(u => [u.id, { username: u.username, email: u.email }]));
      const bookingMap = new Map(bookingsData.map(b => [b.id, b.carid]));
      const carMap = new Map(carsDetailsData.map(c => [c.id, { title: c.title, brand: c.brand, model: c.model }]));

      // Combine payment data with user and car details
      const paymentsWithDetails = paymentsData.map(payment => {
        const user = userMap.get(payment.user_id);
        const carId = bookingMap.get(payment.booking_id);
        const car = carId ? carMap.get(carId) : undefined;

        return {
          ...payment,
          user,
          car
        } as Payment;
      });

      return paymentsWithDetails;
    } catch (error) {
      console.error('Error in getPaymentsWithDetailsByAdmin:', error);
      return [];
    }
  }
};