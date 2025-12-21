import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { verifyToken } from '@/lib/auth';

interface Params {
  id: string;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = params;

  // Admin authentication
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const decoded: any = verifyToken(token);

  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
    console.error('Authentication failed. Decoded token:', decoded);
    return NextResponse.json({ error: 'Unauthorized or forbidden' }, { status: 401 });
  }

  try {
    const { is_active } = await req.json();

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active status provided' }, { status: 400 });
    }

    console.log('Attempting to update room status with ID:', id);
    console.log('Authenticated user ID:', decoded.userId);
    console.log('Authenticated user role:', decoded.role);
    console.log('New active status:', is_active);

    // Check if the user is the owner of the room or a superadmin
    const room = await roomServices.getRoomByIdForAdmin(id);
    console.log('Room found:', room);

    if (!room) {
      console.error('Room not found in database:', id);
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }

    // Only allow admin to update their own room, superadmin can update any room
    if (decoded.role === 'admin' && room.adminid !== decoded.userId) {
      console.error('Admin does not own this room. Room admin ID:', room.adminid, 'vs decoded user ID:', decoded.userId);
      return NextResponse.json({ error: 'Forbidden: You can only update your own showroom status' }, { status: 403 });
    }

    const updatedRoom = await roomServices.updateRoomStatus(id, is_active);

    if (!updatedRoom) {
      console.error('Failed to update room status:', id);
      return NextResponse.json({ error: 'Failed to update showroom status' }, { status: 500 });
    }

    console.log('Room status updated successfully:', updatedRoom);

    return NextResponse.json(updatedRoom, { status: 200 });

  } catch (error: any) {
    console.error('Update Room Status API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}