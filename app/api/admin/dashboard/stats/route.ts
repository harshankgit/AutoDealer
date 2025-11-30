import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { carServices } from '@/lib/supabase/services/carService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { userServices } from '@/lib/supabase/services/userService';
import { roomServices } from '@/lib/supabase/services/generalServices';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For admin, get stats for their specific room
    if (decoded.role === 'admin') {
      // Get the admin's room
      const room = await roomServices.getRoomByadminid(decoded.userId);
      if (!room) {
        return NextResponse.json({ error: 'No room found for this admin' }, { status: 404 });
      }

      // Fetch stats for this admin's room
      const cars = await carServices.getCarsByAdmin(decoded.userId);

      // Get bookings for all of the admin's cars
      let allBookingsForAdmin: any[] = [];
      for (const car of cars) {
        const carBookings = await bookingServices.getBookingsByCar(car.id);
        allBookingsForAdmin = [...allBookingsForAdmin, ...carBookings];
      }
      const bookings = allBookingsForAdmin;

      const totalCars = cars.length;
      const availableCars = cars.filter(car => car.availability === 'Available').length;
      const soldCars = cars.filter(car => car.availability === 'Sold').length;

      // Count booking stats
      const confirmedBookingsCount = bookings.filter(booking => booking.status === 'Confirmed').length;
      const pendingBookingsCount = bookings.filter(booking => booking.status === 'Pending').length;

      // Calculate revenue from confirmed bookings
      const confirmedBookings = bookings.filter(booking => booking.status === 'Confirmed');
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

      const stats = {
        totalCars,
        availableCars,
        soldCars,
        totalViews: 0, // Views might be tracked differently or not at all in your system
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookingsCount,
        pendingBookings: pendingBookingsCount,
        totalRevenue,
      };

      return NextResponse.json({ stats });

    } else if (decoded.role === 'superadmin') {
      // For superadmin, get overall platform stats
      const [allCars, allBookings, allUsers] = await Promise.all([
        carServices.getAllCars(),
        bookingServices.getAllBookings(),
        userServices.getAllUsers()
      ]);

      const cars = allCars;
      const bookings = allBookings;
      const users = allUsers;

      const totalCars = cars.length;
      const availableCars = cars.filter(car => car.availability === 'Available').length;
      const soldCars = cars.filter(car => car.availability === 'Sold').length;

      const totalBookings = bookings.length;
      const confirmedBookingsCount = bookings.filter(booking => booking.status === 'Confirmed').length;
      const pendingBookingsCount = bookings.filter(booking => booking.status === 'Pending').length;

      // Calculate revenue from confirmed bookings
      const confirmedBookings = bookings.filter(booking => booking.status === 'Confirmed');
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

      const stats = {
        totalCars,
        availableCars,
        soldCars,
        totalViews: cars.length * 15, // Mock data for now
        totalBookings,
        confirmedBookings: confirmedBookingsCount,
        pendingBookings: pendingBookingsCount,
        totalUsers: users.length,
        totalRevenue,
      };

      return NextResponse.json({ stats });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}