// app/api/car-prediction/route.ts
import { NextRequest } from 'next/server';
import { calculateCarPrediction } from '@/lib/car-prediction-service';

export async function POST(request: NextRequest) {
  try {
    const {
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      condition,
      location,
      bodyType,
      engineSize,
      color,
      features
    } = await request.json();

    // Validate required fields
    if (!brand || !model || !year || !mileage || !fuelType || !transmission || !condition) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Additional validation
    const currentYear = new Date().getFullYear();
    if (typeof year !== 'number' || year < 1990 || year > currentYear + 1) {
      return new Response(
        JSON.stringify({ error: `Year must be between 1990 and ${currentYear + 1}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof mileage !== 'number' || mileage < 0 || mileage > 10000000) {
      return new Response(
        JSON.stringify({ error: 'Mileage must be between 0 and 10,000,000 km' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
    if (!validFuelTypes.includes(fuelType.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: `Fuel type must be one of: ${validFuelTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validTransmissionTypes = ['manual', 'automatic'];
    if (!validTransmissionTypes.includes(transmission.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: `Transmission must be one of: ${validTransmissionTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validConditions = ['excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: `Condition must be one of: ${validConditions.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof brand !== 'string' || brand.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Brand must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof model !== 'string' || model.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Model must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof location !== 'string' || location.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Location must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Use the shared prediction service
      const result = calculateCarPrediction(
        brand,
        model,
        year,
        mileage,
        fuelType,
        transmission,
        condition,
        location,
        bodyType,
        engineSize,
        color,
        features
      );

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in car prediction API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}