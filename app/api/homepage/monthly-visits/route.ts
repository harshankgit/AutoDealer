import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Get current month and year
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const yearMonth = `${year}-${month}`;
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthName = `${monthNames[now.getMonth()]} ${year}`;

    // Try to get current month's visit count
    const { data: currentData, error: fetchError } = await getSupabaseServiceRole()
      .from('monthly_visits')
      .select('visit_count')
      .eq('year_month', yearMonth)
      .single();

    let visitCount: number;

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      // If there's a real error (not "no rows"), return current count
      console.error('Error fetching current monthly visit count:', fetchError);
      // Try to return the count we'd have calculated
      if (currentData && typeof currentData === 'object' && 'visit_count' in currentData) {
        const count = (currentData as { visit_count: number }).visit_count;
        visitCount = count + 1;
      } else {
        visitCount = 1; // Default to 1 if we can't get the current value
      }
    } else if (fetchError && fetchError.code === 'PGRST116') {
      // If no row exists, start with 1
      visitCount = 1;
    } else {
      // If row exists, increment by 1
      visitCount = (currentData?.visit_count || 0) + 1;
    }

    // Use upsert to handle both insert and update scenarios
    const { error: upsertError } = await getSupabaseServiceRole()
      .from('monthly_visits')
      .upsert({
        year_month: yearMonth,
        month_name: monthName,
        visit_count: visitCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'year_month' });

    if (upsertError) {
      console.error('Error upserting monthly visit counter:', upsertError);
      // If upsert fails, just return the count we calculated
      return NextResponse.json({ count: visitCount });
    }

    return NextResponse.json({ count: visitCount });
  } catch (error) {
    console.error('Error in monthly visits API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to get monthly visits data for charts
export async function POST(request: Request) {
  try {
    const { data, error } = await getSupabaseServiceRole()
      .from('monthly_visits')
      .select('*')
      .order('year_month', { ascending: false })
      .limit(12); // Get last 12 months

    if (error) {
      console.error('Error fetching monthly visits data:', error);
      return NextResponse.json(
        { error: 'Error fetching data' },
        { status: 500 }
      );
    }

    // Format the data to match expected structure
    const formattedData = data.map((item: any) => ({
      month: item.month_name,
      count: item.visit_count || 0
    })).reverse(); // Reverse to show oldest first

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error in monthly visits data API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}