import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { sendPasswordResetEmail } from '@/lib/email';

// Generate a random token for password reset
function generateToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36)[2] || '0'
  ).join('');
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await getSupabaseServiceRole()
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the reset token in the database
    const { error: tokenError, data: tokenData } = await getSupabaseServiceRole()
      .from('password_reset_tokens')
      .insert([{
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      }])
      .select(); // Select to return the inserted data

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      // Check if the error is related to table not existing
      if (tokenError.code === '42P01') { // Undefined table error code
        console.error('password_reset_tokens table does not exist in the database');
      }
      return NextResponse.json(
        { error: 'Failed to initiate password reset' },
        { status: 500 }
      );
    }

    console.log('Password reset token created successfully:', tokenData);

    // Send password reset email (only if email is configured)
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (emailConfigured) {
      try {
        await sendPasswordResetEmail(email, user.username || email.split('@')[0], resetToken);
      } catch (emailError: any) {
        console.error('Error sending password reset email:', emailError);
        // Don't return error to user to prevent enumeration
        // The token was already created successfully, so we can still return success
      }
    } else {
      console.warn('Email credentials not configured. Password reset token created but email not sent.');
    }

    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}