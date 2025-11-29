import { NextResponse } from 'next/server';
import { paymentServices } from '@/lib/supabase/services/generalServices';
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

    // Get payments - in Supabase we'll get all payments and the service will handle population
    const payments = await paymentServices.getAllPayments(); // Need to add this method

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Get all payments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}