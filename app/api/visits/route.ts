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

    // Create a visit record for aggregation (only if we have valid car and user IDs)
    try {
      // Get a valid car ID for demo purposes (in production, you'd track actual car visits)
      const { data: cars } = await getSupabaseServiceRole()
        .from('cars')
        .select('id')
        .limit(1);

      const { data: users } = await getSupabaseServiceRole()
        .from('users')
        .select('id')
        .limit(1);

      // Only create a visit record if we have valid IDs
      if (cars && cars.length > 0 && users && users.length > 0) {
        const sampleVisit = await visitServices.createVisit({
          carid: cars[0].id, // Use a real car ID
          userid: users[0].id, // Use a real user ID
          visited_at: new Date().toISOString(),
        });

        if (!sampleVisit) {
          console.warn('Could not create visit record with valid IDs');
        }
      } else {
        // If no valid records exist, we'll use the API call itself as a "visit" indicator
        // for reporting purposes without DB records
        console.log('No cars/users found to create visit records');
      }
    } catch (visitError) {
      console.error('Error creating visit record:', visitError);
      // Don't fail the request if individual visit recording fails
    }

    // Also track the monthly visit by calling the new endpoint
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
