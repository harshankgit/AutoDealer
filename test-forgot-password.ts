// Test script for forgot password functionality
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth';

async function testForgotPassword() {
  console.log('Testing forgot password functionality...');

  // Test 1: Create a test user if one doesn't exist
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';
  const hashedPassword = await hashPassword(testPassword);

  // Check if user exists
  const { data: existingUser } = await getSupabaseServiceRole()
    .from('users')
    .select('id')
    .eq('email', testEmail)
    .single();

  if (!existingUser) {
    // Create test user
    const { data: newUser, error } = await getSupabaseServiceRole()
      .from('users')
      .insert([{
        username: 'testuser',
        email: testEmail,
        password: hashedPassword,
        role: 'user'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating test user:', error);
      return;
    }

    console.log('Test user created:', newUser);
  } else {
    console.log('Test user already exists');
  }

  // Test 2: Call the forgot password API
  console.log('\nTesting forgot password API endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const result = await response.json();
    console.log('Forgot password API response:', result);
    console.log('Status:', response.status);

    if (response.ok) {
      console.log('✅ Forgot password API test passed');
    } else {
      console.log('❌ Forgot password API test failed');
    }
  } catch (error) {
    console.error('Error calling forgot password API:', error);
  }

  // Test 3: Verify that a password reset token was created
  console.log('\nChecking for password reset token in database...');
  try {
    const { data: tokens, error } = await getSupabaseServiceRole()
      .from('password_reset_tokens')
      .select('*')
      .eq('email', testEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error querying password reset tokens:', error);
    } else if (tokens && tokens.length > 0) {
      console.log('✅ Found password reset token:', tokens[0]);
    } else {
      console.log('❌ No password reset token found');
    }
  } catch (error) {
    console.error('Error checking for password reset token:', error);
  }
}

// Run the test
testForgotPassword().catch(console.error);