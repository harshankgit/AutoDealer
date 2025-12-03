import { NextResponse } from 'next/server';
import { visitServices } from '@/lib/supabase/services/generalServices';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET() {
  try {
    const count = await visitServices.getGlobalVisitCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Increment global visit count
    const count = await visitServices.incrementGlobalVisitCount();

    // Track the monthly visit by calling the new endpoint
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/homepage/monthly-visits`, {
        method: 'GET', // GET to increment monthly visits
      });
    } catch (monthlyError) {
      console.error('Error incrementing monthly visits:', monthlyError);
      // Don't fail the request if monthly visit tracking fails
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Increment visits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
