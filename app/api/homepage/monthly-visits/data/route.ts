import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Get all visits from the visits table
    const { data: visits, error: visitsError } = await getSupabaseServiceRole()
      .from('visits')
      .select('visited_at')
      .gte('visited_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) // Get last year of visits
      .order('visited_at', { ascending: false });

    if (visitsError) {
      console.error('Error fetching visits data:', visitsError);
      // If there's an error, try with the monthly_visits table as fallback
      const result = await getSupabaseServiceRole()
        .from('monthly_visits')
        .select('*')
        .order('year_month', { ascending: false })
        .limit(12); // Get last 12 months

      if (result.error) {
        // If both fail, return empty data
        console.error('Error with both visits and monthly_visits:', result.error);
        return NextResponse.json([]);
      } else {
        const formattedData = result.data.map((item: any) => ({
          month: item.month_name,
          count: item.visit_count || 0
        })).reverse(); // Reverse to show oldest first
        return NextResponse.json(formattedData);
      }
    }

    // Group visits by month and year
    const monthlyVisits: Record<string, number> = {};

    if (visits) {
      visits.forEach((visit: any) => {
        // Parse the date and format as "YYYY-MM"
        const date = new Date(visit.visited_at);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        if (monthlyVisits[monthName]) {
          monthlyVisits[monthName]++;
        } else {
          monthlyVisits[monthName] = 1;
        }
      });
    }

    // Generate the last 12 months of data (including months with 0 visits)
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const resultData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const count = monthlyVisits[monthName] || 0;

      resultData.push({
        month: monthName,
        count: count
      });
    }

    return NextResponse.json(resultData);
  } catch (error) {
    console.error('Error in monthly visits data API:', error);
    // Return empty data if there's a critical error
    return NextResponse.json([]);
  }
}