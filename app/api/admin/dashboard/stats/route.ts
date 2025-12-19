export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { carServices } from '@/lib/supabase/services/carService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { userServices } from '@/lib/supabase/services/userService';
import { roomServices, visitServices } from '@/lib/supabase/services/generalServices';

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
      const confirmedBookingsCount = bookings.filter(booking => booking.status === 'Confirmed' || booking.status === 'Sold').length;
      const pendingBookingsCount = bookings.filter(booking => booking.status === 'Pending' || booking.status === 'Booked').length;

      // Calculate revenue from confirmed bookings
      const confirmedBookings = bookings.filter(booking => booking.status === 'Confirmed' || booking.status === 'Sold');
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

      // Get total views for all of the admin's cars efficiently
      const carIds = cars.map(car => car.id);
      const totalViews = await visitServices.getTotalVisitsByCarIds(carIds);

      const stats = {
        totalCars,
        availableCars,
        soldCars,
        totalViews,
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
      const confirmedBookingsCount = bookings.filter(booking => booking.status === 'Confirmed' || booking.status === 'Sold').length;
      const pendingBookingsCount = bookings.filter(booking => booking.status === 'Pending' || booking.status === 'Booked').length;

      // Calculate revenue from confirmed bookings
      const confirmedBookings = bookings.filter(booking => booking.status === 'Confirmed' || booking.status === 'Sold');
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);

      // Get total views for all cars on the platform efficiently
      const carIds = cars.map(car => car.id);
      const totalViews = await visitServices.getTotalVisitsByCarIds(carIds);

      const stats = {
        totalCars,
        availableCars,
        soldCars,
        totalViews,
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