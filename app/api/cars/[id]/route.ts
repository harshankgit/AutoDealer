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

    // Update the car
    const updatedCar = await carServices.updateCar(id, {
      title: updatedData.title,
      brand: updatedData.brand,
      model: updatedData.model,
      year: updatedData.year,
      price: updatedData.price,
      mileage: updatedData.mileage,
      fuel_type: updatedData.fuel_type,
      transmission: updatedData.transmission,
      ownership_history: updatedData.ownership_history,
      images: updatedData.images,
      description: updatedData.description,
      condition: updatedData.condition,
      specifications: updatedData.specifications || {},
    });

    if (!updatedCar) {
      return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
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