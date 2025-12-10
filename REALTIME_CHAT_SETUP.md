# Real-time Chat and Push Notifications Setup

This document explains how to set up and use the real-time chat system with OneSignal push notifications in the CarSelling platform.

## Overview

The system implements:
- Real-time chat using Supabase Realtime
- Push notifications using OneSignal
- Typing indicators
- Message history
- Unread message tracking

## Prerequisites

- Supabase project set up with the chat schema
- OneSignal account with app created
- Node.js and npm/yarn installed

## Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

## Database Schema

The chat system uses these tables (already set up in `setup-chat-schema.sql`):

- `chat_conversations`: Stores conversation records
- `chat_messages`: Stores individual messages
- `chat_typing_indicators`: Stores typing indicator status

## Key Features

### 1. Real-time Messaging
- Messages are sent via the API routes in `app/api/v2/chat/route.ts`
- Real-time updates are handled via Supabase Realtime
- Clients subscribe to specific conversation channels

### 2. Push Notifications
- When a new message is sent, the system triggers a OneSignal notification
- Notifications are sent to the message recipient
- Notification payload includes conversation ID for deep linking

### 3. Typing Indicators
- Typing status is sent via Pusher (for backward compatibility)
- Displayed in the chat interface in real-time

### 4. Message History
- Previous messages are loaded when opening a chat
- Messages are sorted chronologically
- Unread messages are tracked per conversation

## Components

### ChatProvider
- Located in `components/ChatProvider.tsx`
- Manages real-time subscriptions
- Tracks typing status and unread counts

### ChatRoom
- Located in `components/ChatRoom.tsx`
- Handles the chat interface
- Integrates with ChatProvider for real-time features

### OneSignalProvider
- Located in `components/OneSignalProvider.tsx`
- Initializes OneSignal in the browser
- Handles notification events

## API Endpoints

### `/api/v2/chat`
- `GET`: Get conversations or messages
- `POST`: Send a new message
- `DELETE`: Delete a conversation

### `/api/v2/chat/typing`
- `POST`: Send typing indicator status
- `GET`: Get typing indicators for a conversation

### `/api/notifications/onesignal/send`
- `POST`: Send push notification via OneSignal

## How to Use

### Setting up OneSignal

1. Create an account at [onesignal.com](https://onesignal.com)
2. Create a new app
3. Get your App ID and REST API Key
4. Add to environment variables

### Using the Chat System

1. The system automatically initializes when users access chat pages
2. Real-time messages are handled by the ChatProvider
3. Notifications are sent automatically when new messages arrive

### Testing

A test page is available at `/test-chat` that provides:
- Real-time status indicator
- List of conversations
- Chat interface
- Test functions

## Integration Points

The system is integrated into:
- `app/layout.tsx`: Providers are added to the root layout
- `app/admin/chats/page.tsx`: Admin chat interface
- `app/admin/superadmin/chats/page.tsx`: Super admin chat interface

## Troubleshooting

### Real-time Not Working
- Check Supabase connectivity
- Verify RLS policies are correctly set
- Ensure channels are properly subscribed/unsubscribed

### Push Notifications Not Working
- Verify OneSignal credentials
- Check browser notification permissions
- Ensure HTTPS is used in production (required for OneSignal)

### Typing Indicators Not Showing
- Verify Pusher credentials (still used for typing indicators)
- Check Pusher channel subscriptions

## Best Practices

1. Always unsubscribe from channels when components unmount
2. Use service role keys carefully in API routes
3. Implement proper error handling for network requests
4. Test both web and mobile push notification behavior