import { NextResponse } from 'next/server';
import { carServices } from '@/lib/supabase/services/carService';

export async function GET(request: Request) {
  try {
    // Get all cars
    const allCars = await carServices.getAllCars();
    
    // Count cars by brand
    const brandCount: Record<string, number> = {};
    
    allCars.forEach(car => {
      if (brandCount[car.brand]) {
        brandCount[car.brand]++;
      } else {
        brandCount[car.brand] = 1;
      }
    });
    
    // Convert to array format
    const carDistributionData = Object.entries(brandCount).map(([brand, count]) => ({
      brand,
      count
    }));
    
    // Sort by count in descending order and take top 8 brands
    const sortedData = carDistributionData.sort((a, b) => b.count - a.count).slice(0, 8);
    
    return NextResponse.json(sortedData);
  } catch (error) {
    console.error('Error in car distribution API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}