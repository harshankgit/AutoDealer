import { NextResponse } from 'next/server';
import { visitServices } from '@/lib/supabase/services/generalServices';

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
    const count = await visitServices.incrementGlobalVisitCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Increment visits error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
