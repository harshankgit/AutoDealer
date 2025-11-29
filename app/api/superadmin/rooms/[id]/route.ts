import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { carServices } from '@/lib/supabase/services/carService'; // Also import Car service to delete associated cars
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const room = await roomServices.getRoomById(id);
    if (!room) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}