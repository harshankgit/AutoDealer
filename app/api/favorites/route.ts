import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

// GET: Get user's favorites
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;

    // Fetch user's favorite car IDs from the favorites table using service role
    const { data: favoriteData, error: favoriteError } = await getSupabaseServiceRole()
      .from('favorites')
      .select('car_id')
      .eq('user_id', userId);

    if (favoriteError) {
      console.error('Error fetching user favorites:', favoriteError);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    // Extract car IDs from the results
    const favoriteCarIds = favoriteData ? favoriteData.map(item => item.car_id) : [];

    return NextResponse.json({
      favorites: favoriteCarIds,
    }, { status: 200 });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a car to favorites
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const { carId } = await request.json();

    if (!carId) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    // Check if the favorite already exists to avoid duplicates
    const { data: existingFavorite, error: checkError } = await getSupabaseServiceRole()
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('car_id', carId)
      .single();

    if (checkError) {
      if (checkError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error checking existing favorite:', checkError);
        console.error('Error details:', {
          code: checkError.code,
          message: checkError.message,
          details: checkError.details
        });
        return NextResponse.json({
          error: 'Failed to check existing favorite',
          details: checkError.message
        }, { status: 500 });
      }
      // If error is PGRST116 (not found), continue to add the favorite
    }

    if (existingFavorite) {
      // Return current favorites if already exists
      const currentFavorites = await getUserFavorites(userId);
      return NextResponse.json({
        message: 'Car is already in favorites',
        favorites: currentFavorites
      }, { status: 200 });
    }

    // Insert the new favorite
    const { error: insertError, data } = await getSupabaseServiceRole()
      .from('favorites')
      .insert([{ user_id: userId, car_id: carId }])
      .select();

    if (insertError) {
      console.error('Error adding to favorites:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      });
      return NextResponse.json({
        error: 'Failed to add to favorites',
        details: insertError.message
      }, { status: 500 });
    }

    // Return updated favorites list
    const updatedFavorites = await getUserFavorites(userId);

    return NextResponse.json({
      message: 'Added to favorites successfully',
      favorites: updatedFavorites,
    }, { status: 200 });
  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a car from favorites
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;

    // Extract carId from URL query parameters
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 });
    }

    // Delete the favorite
    const { error: deleteError } = await getSupabaseServiceRole()
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('car_id', carId);

    if (deleteError) {
      console.error('Error removing from favorites:', deleteError);
      console.error('Error details:', {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details
      });
      return NextResponse.json({
        error: 'Failed to remove from favorites',
        details: deleteError.message
      }, { status: 500 });
    }

    // Return updated favorites list
    const updatedFavorites = await getUserFavorites(userId);

    return NextResponse.json({
      message: 'Removed from favorites successfully',
      favorites: updatedFavorites,
    }, { status: 200 });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get user's favorite car IDs
async function getUserFavorites(userId: string) {
  const { data: favoriteData, error: favoriteError } = await getSupabaseServiceRole()
    .from('favorites')
    .select('car_id')
    .eq('user_id', userId);

  if (favoriteError) {
    console.error('Error fetching user favorites:', favoriteError);
    return [];
  }

  return favoriteData ? favoriteData.map(item => item.car_id) : [];
}