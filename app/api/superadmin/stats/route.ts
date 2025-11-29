import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { paymentServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    // Use Promise.all to fetch all statistics concurrently for better performance
    const [
      { totalUsers, totalAdmins, totalSuperAdmins },
      allRooms,
      allCars,
      allBookings,
      allPayments
    ] = await Promise.all([
      // User stats
      (async () => {
        const users = await userServices.getAllUsers();
        return {
          totalUsers: users.length,
          totalAdmins: users.filter(u => u.role === 'admin').length,
          totalSuperAdmins: users.filter(u => u.role === 'superadmin').length
        };
      })(),

      // Room stats - get all to count
      roomServices.getAllRooms(),

      // Car stats - get all to count
      carServices.getAllCars(),

      // Booking stats - get all to count
      bookingServices.getAllBookings(),

      // Payment stats - get all to count
      paymentServices.getAllPayments()
    ]);

    // Get recent data for the dashboard
    const [recentUsers, recentRooms, recentCars] = await Promise.all([
      // Get all users and slice for recent ones
      userServices.getAllUsers(),
      roomServices.getAllRooms(),
      carServices.getAllCars()
    ]);

    // Get the 5 most recent items
    const recentUsersLimited = recentUsers.slice(0, 5);
    const recentRoomsLimited = recentRooms.slice(0, 5);
    const recentCarsLimited = recentCars.slice(0, 5);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAdmins,
        totalSuperAdmins,
        totalShowrooms: allRooms.length,
        totalCars: allCars.length,
        totalBookings: allBookings.length,
        totalPayments: allPayments.length,
      },
      recent: {
        users: recentUsersLimited,
        rooms: recentRoomsLimited,
        cars: recentCarsLimited
      }
    });
  } catch (error) {
    console.error('Get superadmin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}