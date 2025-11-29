import { NextResponse } from 'next/server';
import { carServices } from '@/lib/supabase/services/carService';
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

    const car = await carServices.getCarById(id);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const isDeleted = await carServices.deleteCar(id);

    if (!isDeleted) {
      return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Car deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete car error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}