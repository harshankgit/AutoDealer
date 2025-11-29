import { NextResponse } from 'next/server';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const rooms = await roomServices.getActiveRooms();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
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

    const { name, description, location, contact_info, image } = await request.json();

    // Validate input
    if (!name || !description || !location) {
      return NextResponse.json(
        { error: 'Please provide name, description, and location' },
        { status: 400 }
      );
    }

    // Check if admin already has a room (only for admins, not superadmins)
    if (decoded.role === 'admin') {
      const hasRoom = await roomServices.checkAdminHasRoom(decoded.userId);
      if (hasRoom) {
        return NextResponse.json(
          { error: 'You already have a room. Each admin can have only one room.' },
          { status: 400 }
        );
      }
    }

    // Create room
    const room = await roomServices.createRoom({
      name,
      description,
      location,
      contact_info: contact_info || {},
      image: image || null,
      adminid: decoded.userId,
      is_active: true,
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}