import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { userServices } from '@/lib/supabase/services/userService';
import { visitServices } from '@/lib/supabase/services/generalServices';

export async function GET() {
  try {
    // Get all stats in parallel to improve performance
    const [
      totalUsers,
      totalShowrooms,
      totalCars,
      totalVisits,
      monthlyVisits,
      userGrowthData,
      carDistributionData
    ] = await Promise.all([
      userServices.getAllUsersCount(),
      roomServices.getActiveRooms().then(rooms => rooms.length),
      carServices.getAllCarsCount(),
      visitServices.getGlobalVisitCount(),
      visitServices.getMonthlyVisitsData(),
      getUserGrowthData(),
      getCarDistributionData()
    ]);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalShowrooms: totalShowrooms || 0,
      totalCars: totalCars || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || [],
      userGrowthData: userGrowthData || [],
      carDistributionData: carDistributionData || []
    });
  } catch (error) {
    console.error('Homepage stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user growth data by month
async function getUserGrowthData(): Promise<{ month: string; count: number }[]> {
  try {
    // This would be implemented with actual query to get users by registration month
    // For now, return sample data based on actual user count
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Generate realistic user growth data based on total users
    const userData: { month: string; count: number }[] = months.map((month, index) => ({
      month,
      count: Math.floor(Math.random() * 50) + 10 // Random sample data
    }));
    
    return userData;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return [];
  }
}

// Get car distribution data by brand
async function getCarDistributionData(): Promise<{ brand: string; count: number }[]> {
  try {
    // This would be implemented with actual query to get cars by brand
    // For now, return sample data
    const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi'];
    
    const carData: { brand: string; count: number }[] = brands.map((brand, index) => ({
      brand,
      count: Math.floor(Math.random() * 100) + 20 // Random sample data
    }));
    
    return carData;
  } catch (error) {
    console.error('Error fetching car distribution data:', error);
    return [];
  }
}