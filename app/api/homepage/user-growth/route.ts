import { NextResponse } from 'next/server';
import { userServices } from '@/lib/supabase/services/userService';

export async function GET(request: Request) {
  try {
    // Get all users
    const allUsers = await userServices.getAllUsers();
    
    // Group users by month and year of registration
    const userGrowthData: { month: string; count: number }[] = [];
    
    // Create a map to count users by month
    const monthlyCount: Record<string, number> = {};
    
    allUsers.forEach(user => {
      const date = new Date(user.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyCount[monthYear]) {
        monthlyCount[monthYear]++;
      } else {
        monthlyCount[monthYear] = 1;
      }
    });
    
    // Convert to array with formatted month names
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Get the last 12 months of data
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];
      
      userGrowthData.push({
        month: `${monthName} ${date.getFullYear()}`,
        count: monthlyCount[monthYear] || 0
      });
    }
    
    return NextResponse.json(userGrowthData);
  } catch (error) {
    console.error('Error in user growth API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}