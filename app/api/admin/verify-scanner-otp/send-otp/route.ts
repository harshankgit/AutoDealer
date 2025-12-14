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

    // Get admin user details to send OTP to their email
    const adminUser = await userServices.getUserById(decoded.userId);
    if (!adminUser || !adminUser.email) {
      return NextResponse.json(
        { error: 'Admin email not found' },
        { status: 404 }
      );
    }

    // Generate and send OTP
    const otpResult = await otpServices.generateAndSendOTP(adminUser.email, 'scanner_upload');
    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.message || 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'OTP sent successfully to your email'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Send OTP for scanner error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}