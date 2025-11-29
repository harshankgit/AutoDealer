import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService'; // Import the Car service
import { verifyToken } from '@/lib/auth';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const room = await roomServices.getRoomById(params.id);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = params;

  // Admin authentication
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const decoded: any = verifyToken(token);

  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 401 });
  }

  try {
    const { name, description, location, image } = await req.json();

    if (!name || !description || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user is the owner of the room or a superadmin
    const room = await roomServices.getRoomById(id);
    if (!room) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }

    // Only allow admin to edit their own room, superadmin can edit any room
    if (decoded.role === 'admin' && room.adminid !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own showroom' }, { status: 403 });
    }

    const updatedRoom = await roomServices.updateRoom(id, {
      name,
      description,
      location,
      image: image || null
    });

    if (!updatedRoom) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRoom, { status: 200 });

  } catch (error: any) {
    console.error('Update Room API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { id } = params;

  // Admin authentication
  const delToken = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const delDecoded: any = verifyToken(delToken);

  if (!delDecoded || (delDecoded.role !== 'admin' && delDecoded.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 401 });
  }

  try {
    // Find the room to be deleted
    const room = await roomServices.getRoomById(id);

    if (!room) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }

    // Only allow admin to delete their own room, superadmin can delete any room
    if (delDecoded.role === 'admin' && room.adminid !== delDecoded.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own showroom' }, { status: 403 });
    }

    // Delete all cars associated with this room
    const allCars = await carServices.getAllCars();
    const carsInRoom = allCars.filter(car => car.roomid === id);
    for (const car of carsInRoom) {
      await carServices.deleteCar(car.id);
    }

    // Delete the room itself
    const isDeleted = await roomServices.deleteRoom(id);

    if (!isDeleted) {
      return NextResponse.json({ error: 'Failed to delete showroom' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Showroom and associated cars deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Room API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}