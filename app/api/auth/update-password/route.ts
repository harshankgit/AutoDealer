import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

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

    // Fetch user details to check role
    const { data: userRoleData, error: userRoleError } = await getSupabaseServiceRole()
      .from('users')
      .select('role')
      .eq('id', decodedToken.userId)
      .single();

    if (userRoleError) {
      console.error('Error fetching user data:', userRoleError);
      return NextResponse.json({ error: 'Failed to verify user role' }, { status: 500 });
    }

    // Prevent superadmins from changing passwords
    if (userRoleData?.role === 'superadmin') {
      return NextResponse.json({ error: 'Super admins cannot change passwords' }, { status: 403 });
    }

    const { currentPassword, newPassword } = await request.json();
    const userId = decodedToken.userId;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Fetch user data to verify current password
    const { data: userPasswordData, error: userPasswordError } = await getSupabaseServiceRole()
      .from('users')
      .select('password, email')
      .eq('id', userId)
      .single();

    if (userPasswordError || !userPasswordData) {
      console.error('Error fetching user data:', userPasswordError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password using your custom authentication method
    const { verifyPassword } = await import('@/lib/auth'); // Assuming you have a verifyPassword function
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userPasswordData.password);

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash the new password
    const { hashPassword } = await import('@/lib/auth'); // Assuming you have a hashPassword function
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    const { error: updateError } = await getSupabaseServiceRole()
      .from('users')
      .update({ password: hashedNewPassword, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Password updated successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}