import { supabase } from '../client';
import { getSupabaseServiceRole } from '../server';

// Define the User type for admin details
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;  // Added phone field
  role: string;
  created_at: string;
}

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
  admin_details?: User;  // Added admin details
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
            availability: carData.availability || 'Available', // Set default if not provided
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
    roomid?: string;
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
        if (filters.roomid) {
          query = query.eq('roomid', filters.roomid);
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

      // First, get the car data
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (carError) {
        console.error('Error getting car by ID from database:', carError);
        return null;
      }

      if (!carData) {
        console.log('Car not found with ID:', carId);
        return null;
      }

      // Then, get the admin details using the adminid from the car
      let adminDetails = null;
      if (carData.adminid) {
        const { data: userData, error: userError } = await getSupabaseServiceRole()
          .from('users')
          .select('id, username, email, phone, role, created_at')
          .eq('id', carData.adminid)
          .single();

        if (userError) {
          console.warn('Error getting admin details for car:', userError);
        } else {
          adminDetails = userData;
        }
      }

      // Combine car data with admin details
      const carWithAdmin: Car = {
        ...carData,
        admin_details: adminDetails || undefined,
      };

      console.log('Car with admin details fetched successfully:', carWithAdmin.id);
      return carWithAdmin;
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
      // Prepare update data by removing undefined values and excluding id
      const updateData: Partial<Car> = {};
      Object.keys(carData).forEach(key => {
        const typedKey = key as keyof Partial<Car>;
        if (carData[typedKey] !== undefined && key !== 'id') {
          (updateData as any)[typedKey] = carData[typedKey];
        }
      });

      // First, check if the car exists
      const { data: existingCar, error: checkError } = await supabase
        .from('cars')
        .select('id')
        .eq('id', carId)
        .single();

      if (checkError) {
        console.error('Error checking if car exists before update:', checkError);
        return null;
      }

      if (!existingCar) {
        console.error('Car does not exist before update attempt:', carId);
        return null;
      }

      console.log('Attempting to update car with ID:', carId, 'and data:', updateData);

      // First, perform the update operation using service role for higher permissions
      const { error: updateError, status } = await getSupabaseServiceRole()
        .from('cars')
        .update(updateData)
        .eq('id', carId);

      if (updateError) {
        console.error('Error during update operation:', updateError);
        console.error('Car ID:', carId);
        console.error('Update data:', updateData);
        return null;
      }

      // Then fetch the updated record to return using service role
      const { data: updatedCar, error: fetchError } = await getSupabaseServiceRole()
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated car:', fetchError);
        return null;
      }

      console.log('Successfully updated car:', updatedCar);
      return updatedCar as Car;
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