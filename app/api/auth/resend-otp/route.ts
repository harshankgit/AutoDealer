import { NextResponse } from 'next/server';
import { otpServices } from '@/lib/supabase/services/otpService';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Please provide email' },
        { status: 400 }
      );
    }

    // Resend OTP
    const otpResult = await otpServices.resendOTP(email);

    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: otpResult.message,
      email, // Return email to be used for verification
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}