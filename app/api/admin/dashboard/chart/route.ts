export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // For admin, get chart data for their specific room
    if (decoded.role === 'admin') {
      const room = await roomServices.getRoomByadminid(decoded.userId);
      if (!room) {
        return NextResponse.json({ error: 'No room found for this admin' }, { status: 404 });
      }

      // Get bookings for all of the admin's cars
      const cars = await carServices.getCarsByAdmin(decoded.userId);
      let allBookings: any[] = [];
      for (const car of cars) {
        const carBookings = await bookingServices.getBookingsByCar(car.id);
        allBookings = [...allBookings, ...carBookings];
      }

      // Filter bookings for the specified year and group by month
      const yearlyBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getFullYear() === parseInt(year);
      });

      // Initialize monthly data
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: new Date(0, i).toLocaleString('default', { month: 'short' }),
        bookings: 0,
        revenue: 0,
        confirmedBookings: 0,
      }));

      // Populate the monthly data
      yearlyBookings.forEach(booking => {
        const month = new Date(booking.created_at).getMonth();
        monthlyData[month].bookings += 1;

        if (booking.status === 'Confirmed' || booking.status === 'Sold') {
          monthlyData[month].confirmedBookings += 1;
          monthlyData[month].revenue += booking.total_price;
        }
      });

      // Get car availability data
      const availabilityData = {
        available: cars.filter(car => car.availability === 'Available').length,
        sold: cars.filter(car => car.availability === 'Sold').length,
        reserved: cars.filter(car => car.availability === 'Reserved').length,
      };

      const chartData = {
        monthlyData,
        availabilityData,
        yearlySummary: {
          totalBookings: yearlyBookings.length,
          totalRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0),
          year: parseInt(year),
        }
      };

      return NextResponse.json({ chartData });

    } else if (decoded.role === 'superadmin') {
      // For superadmin, get overall platform chart data
      const allBookings = await bookingServices.getAllBookings();
      
      // Filter bookings for the specified year and group by month
      const yearlyBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getFullYear() === parseInt(year);
      });

      // Initialize monthly data
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthName: new Date(0, i).toLocaleString('default', { month: 'short' }),
        bookings: 0,
        revenue: 0,
        confirmedBookings: 0,
      }));

      // Populate the monthly data
      yearlyBookings.forEach(booking => {
        const month = new Date(booking.created_at).getMonth();
        monthlyData[month].bookings += 1;
        
        if (booking.status === 'Confirmed' || booking.status === 'Sold') {
          monthlyData[month].confirmedBookings += 1;
          monthlyData[month].revenue += booking.total_price;
        }
      });

      // Get all cars for availability data
      const allCars = await carServices.getAllCars();
      const availabilityData = {
        available: allCars.filter(car => car.availability === 'Available').length,
        sold: allCars.filter(car => car.availability === 'Sold').length,
        reserved: allCars.filter(car => car.availability === 'Reserved').length,
      };

      const chartData = {
        monthlyData,
        availabilityData,
        yearlySummary: {
          totalBookings: yearlyBookings.length,
          totalRevenue: monthlyData.reduce((sum, month) => sum + month.revenue, 0),
          year: parseInt(year),
        }
      };

      return NextResponse.json({ chartData });
    } else {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  } catch (error) {
    console.error('Dashboard chart data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}