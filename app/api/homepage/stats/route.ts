import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import {
  roomServices,
  visitServices
} from '@/lib/supabase/services/generalServices';
import {
  carServices
} from '@/lib/supabase/services/carService';
import {
  userServices
} from '@/lib/supabase/services/userService';

export async function GET(request: Request) {
  try {
    // Extract token from headers
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = verifyToken(token);
      if (decoded) userId = decoded.userId;
    }

    // Get total counts
    const [totalUsers, allShowrooms, totalCars, totalVisits] = await Promise.all([
      userServices.getAllUsersCount(),
      roomServices.getAllRooms(),
      carServices.getAllCarsCount(),
      visitServices.getGlobalVisitCount()
    ]);

    const totalShowrooms = allShowrooms.length;

    // Get monthly visits data for charts (last 12 months)
    const monthlyVisits = await visitServices.getMonthlyVisitsData();

    // Get user growth data (last 12 months)
    const allUsers = await userServices.getAllUsers();
    const userGrowthData: any[] = []; // Placeholder - implement actual user growth data calculation if needed

    // Get car distribution data by brand/type
    const allCars = await carServices.getAllCars();
    const carDistributionData: any[] = []; // Placeholder - implement actual car distribution data calculation if needed

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
    console.error('Error in homepage stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}