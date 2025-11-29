import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { roomServices } from '@/lib/supabase/services/generalServices';

export async function GET() {
  try {
    // Count total users and rooms using Supabase
    // Note: Supabase doesn't have a direct count method, so we'll get all and count
    // For better performance, you might want to add a specific count function to your services
    const allUsers = await userServices.getAllUsers();
    const allRooms = await roomServices.getAllRooms(); // Get all rooms, not just active

    const totalUsers = allUsers.length;
    const totalShowrooms = allRooms.length;

    return NextResponse.json({ totalUsers, totalShowrooms });
  } catch (error) {
    console.error('Get public stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
