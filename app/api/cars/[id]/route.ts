import { NextResponse } from 'next/server';
import { carServices } from '@/lib/supabase/services/carService';
import { verifyToken } from '@/lib/auth'; // Use verifyToken helper for token verification

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const car = await carServices.getCarById(params.id);

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ car });
  } catch (error) {
    console.error('Get car error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Admin authentication
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: JWT secret not set' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  // Verify token and role
  const decoded: any = verifyToken(token);
  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Forbidden: Only admins can edit cars' }, { status: 403 });
  }

  try {
    const updatedData = await req.json();

    const car = await carServices.getCarById(id);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Only allow admin to edit their own cars, superadmin can edit any car
    if (decoded.role === 'admin' && car.adminid !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own cars' }, { status: 403 });
    }

    // Update the car - sanitize and validate input data
    const updatePayload: any = {};

    // Add fields only if they are provided and valid - handle both camelCase and snake_case from client
    // Only add non-empty values to avoid database constraint issues
    if (updatedData.title !== undefined && updatedData.title !== '') updatePayload.title = updatedData.title;
    if (updatedData.brand !== undefined && updatedData.brand !== '') updatePayload.brand = updatedData.brand;
    if (updatedData.model !== undefined && updatedData.model !== '') updatePayload.model = updatedData.model;
    if (updatedData.year !== undefined) updatePayload.year = updatedData.year;
    if (updatedData.price !== undefined) updatePayload.price = updatedData.price;
    if (updatedData.mileage !== undefined) updatePayload.mileage = updatedData.mileage;
    // Handle both camelCase and snake_case field names, only set if non-empty
    if (updatedData.fuel_type !== undefined && updatedData.fuel_type !== '') updatePayload.fuel_type = updatedData.fuel_type;
    if (updatedData.fuelType !== undefined && updatedData.fuelType !== '') updatePayload.fuel_type = updatedData.fuelType;
    if (updatedData.transmission !== undefined && updatedData.transmission !== '') updatePayload.transmission = updatedData.transmission;
    // Handle both camelCase and snake_case field names, only set if non-empty
    if (updatedData.ownership_history !== undefined && updatedData.ownership_history !== '') updatePayload.ownership_history = updatedData.ownership_history;
    if (updatedData.ownershipHistory !== undefined && updatedData.ownershipHistory !== '') updatePayload.ownership_history = updatedData.ownershipHistory;
    if (updatedData.images !== undefined) updatePayload.images = Array.isArray(updatedData.images) ? updatedData.images : [];
    if (updatedData.description !== undefined) updatePayload.description = updatedData.description; // Allow empty description
    if (updatedData.condition !== undefined && updatedData.condition !== '') updatePayload.condition = updatedData.condition;
    if (updatedData.availability !== undefined && updatedData.availability !== '') updatePayload.availability = updatedData.availability;

    // Handle specifications separately to ensure it's a proper object
    // Only add specifications if it's a valid object to avoid JSON constraint issues
    if (typeof updatedData.specifications === 'object' && updatedData.specifications !== null) {
      updatePayload.specifications = updatedData.specifications;
    }

    console.log('Attempting to update car with ID:', id);
    console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

    const updatedCar = await carServices.updateCar(id, updatePayload);

    if (!updatedCar) {
      console.error('Car update failed for ID:', id, 'with data:', updatePayload);
      return NextResponse.json({ error: 'Failed to update car - data validation or constraint error' }, { status: 500 });
    }

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error: any) {
    console.error('Update Car API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Admin authentication
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return NextResponse.json({ error: 'Server configuration error: JWT secret not set' }, { status: 500 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  // Verify token and role
  const delDecoded: any = verifyToken(token);
  if (!delDecoded || (delDecoded.role !== 'admin' && delDecoded.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Forbidden: Only admins can delete cars' }, { status: 403 });
  }

  try {
    const car = await carServices.getCarById(id);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Only allow admin to delete their own cars, superadmin can delete any car
    if (delDecoded.role === 'admin' && car.adminid !== delDecoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own cars' }, { status: 403 });
    }

    const isDeleted = await carServices.deleteCar(id);

    if (!isDeleted) {
      return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Car deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Car API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}