// app/api/car-estimation/route.ts
import { NextRequest } from 'next/server';
import { calculateSimpleCarEstimation } from '@/lib/car-prediction-service';

interface CarEstimationRequest {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
}

interface CarEstimationResult {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  factors: {
    label: string;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { brand, model, year, mileage, fuelType, transmission, condition, location }: CarEstimationRequest = await request.json();

    // Validate required fields
    if (!brand || !model || !year || !mileage || !fuelType || !transmission || !condition || !location) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Additional validation
    const currentYear = new Date().getFullYear();
    if (typeof year !== 'number' || year < 1990 || year > currentYear + 1) {
      return Response.json({ error: `Year must be between 1990 and ${currentYear + 1}` }, { status: 400 });
    }

    if (typeof mileage !== 'number' || mileage < 0 || mileage > 10000000) {
      return Response.json({ error: 'Mileage must be between 0 and 10,000,000 km' }, { status: 400 });
    }

    const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
    if (!validFuelTypes.includes(fuelType.toLowerCase())) {
      return Response.json({ error: `Fuel type must be one of: ${validFuelTypes.join(', ')}` }, { status: 400 });
    }

    const validTransmissionTypes = ['manual', 'automatic'];
    if (!validTransmissionTypes.includes(transmission.toLowerCase())) {
      return Response.json({ error: `Transmission must be one of: ${validTransmissionTypes.join(', ')}` }, { status: 400 });
    }

    const validConditions = ['excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition.toLowerCase())) {
      return Response.json({ error: `Condition must be one of: ${validConditions.join(', ')}` }, { status: 400 });
    }

    if (typeof brand !== 'string' || brand.trim() === '') {
      return Response.json({ error: 'Brand must be a non-empty string' }, { status: 400 });
    }

    if (typeof model !== 'string' || model.trim() === '') {
      return Response.json({ error: 'Model must be a non-empty string' }, { status: 400 });
    }

    if (typeof location !== 'string' || location.trim() === '') {
      return Response.json({ error: 'Location must be a non-empty string' }, { status: 400 });
    }

    try {
      // Use the shared prediction service for simple estimation
      const result = calculateSimpleCarEstimation(
        brand,
        model,
        year,
        mileage,
        fuelType,
        transmission,
        condition,
        location
      );

      return Response.json(result);
    } catch (validationError: any) {
      return Response.json({ error: validationError.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in car estimation API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}