import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // For security, we'll use an environment variable setup key to create the first superadmin
    const setupKey = request.headers.get('x-setup-key');
    const validSetupKey = process.env.SUPERADMIN_SETUP_KEY;

    if (!validSetupKey || setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid setup key' },
        { status: 401 }
      );
    }

    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide username, email, and password' },
        { status: 400 }
      );
    }

    // Check if any superadmin already exists
    const allUsers = await userServices.getAllUsers();
    const existingSuperAdmin = allUsers.find(user => user.role === 'superadmin');
    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'A super admin already exists. Cannot create another one.' },
        { status: 400 }
      );
    }

    // Check if user already exists - this will be handled in the service
    // Create superadmin user
    const user = await userServices.createUser({
      username,
      email,
      password,
      role: 'superadmin',
      favorites: [],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      message: 'Super Admin created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Create super admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}