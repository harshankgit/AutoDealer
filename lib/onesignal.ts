import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to subscribe user to OneSignal and save the subscription to Supabase
export const subscribeUserToOneSignal = async (userId: string, onesignalId: string) => {
  try {
    // Update user profile with OneSignal ID
    const { error } = await supabase
      .from('users')
      .update({ onesignal_id: onesignalId })
      .eq('id', userId);

    if (error) {
      console.error('Error updating OneSignal ID in Supabase:', error);
      return false;
    }

    console.log('OneSignal ID updated successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error in subscribeUserToOneSignal:', error);
    return false;
  }
};

// Function to add OneSignal tags for user identification
export const setOneSignalUserTags = async (userId: string) => {
  if (typeof window !== 'undefined' && (window as any).OneSignal) {
    try {
      await (window as any).OneSignal.User.addTag('user_id', userId);
      console.log('OneSignal tag set for user:', userId);
    } catch (error) {
      console.error('Error setting OneSignal tags:', error);
    }
  }
};

// Function to send a test notification
export const sendTestNotification = async (message: string, userId: string) => {
  try {
    const response = await fetch('/api/notifications/onesignal/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        recipientId: userId,
        senderName: 'System'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('Test notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};