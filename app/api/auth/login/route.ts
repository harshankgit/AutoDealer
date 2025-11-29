import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Find user
    const user = await userServices.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password!);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}