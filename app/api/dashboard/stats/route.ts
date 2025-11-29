import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { userServices } from '@/lib/supabase/services/userService';
import { visitServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    const decoded: any = verifyToken(token);

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 401 });
    }

    // Fetch dashboard statistics
    const totalUsers = await userServices.getAllUsersCount();
    const totalShowrooms = await roomServices.getActiveRooms().then(rooms => rooms.length);
    const totalCars = await carServices.getAllCarsCount();
    const totalVisits = await visitServices.getGlobalVisitCount();
    
    // Fetch monthly visit data for the last 12 months
    const monthlyVisits = await visitServices.getMonthlyVisitsData();

    // Generate sample data for additional charts
    const userGrowthData = await getUserGrowthData();
    const carDistributionData = await getCarDistributionData();

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalShowrooms: totalShowrooms || 0,
      totalCars: totalCars || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits,
      userGrowthData,
      carDistributionData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserGrowthData(): Promise<{ month: string; count: number }[]> {
  try {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const userData: { month: string; count: number }[] = months.map((month, index) => ({
      month,
      count: Math.floor(Math.random() * 100) + 20 // Random sample data
    }));

    return userData;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return [];
  }
}

async function getCarDistributionData(): Promise<{ brand: string; count: number }[]> {
  try {
    // Sample car brands and their distribution
    const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi'];

    const carData: { brand: string; count: number }[] = brands.map((brand, index) => ({
      brand,
      count: Math.floor(Math.random() * 200) + 50 // Random sample data
    }));

    return carData;
  } catch (error) {
    console.error('Error fetching car distribution data:', error);
    return [];
  }
}