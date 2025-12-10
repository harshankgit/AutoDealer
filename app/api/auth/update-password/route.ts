import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    const { currentPassword, newPassword } = await request.json();
    const userId = decodedToken.userId;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: decodedToken.email, // Get email from token
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Sign out the user to force re-authentication with the new password
    await supabase.auth.signOut();

    return NextResponse.json({
      message: 'Password updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}