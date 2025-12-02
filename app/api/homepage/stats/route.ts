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

    // Get monthly visits data for charts (last 12 months) - use original method first
    let monthlyVisits = await visitServices.getMonthlyVisitsData();

    // If the original method returns empty, try the new aggregated API as fallback
    if (!monthlyVisits || monthlyVisits.length === 0) {
      console.log('Original monthly visits data is empty, trying aggregated method');
      try {
        const monthlyVisitsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage/monthly-visits-aggregated`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (monthlyVisitsRes.ok) {
          monthlyVisits = await monthlyVisitsRes.json();
        } else {
          console.log('Aggregated visits API failed, using empty array');
        }
      } catch (error) {
        console.error('Error fetching monthly visits aggregated data:', error);
      }
    }

    // Get user growth data (last 12 months)
    let userGrowthData = [];
    try {
      const userGrowthRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage/user-growth`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Disable caching to ensure fresh data
        cache: 'no-store',
      });

      if (userGrowthRes.ok) {
        userGrowthData = await userGrowthRes.json();
      }
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      // Fallback to empty array if API call fails
      userGrowthData = [];
    }

    // Get car distribution data by brand
    let carDistributionData = [];
    try {
      const carDistributionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage/car-distribution`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Disable caching to ensure fresh data
        cache: 'no-store',
      });

      if (carDistributionRes.ok) {
        carDistributionData = await carDistributionRes.json();
      }
    } catch (error) {
      console.error('Error fetching car distribution data:', error);
      // Fallback to empty array if API call fails
      carDistributionData = [];
    }

    // Get performance metrics data
    let performanceMetrics = null;
    try {
      const performanceMetricsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage/performance-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Disable caching to ensure fresh data
        cache: 'no-store',
      });

      if (performanceMetricsRes.ok) {
        performanceMetrics = await performanceMetricsRes.json();
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      // Don't fail the request if performance metrics fail
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalShowrooms: totalShowrooms || 0,
      totalCars: totalCars || 0,
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || [],
      userGrowthData,
      carDistributionData,
      performanceMetrics
    });
  } catch (error) {
    console.error('Error in homepage stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}