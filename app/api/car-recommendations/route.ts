// app/api/car-recommendations/route.ts
import { NextRequest } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

interface CarRecommendationRequest {
  budget: number;
  carType?: string;
  fuelType?: string;
  transmission?: string;
  seats?: string;
  location?: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  location: string;
  rating: number;
  features: string[];
  image_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { budget, carType, fuelType, transmission, seats, location }: CarRecommendationRequest = await request.json();

    // Validate required fields
    if (!budget) {
      return Response.json({ error: 'Budget is required' }, { status: 400 });
    }

    // Get Supabase client
    const supabase = getSupabaseServiceRole();

    // Build query based on user preferences with optimized filtering
    let query = supabase
      .from('cars')
      .select(`
        id,
        name,
        brand,
        model,
        year,
        price,
        mileage,
        fuel_type,
        transmission,
        seats,
        location,
        rating,
        features,
        image_url
      `)
      .lte('price', budget)
      .order('rating', { ascending: false })
      .limit(50); // Limit to 50 results for performance

    // Apply filters based on user preferences
    if (carType) {
      query = query.ilike('name', `%${carType}%`);
    }

    if (fuelType) {
      query = query.eq('fuel_type', fuelType);
    }

    if (transmission) {
      query = query.eq('transmission', transmission);
    }

    if (seats) {
      const seatNumber = parseInt(seats);
      if (seatNumber === 4) {
        query = query.eq('seats', 4);
      } else if (seatNumber === 5) {
        query = query.eq('seats', 5);
      } else if (seatNumber >= 6 && seatNumber <= 7) {
        query = query.gte('seats', 6).lte('seats', 7);
      } else if (seatNumber >= 8) {
        query = query.gte('seats', 8);
      }
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching car recommendations:', error);
      return Response.json({ error: 'Failed to fetch car recommendations' }, { status: 500 });
    }

    // Calculate match percentage for each car based on user preferences
    // Using optimized matching algorithm
    const recommendations = data.map(car => {
      let matchScore = 0;
      let maxScore = 1; // Budget match is always counted

      // Car type match
      if (carType && car.name.toLowerCase().includes(carType.toLowerCase())) {
        matchScore += 1;
        maxScore += 1;
      }

      // Fuel type match
      if (fuelType && car.fuel_type.toLowerCase() === fuelType.toLowerCase()) {
        matchScore += 1;
        maxScore += 1;
      }

      // Transmission match
      if (transmission && car.transmission.toLowerCase() === transmission.toLowerCase()) {
        matchScore += 1;
        maxScore += 1;
      }

      // Seats match
      if (seats) {
        const seatPref = parseInt(seats);
        if (
          (seatPref === 4 && car.seats === 4) ||
          (seatPref === 5 && car.seats === 5) ||
          (seatPref >= 6 && seatPref <= 7 && car.seats >= 6 && car.seats <= 7) ||
          (seatPref >= 8 && car.seats >= 8)
        ) {
          matchScore += 1;
          maxScore += 1;
        }
      }

      // Calculate percentage (max 100%)
      const matchPercentage = maxScore > 0 ? Math.min(100, Math.round((matchScore / maxScore) * 100)) : 0;

      return {
        ...car,
        matchPercentage,
        features: car.features || []
      };
    });

    // Sort by match percentage and rating
    recommendations.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return b.rating - a.rating;
    });

    // Return top 10 recommendations
    return Response.json({ recommendations: recommendations.slice(0, 10) });
  } catch (error) {
    console.error('Error in car recommendation API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}