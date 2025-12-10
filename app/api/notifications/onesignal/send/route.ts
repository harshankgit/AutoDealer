import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, recipientId, conversationId, senderName } = await request.json();

    // Prepare OneSignal notification payload
    // Validate required environment variables
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !restApiKey) {
      console.error('OneSignal credentials missing');
      return NextResponse.json({ error: 'OneSignal configuration error' }, { status: 500 });
    }

    const notificationData = {
      app_id: appId,
      contents: { en: message },
      headings: { en: `New message from ${senderName}` },
      // For user-specific notifications, use filters instead of included_segments
      filters: [
        { field: 'tag', key: 'user_id', relation: '=', value: recipientId }
      ],
      data: {
        conversationId,
        click_action: `/chat/${conversationId}`, // Adjust based on your routing
      },
      // You can customize more options here
    };

    // Send notification to OneSignal
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OneSignal API error:', errorData);
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);

    return NextResponse.json({ 
      message: 'Notification sent successfully', 
      notificationId: result.id 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}