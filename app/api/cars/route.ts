import { NextResponse } from 'next/server';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomid = searchParams.get('roomid') || searchParams.get('roomid'); // Handle both parameter names
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const fuelType = searchParams.get('fuelType');
    const availability = searchParams.get('availability');

    const filters: any = {};

    if (roomid) {
      filters.roomid = roomid;
    }
    if (brand) {
      filters.brand = brand;
    }
    if (minPrice || maxPrice) {
      if (minPrice) filters.minPrice = parseInt(minPrice);
      if (maxPrice) filters.maxPrice = parseInt(maxPrice);
    }
    if (fuelType) {
      filters.fuel_type = fuelType;
    }
    if (availability) {
      filters.availability = availability;
    }

    const cars = await carServices.getAllCars(filters);

    return NextResponse.json({ cars });
  } catch (error) {
    console.error('Get cars error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    let carData = await request.json();

    // Convert camelCase field names to snake_case to match database schema
    carData = {
      ...carData,
      fuel_type: carData.fuel_type || carData.fuelType,
      ownership_history: carData.ownership_history || carData.ownershipHistory,
      transmission: carData.transmission || carData.transmission,
      // Add other potential conversions
      roomid: carData.roomid || carData.roomid,
      adminid: carData.adminid || carData.adminid,
      created_at: carData.created_at || carData.createdAt,
      updated_at: carData.updated_at || carData.updatedAt,
      availability: carData.availability || 'Available',
      images: carData.images || carData.images,
      specifications: carData.specifications || carData.specifications,
    };

    // Validate required fields (removed 'images' since it's now optional)
    const requiredFields = ['title', 'brand', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission', 'ownership_history', 'description', 'condition'];
    const missingFields = requiredFields.filter(field => !carData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    let roomid;
    if (decoded.role === 'superadmin' && carData.roomid) {
      // Superadmin can add cars to any room
      roomid = carData.roomid;
    } else {
      // Regular admin can only add cars to their own room
      const adminRoom = await roomServices.getRoomByadminid(decoded.userId);
      if (!adminRoom) {
        return NextResponse.json(
          { error: 'You must create a room before adding cars' },
          { status: 400 }
        );
      }
      roomid = adminRoom.id;
    }

    // Create car
    const car = await carServices.createCar({
      ...carData,
      roomid: roomid,
      adminid: decoded.userId,
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Failed to create car' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Car added successfully',
      car,
    });
  } catch (error) {
    console.error('Create car error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}