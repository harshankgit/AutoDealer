import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';

// Define the Car type
export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  ownership_history: string;
  images?: string[]; // Optional in Supabase
  description: string;
  specifications?: any; // Can be an object with engine, power, etc.
  condition: string;
  availability: string;
  roomid: string;
  adminid: string;
  created_at: string;
  updated_at: string;
}

// Car Service Functions
export const carServices = {
  // Create a new car
  async createCar(carData: Omit<Car, 'id' | 'created_at' | 'updated_at'>): Promise<Car | null> {
    try {
      console.log('Creating car with data:', { ...carData, password: carData.description ? '[HIDDEN]' : undefined }); // Log data without sensitive info

      const { data, error } = await getSupabaseServiceRole()
        .from('cars')
        .insert([
          {
            title: carData.title,
            brand: carData.brand,
            model: carData.model,
            year: carData.year,
            price: carData.price,
            mileage: carData.mileage,
            fuel_type: carData.fuel_type,
            transmission: carData.transmission,
            ownership_history: carData.ownership_history,
            images: carData.images || [],
            description: carData.description,
            specifications: carData.specifications || {},
            condition: carData.condition,
            availability: carData.availability,
            roomid: carData.roomid,
            adminid: carData.adminid
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating car in database:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code || 'unknown'})`);
      }

      console.log('Car created successfully:', data?.id);
      return data as Car;
    } catch (error: any) {
      console.error('Error in createCar service:', {
        message: error?.message,
        stack: error?.stack,
        carData: { ...carData, password: carData.description ? '[HIDDEN]' : undefined }
      });
      return null;
    }
  },

  // Get all cars with optional filters
  async getAllCars(filters?: {
    availability?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Car[]> {
    try {
      console.log('Fetching cars with filters:', filters);

      let query = supabase.from('cars').select('*').order('created_at', { ascending: false });

      if (filters) {
        if (filters.availability) {
          query = query.eq('availability', filters.availability);
        }
        if (filters.brand) {
          query = query.ilike('brand', `%${filters.brand}%`);
        }
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting all cars from database:', error);
        return [];
      }

      console.log(`Fetched ${data?.length || 0} cars from database`);
      return data as Car[];
    } catch (error: any) {
      console.error('Error in getAllCars service:', {
        message: error?.message,
        stack: error?.stack,
        filters
      });
      return [];
    }
  },

  // Get car by ID
  async getCarById(carId: string): Promise<Car | null> {
    try {
      console.log('Fetching car by ID:', carId);

      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (error) {
        console.error('Error getting car by ID from database:', error);
        return null;
      }

      console.log('Car fetched successfully:', data?.id);
      return data as Car;
    } catch (error: any) {
      console.error('Error in getCarById service:', {
        message: error?.message,
        stack: error?.stack,
        carId
      });
      return null;
    }
  },

  // Update a car
  async updateCar(carId: string, carData: Partial<Car>): Promise<Car | null> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .update(carData)
        .eq('id', carId)
        .select()
        .single();

      if (error) {
        console.error('Error updating car:', error);
        return null;
      }

      return data as Car;
    } catch (error) {
      console.error('Error in updateCar:', error);
      return null;
    }
  },

  // Delete a car
  async deleteCar(carId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) {
        console.error('Error deleting car:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteCar:', error);
      return false;
    }
  },

  // Get cars by admin ID
  async getCarsByAdmin(adminid: string): Promise<Car[]> {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('adminid', adminid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting cars by admin:', error);
        return [];
      }

      return data as Car[];
    } catch (error) {
      console.error('Error in getCarsByAdmin:', error);
      return [];
    }
  },

  // Get count of all cars
  async getAllCarsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting cars count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getAllCarsCount:', error);
      return 0;
    }
  }
};