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

// Define the new Chat types
export interface ChatConversation {
  id: string;
  roomid: string;
  userid: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_active: boolean;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  senderid: string;
  message: string;
  message_type: string; // 'text', 'car_details', 'image', 'file'
  car_details?: any;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  is_read: boolean;
  timestamp: string;
  created_at: string;
}

export interface ChatTypingIndicator {
  id: string;
  conversation_id: string;
  userid: string;
  is_typing: boolean;
  timestamp: string;
  expires_at: string;
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
      const { data, error } = await getSupabaseServiceRole()
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

  // Function to get total visits count for multiple cars efficiently
  async getTotalVisitsByCarIds(carIds: string[]): Promise<number> {
    try {
      if (!carIds || carIds.length === 0) {
        return 0;
      }

      const { count, error } = await getSupabaseServiceRole()
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .in('carid', carIds);

      if (error) {
        console.error('Error getting total visits by car IDs:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTotalVisitsByCarIds:', error);
      return 0;
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
        if (error.code === '42P01') { // 42P01 means table does not exist
          console.error('Counters table does not exist in database:', error);
          console.error('Please run the schema.sql file in your Supabase SQL editor to create the necessary tables');
          return 0;
        } else if (error.code === 'PGRST116') { // PGRST116 means no rows returned
          // If no counter exists, return 0
          return 0;
        } else {
          console.error('Error getting global visit count:', error);
          return 0;
        }
      }

      return data?.count_value || 0;
    } catch (error) {
      console.error('Error in getGlobalVisitCount:', error);
      return 0;
    }
  },

  async incrementGlobalVisitCount(): Promise<number> {
    try {
      console.log('Starting incrementGlobalVisitCount function');

      // First, let's make sure the service role client is properly initialized
      const serviceRoleClient = getSupabaseServiceRole();
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
        return 0;
      }

      // Try to fetch the current value
      const { data: currentData, error: fetchError } = await serviceRoleClient
        .from('counters')
        .select('count_value')
        .eq('id', 'global_visits')
        .single();

      console.log('Fetch result - data:', currentData, 'error:', fetchError);

      if (fetchError) {
        if (fetchError.code === '42P01') { // 42P01 means table does not exist
          console.error('Counters table does not exist in database:', fetchError);
          console.error('Please run the schema.sql file in your Supabase SQL editor to create the necessary tables');
          console.error('IMPORTANT: The visit count will remain at 0 until the database schema is applied');
          return 0; // This is the likely issue
        } else if (fetchError.code === 'PGRST116') { // PGRST116 means no rows returned
          // If no row exists, insert a new counter record with count_value = 1
          console.log('No existing counter found, creating new counter with value 1');

          const { data: insertData, error: insertError } = await serviceRoleClient
            .from('counters')
            .insert([{
              id: 'global_visits',
              count_value: 1,
              updated_at: new Date().toISOString()
            }])
            .select('count_value')
            .single();

          if (insertError) {
            console.error('Error inserting new visit counter:', insertError);
            return 0;
          }
          console.log('Successfully inserted first visit counter with value 1');
          return insertData?.count_value || 1;
        } else {
          // If there's a different error (wrong permissions, etc.), return 0
          console.error('Error fetching current count:', fetchError);
          console.error('Error details:', fetchError.message, fetchError.details, fetchError.hint);
          return 0;
        }
      } else {
        // If row exists, use raw SQL to increment atomically to avoid trigger issues
        const currentCount = currentData?.count_value || 0;
        const newCount = currentCount + 1;
        console.log('Incrementing from existing count:', currentCount, 'to', newCount);

        // Try to update with a raw SQL query to avoid trigger issues
        const { data, error } = await serviceRoleClient
          .from('counters')
          .update({
            count_value: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', 'global_visits')
          .select('count_value, updated_at')
          .single();

        if (error) {
          console.error('Error incrementing visit counter:', error);
          // For a permanent fix, run this in your Supabase SQL editor:
          console.error('PERMANENT FIX: Run this in your Supabase SQL editor to fix the trigger:');
          console.error(`CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_counters_updated_at ON counters;
CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`);
          return 0;
        }

        console.log('Successfully incremented visit count to:', data?.count_value);
        return data?.count_value || 0;
      }
    } catch (error) {
      console.error('Error in incrementGlobalVisitCount:', error);
      return 0;
    }
  },

  // Function to get monthly visits data
  async getMonthlyVisitsData(): Promise<{ month: string; count: number }[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('monthly_visits')
        .select('*')
        .order('year_month', { ascending: false })
        .limit(12); // Get last 12 months

      if (error) {
        console.error('Error fetching monthly visits data:', error);
        return [];
      }

      // Format the data to match expected structure
      const formattedData = data.map((item: any) => ({
        month: item.month_name,
        count: item.visit_count || 0
      })).reverse(); // Reverse to show oldest first

      return formattedData;
    } catch (error) {
      console.error('Error in getMonthlyVisitsData:', error);
      return [];
    }
  }
};

// New Chat Service Functions
export const chatServices = {
  // Conversation functions
  async createConversation(conversationData: Omit<ChatConversation, 'id' | 'created_at' | 'updated_at' | 'last_message_at' | 'unread_count'>): Promise<ChatConversation | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('chat_conversations')
        .insert([conversationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new Error(error.message);
      }

      return data as ChatConversation;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  },

  async getConversationById(conversationId: string): Promise<ChatConversation | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error('Error getting conversation by ID:', error);
        return null;
      }

      return data as ChatConversation;
    } catch (error) {
      console.error('Error in getConversationById:', error);
      return null;
    }
  },

  async getConversationsByUser(userId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*, room:rooms(name)')
        .eq('userid', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error getting conversations by user:', error);
        return [];
      }

      return data as ChatConversation[];
    } catch (error) {
      console.error('Error in getConversationsByUser:', error);
      return [];
    }
  },

  async getConversationsByRoom(roomId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*, user:users(username, email)')
        .eq('roomid', roomId)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error getting conversations by room:', error);
        return [];
      }

      return data as ChatConversation[];
    } catch (error) {
      console.error('Error in getConversationsByRoom:', error);
      return [];
    }
  },

  async getAllConversations(): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*, room:rooms(name), user:users(username, email)')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error getting all conversations:', error);
        return [];
      }

      return data as ChatConversation[];
    } catch (error) {
      console.error('Error in getAllConversations:', error);
      return [];
    }
  },

  // Message functions
  async createMessage(messageData: Omit<ChatMessage, 'id' | 'created_at' | 'is_read'>): Promise<ChatMessage | null> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('Error creating message:', error);
        throw new Error(error.message);
      }

      return data as ChatMessage;
    } catch (error) {
      console.error('Error in createMessage:', error);
      return null;
    }
  },

  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, sender:users(username, role)')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting messages by conversation:', error);
        return [];
      }

      return data as ChatMessage[];
    } catch (error) {
      console.error('Error in getMessagesByConversation:', error);
      return [];
    }
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Update messages that were sent by others and are currently unread
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('senderid', userId)  // Only mark messages from others as read
        .eq('is_read', false);    // Only mark unread messages

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      return false;
    }
  },

  // Typing indicator functions
  async setTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<ChatTypingIndicator | null> {
    try {
      if (isTyping) {
        // Create or update typing indicator
        const { data, error } = await getSupabaseServiceRole()
          .from('chat_typing_indicators')
          .upsert([{
            conversation_id: conversationId,
            userid: userId,
            is_typing: true,
            expires_at: new Date(Date.now() + 30000).toISOString() // 30 seconds from now
          }], { onConflict: 'conversation_id,userid' })
          .select()
          .single();

        if (error) {
          console.error('Error setting typing indicator:', error);
          throw new Error(error.message);
        }

        return data as ChatTypingIndicator;
      } else {
        // Remove typing indicator
        const { error } = await supabase
          .from('chat_typing_indicators')
          .delete()
          .eq('conversation_id', conversationId)
          .eq('userid', userId);

        if (error) {
          console.error('Error removing typing indicator:', error);
          return null;
        }

        return null;
      }
    } catch (error) {
      console.error('Error in setTypingIndicator:', error);
      return null;
    }
  },

  async getTypingIndicators(conversationId: string): Promise<ChatTypingIndicator[]> {
    try {
      const { data, error } = await supabase
        .from('chat_typing_indicators')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_typing', true);

      if (error) {
        console.error('Error getting typing indicators:', error);
        return [];
      }

      return data as ChatTypingIndicator[];
    } catch (error) {
      console.error('Error in getTypingIndicators:', error);
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