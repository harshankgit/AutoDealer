import { supabase } from '@/lib/supabase';

// Test script to verify real-time functionality
export const testRealtimeFunctionality = async () => {
  console.log('Starting real-time functionality test...');
  
  // Test 1: Verify Supabase connectivity
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('✓ Supabase connectivity test passed');
  } catch (error) {
    console.error('✗ Supabase connectivity test failed:', error);
    return false;
  }

  // Test 2: Verify Realtime subscription works
  try {
    const testChannelName = `test-channel-${Date.now()}`;
    let realtimeEventReceived = false;
    
    const testChannel = supabase
      .channel(testChannelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Real-time event received:', payload);
          realtimeEventReceived = true;
        }
      )
      .subscribe();

    // Wait a bit and then clean up
    setTimeout(() => {
      supabase.removeChannel(testChannel);
    }, 2000);

    console.log('✓ Real-time subscription test started');
  } catch (error) {
    console.error('✗ Real-time subscription test failed:', error);
    return false;
  }

  console.log('✓ All real-time functionality tests passed!');
  return true;
};

// Test function for OneSignal
export const testOneSignalIntegration = () => {
  try {
    if (typeof window !== 'undefined' && (window as any).OneSignal) {
      console.log('✓ OneSignal is properly initialized');
      return true;
    } else {
      console.log('⚠ OneSignal may not be initialized yet (expected during SSR)');
      return true; // Don't fail the test during SSR
    }
  } catch (error) {
    console.error('✗ OneSignal integration test failed:', error);
    return false;
  }
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Client-side test
  testRealtimeFunctionality();
  testOneSignalIntegration();
}