import { NextResponse } from 'next/server';
import { otpServices } from '@/lib/supabase/services/otpService';

export async function POST(request: Request) {
  try {
    const { email, otp, username, password, role = 'user' } = await request.json();

    // Validate input
    if (!email || !otp || !username || !password) {
      return NextResponse.json(
        { error: 'Please provide email, otp, username, and password' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Role must be user, admin, or superadmin' },
        { status: 400 }
      );
    }

    // Verify OTP and create user
    const verificationResult = await otpServices.verifyOTP(email, otp, {
      username,
      password,
      role,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: verificationResult.message,
      token: verificationResult.token,
      user: verificationResult.user,
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}