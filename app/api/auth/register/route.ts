import { NextResponse } from 'next/server';
import { otpServices } from '@/lib/supabase/services/otpService';

export async function POST(request: Request) {
  try {
    console.log("🔥 METHOD:", request.method);
    const body = await request.json();
    console.log("📩 BODY RECEIVED:", body);

    const { email, username, password, role = 'user' } = body;

    // Validate input
    if (!username || !email || !password) {
      console.log("❌ Missing required fields - username:", !!username, "email:", !!email, "password:", !!password);
      return NextResponse.json(
        { error: 'Please provide username, email, and password' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      console.log("❌ Invalid role:", role);
      return NextResponse.json(
        { error: 'Invalid role. Role must be user, admin, or superadmin' },
        { status: 400 }
      );
    }

    console.log("🔍 Checking if user already exists for email:", email);

    // Check if user already exists
    const { userServices } = await import('@/lib/supabase/services/userService');
    const existingUser = await userServices.getUserByEmail(email);
    if (existingUser) {
      console.log("❌ User already exists for email:", email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log("📧 Sending OTP to email:", email);

    // Send OTP to the user's email
    const otpResult = await otpServices.sendOTP(email);

    console.log("📧 OTP Service Result:", otpResult);

    if (!otpResult.success) {
      console.log("❌ OTP Service failed:", otpResult.message);
      return NextResponse.json(
        { error: otpResult.message },
        { status: 400 }
      );
    }

    console.log("✅ OTP sent successfully for email:", email);

    return NextResponse.json({
      message: otpResult.message,
      email, // Return email to be used for verification
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}