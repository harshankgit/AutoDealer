import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';
import { hashPassword } from '@/lib/auth';

// Define the User type
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  favorites?: string[]; // Array of car IDs
  created_at: string;
  updated_at: string;
}

// User Service Functions
export const userServices = {
  // Create a new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      console.log('Creating user with email:', userData.email);

      // Hash the password before storing
      const hashedPassword = await hashPassword(userData.password!);

      const { data, error } = await getSupabaseServiceRole()
        .from('users')
        .insert([
          {
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'user',
            favorites: userData.favorites || []
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user in database:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code || 'unknown'})`);
      }

      console.log('User created successfully:', data?.id);
      return data as User;
    } catch (error: any) {
      console.error('Error in createUser service:', {
        message: error?.message,
        stack: error?.stack,
        email: userData.email // Only log non-sensitive data
      });
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error getting user by email:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error getting user by ID:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  },

  // Update user favorites
  async updateUserFavorites(userId: string, favorites: string[]): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ favorites })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user favorites:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in updateUserFavorites:', error);
      return null;
    }
  },

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all users:', error);
        return [];
      }

      return data as User[];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return null;
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  },

  // Get count of all users
  async getAllUsersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting users count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getAllUsersCount:', error);
      return 0;
    }
  }
};