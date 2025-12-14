import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';
import { otpServices } from '@/lib/supabase/services/otpService';

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

    const { otp } = await request.json();

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Get admin user details to verify OTP
    const adminUser = await userServices.getUserById(decoded.userId);
    if (!adminUser || !adminUser.email) {
      return NextResponse.json(
        { error: 'Admin email not found' },
        { status: 404 }
      );
    }

    // Verify the OTP
    const verifyResult = await otpServices.verifyOTPForAction(adminUser.email, otp, 'scanner_upload');
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.message || 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // OTP is valid - return success
    return NextResponse.json({
      message: 'OTP verified successfully',
      verified: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('Verify OTP for scanner error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}