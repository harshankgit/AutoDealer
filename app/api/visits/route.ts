import { NextResponse } from 'next/server';
import { visitServices } from '@/lib/supabase/services/generalServices';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('GET /api/visits called');
    const count = await visitServices.getGlobalVisitCount();
    console.log('Current visit count:', count);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get visits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('POST /api/visits called');
    // Increment global visit count
    const count = await visitServices.incrementGlobalVisitCount();
    console.log('New visit count after increment:', count);

    // Track the monthly visit by calling the new endpoint
    try {
      // Use absolute URL to avoid fetch issues
      const monthlyVisitsUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/homepage/monthly-visits`;
      await fetch(monthlyVisitsUrl, {
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
