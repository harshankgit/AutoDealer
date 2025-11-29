import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    // Get all users
    const users = await userServices.getAllUsers();

    // Remove password from response
    const usersWithoutPassword = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    return NextResponse.json({ users: usersWithoutPassword });
  } catch (error) {
    console.error('Get all users error:', error);
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

    if (!decoded || decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 401 }
      );
    }

    const { username, email, password, role } = await request.json();

    // Validate input
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Please provide username, email, password, and role' },
        { status: 400 }
      );
    }

    // Create user (password will be hashed in service)
    const user = await userServices.createUser({
      username,
      email,
      password,
      role,
      favorites: [],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}