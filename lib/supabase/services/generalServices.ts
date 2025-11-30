import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';

// Helper function to generate a UUID (for use in server-side)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Define the Room type
export interface Room {
  id: string;
  name: string;
  description?: string;
  location?: string;
  contact_info?: any; // Contact information for the room
  image?: string | null;
  adminid?: string; // Optional adminid for rooms associated with an admin
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

// Define the Payment type
export interface Payment {
  id: string;
  bookingid: string;
  userid: string;
  amount: number;
  currency: string;
  status: string; // pending, completed, failed, refunded
  payment_method: string;
  transactionid: string;
  created_at: string;
  updated_at: string;
}

// Define the Visit type
export interface Visit {
  id: string;
  carid: string;
  userid: string;
  visited_at: string;
  created_at: string;
}

// Define the Chat type
export interface Chat {
  id: string;
  roomid: string;
  senderid: string;
  message: string;
  timestamp: string;
  created_at: string;
}

// Define the Notification type
export interface Notification {
  id: string;
  recipientid: string; // The user who receives the notification
  type: string; // 'chat', 'booking', 'system', 'car_update', etc.
  title: string;
  message: string;
  senderid?: string; // Who sent the notification (optional)
  related_entity_id?: string; // ID of related entity (car, booking, etc.)
  read: boolean;
  created_at: string;
  updated_at: string;
}

// Define the File type
export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploaded_by: string;
  created_at: string;
}

// Room Service Functions
export const roomServices = {
  async createRoom(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) {
        console.error('Error creating room:', error);
        throw new Error(error.message);
      }

      return data as Room;
    } catch (error) {
      console.error('Error in createRoom:', error);
      return null;
    }
  },

  async getRoomById(roomid: string): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomid)
        .single();

      if (error) {
        console.error('Error getting room by ID:', error);
        return null;
      }

      return data as Room;
    } catch (error) {
      console.error('Error in getRoomById:', error);
      return null;
    }
  },

  async getRoomByadminid(adminid: string): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('adminid', adminid)
        .single();

      if (error) {
        console.error('Error getting room by admin ID:', error);
        return null;
      }

      return data as Room;
    } catch (error) {
      console.error('Error in getRoomByadminid:', error);
      return null;
    }
  },

  async getActiveRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting active rooms:', error);
        return [];
      }

      return data as Room[];
    } catch (error) {
      console.error('Error in getActiveRooms:', error);
      return [];
    }
  },

  async getAllRooms(): Promise<Room[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all rooms:', error);
        return [];
      }

      return data as Room[];
    } catch (error) {
      console.error('Error in getAllRooms:', error);
      return [];
    }
  },

  async checkAdminHasRoom(adminid: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id')
        .eq('adminid', adminid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking if admin has room:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkAdminHasRoom:', error);
      return false;
    }
  },

  async updateRoom(roomid: string, roomData: Partial<Room>): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', roomid)
        .select()
        .single();

      if (error) {
        console.error('Error updating room:', error);
        return null;
      }

      return data as Room;
    } catch (error) {
      console.error('Error in updateRoom:', error);
      return null;
    }
  },

  async updateRoomStatus(roomid: string, isActive: boolean): Promise<Room | null> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ is_active: isActive })
        .eq('id', roomid)
        .select()
        .single();

      if (error) {
        console.error('Error updating room status:', error);
        return null;
      }

      return data as Room;
    } catch (error) {
      console.error('Error in updateRoomStatus:', error);
      return null;
    }
  },

  async deleteRoom(roomid: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomid);

      if (error) {
        console.error('Error deleting room:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRoom:', error);
      return false;
    }
  }
};

// Payment Service Functions
export const paymentServices = {
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        throw new Error(error.message);
      }

      return data as Payment;
    } catch (error) {
      console.error('Error in createPayment:', error);
      return null;
    }
  },

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('userid', userId)
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

  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
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
  }
};

// Visit Service Functions
export const visitServices = {
  async createVisit(visitData: Omit<Visit, 'id' | 'created_at'>): Promise<Visit | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('visits')
        .insert([visitData])
        .select()
        .single();

      if (error) {
        console.error('Error creating visit:', error);
        throw new Error(error.message);
      }

      return data as Visit;
    } catch (error) {
      console.error('Error in createVisit:', error);
      return null;
    }
  },

  async getVisitsByCar(carId: string): Promise<Visit[]> {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*, user:users(username, email)')
        .eq('carid', carId)
        .order('visited_at', { ascending: false });

      if (error) {
        console.error('Error getting visits by car:', error);
        return [];
      }

      return data as Visit[];
    } catch (error) {
      console.error('Error in getVisitsByCar:', error);
      return [];
    }
  },

  // Function to get global visit count from dedicated counters table
  async getGlobalVisitCount(): Promise<number> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('counters')
        .select('count_value')
        .eq('id', 'global_visits')
        .single();

      if (error) {
        console.error('Error getting global visit count:', error);
        return 0;
      }

      return data?.count_value || 0;
    } catch (error) {
      console.error('Error in getGlobalVisitCount:', error);
      return 0;
    }
  },

  async incrementGlobalVisitCount(): Promise<number> {
    try {
      // Fetch current value
      const { data: currentData, error: fetchError } = await getSupabaseServiceRole()
        .from('counters')
        .select('count_value')
        .eq('id', 'global_visits')
        .single();

      let newCount: number;

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        // If there's a real error (not "no rows"), return 0
        console.error('Error fetching current count:', fetchError);
        return 0;
      } else if (fetchError && fetchError.code === 'PGRST116') {
        // If no row exists, start with 1
        newCount = 1;
      } else {
        // If row exists, increment by 1
        newCount = (currentData?.count_value || 0) + 1;
      }

      // Use upsert to handle both insert and update scenarios
      const { error: upsertError } = await getSupabaseServiceRole()
        .from('counters')
        .upsert({
          id: 'global_visits',
          count_value: newCount,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upserting visit counter:', upsertError);
        return 0;
      }

      return newCount;
    } catch (error) {
      console.error('Error in incrementGlobalVisitCount:', error);
      return 0;
    }
  },

  // Function to get monthly visits data
  async getMonthlyVisitsData(): Promise<{ month: string; count: number }[]> {
    try {
      // This would typically fetch data from a visits table grouped by month
      // For demonstration purposes, we'll generate sample data based on current visit count
      // In a full implementation, you'd want to store actual visit records with dates

      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      // For now, generate sample data - in a real implementation this would query actual data
      // If you want to track visits by month specifically, you'd need to modify the visits table
      // to include date information and group by month

      const result = months.map((month, index) => ({
        month,
        count: Math.floor(Math.random() * 500) + 100 // Random data for now
      }));

      return result;
    } catch (error) {
      console.error('Error in getMonthlyVisitsData:', error);
      return [];
    }
  }
};

// Chat Service Functions
export const chatServices = {
  async createChat(chatData: Omit<Chat, 'id' | 'created_at'>): Promise<Chat | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('chats')
        .insert([chatData])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        throw new Error(error.message);
      }

      return data as Chat;
    } catch (error) {
      console.error('Error in createChat:', error);
      return null;
    }
  },

  async getChatsByRoom(roomid: string): Promise<Chat[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('chats')
        .select('*, sender:users(username)')
        .eq('roomid', roomid)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting chats by room:', error);
        return [];
      }

      return data as Chat[];
    } catch (error) {
      console.error('Error in getChatsByRoom:', error);
      return [];
    }
  },

  async getAllChats(): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*, sender:users(username)')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting all chats:', error);
        return [];
      }

      return data as Chat[];
    } catch (error) {
      console.error('Error in getAllChats:', error);
      return [];
    }
  }
};

// Notification Service Functions
export const notificationServices = {
  async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error(error.message);
      }

      return data as Notification;
    } catch (error) {
      console.error('Error in createNotification:', error);
      return null;
    }
  },

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipientid', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting notifications by user:', error);
        return [];
      }

      return data as Notification[];
    } catch (error) {
      console.error('Error in getNotificationsByUser:', error);
      return [];
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        return null;
      }

      return data as Notification;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return null;
    }
  },

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      // First, get the count of notifications that will be marked as read
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipientid', userId)
        .eq('read', false); // Only count unread notifications

      if (countError) {
        console.error('Error getting notification count:', countError);
        return 0;
      }

      // Then update all notifications for the user to be marked as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('recipientid', userId);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
      return 0;
    }
  },

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipientid', userId)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread notifications count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadNotificationsCount:', error);
      return 0;
    }
  }
};

// File Service Functions
export const fileServices = {
  async createFile(fileData: Omit<File, 'id' | 'created_at'>): Promise<File | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('files')
        .insert([fileData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating file:', error);
        throw new Error(error.message);
      }
      
      return data as File;
    } catch (error) {
      console.error('Error in createFile:', error);
      return null;
    }
  },

  async getFileById(fileId: string): Promise<File | null> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();
      
      if (error) {
        console.error('Error getting file by ID:', error);
        return null;
      }
      
      return data as File;
    } catch (error) {
      console.error('Error in getFileById:', error);
      return null;
    }
  }
};