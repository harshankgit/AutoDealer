export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get the token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({
        error: 'Invalid or missing token',
        tokenPresent: !!token
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomid = searchParams.get('roomid') || searchParams.get('roomid');
    
    // Log the session information
    const sessionInfo = {
      userId: decoded.userId,
      role: decoded.role,
      tokenValid: !!decoded,
      roomIdParam: roomid
    };

    // Test direct query with service role (bypasses RLS)
    let directResult = [];
    let directError = null;
    try {
      const { data, error } = await getSupabaseServiceRole()
        .from('cars')
        .select('*')
        .eq('roomid', roomid);
        
      if (error) {
        directError = error;
      } else {
        directResult = data;
      }
    } catch (error) {
      directError = error;
    }

    // Test query with user role (respects RLS)
    let userResult = [];
    let userError = null;
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('roomid', roomid);
        
      if (error) {
        userError = error;
      } else {
        userResult = data;
      }
    } catch (error) {
      userError = error;
    }

    // Check room status
    let roomStatus = null;
    try {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('is_active')
        .eq('id', roomid)
        .single();
        
      roomStatus = roomData;
    } catch (error: any) {
      roomStatus = { error: error.message || 'Unknown error' };
    }

    // Check if it's the user's room
    let isUserRoom = false;
    try {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('adminid')
        .eq('id', roomid)
        .single();
        
      if (roomData) {
        isUserRoom = roomData.adminid === decoded.userId;
      }
    } catch (error) {
      // Ignore error for room check
    }

    return NextResponse.json({
      session: sessionInfo,
      roomStatus,
      isUserRoom,
      directQuery: {
        count: directResult.length,
        error: directError ? (directError as any).message : null,
        sample: directResult.length > 0 ? directResult[0] : null
      },
      userQuery: {
        count: userResult.length,
        error: userError ? (userError as any).message : null,
        sample: userResult.length > 0 ? userResult[0] : null
      },
      rlsBlockDetected: directResult.length > 0 && userResult.length === 0,
      recommendations: [
        'If direct query has data but user query is empty: RLS policy is blocking access',
        'Check if room is_active = true',
        'Verify user role has proper permissions',
        'Confirm user is admin of the room if that\'s required by policy'
      ]
    });

  } catch (error) {
    console.error('Debug cars error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}