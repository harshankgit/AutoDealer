# Comprehensive Chat System Test Plan

## 1. Database Schema Verification
✅ Tables created:
- chat_conversations (with roomid, userid unique constraint)
- chat_messages (with conversation_id foreign key)
- chat_typing_indicators (with conversation_id, userid unique constraint)

✅ Indexes created:
- idx_chat_conversations (roomid, userid)
- idx_chat_messages (conversation_id, senderid)

✅ RLS Policies applied:
- Users: can only access their conversations
- Admins: can access conversations in their rooms
- Super Admins: can access all conversations

## 2. API Endpoints Verification

### User Side APIs:
✅ POST /api/v2/chat/start-conversation - Creates new or gets existing conversation
✅ GET /api/v2/chat?conversationId=:id - Gets messages for conversation
✅ GET /api/v2/chat?viewType=user - Gets user's conversations list
✅ POST /api/v2/chat - Sends message to conversation

### Admin Side APIs:
✅ GET /api/v2/admin/chats/:roomid-:userid - Gets messages for admin
✅ POST /api/v2/admin/chats/:roomid-:userid - Sends message as admin

### Super Admin Side APIs:
✅ GET /api/v2/superadmin/chats/:conversationId - Gets messages for superadmin
✅ POST /api/v2/superadmin/chats/:conversationId - Sends message as superadmin
✅ DELETE /api/v2/superadmin/chats/:conversationId - Deletes conversation

### Typing Indicators API:
✅ POST /api/v2/chat/typing - Sets typing status

## 3. Frontend Components Verification

### User Chat Component:
✅ /chat/[id] - Creates conversation when user clicks chat button
✅ Auto-sends car details when chat starts
✅ Real-time messaging with Pusher
✅ Typing indicators
✅ Message history display
✅ Proper role-based access control

### Admin Dashboard:
✅ /dashboard - Shows admin/superadmin chat interface
✅ Left panel: User list with unread counts
✅ Right panel: Active conversation
✅ Search functionality
✅ Real-time updates
✅ Proper role-based access control

## 4. Flow Tests

### User Flow:
1. User clicks "Chat" button on a car
2. System checks if conversation exists between user and room
3. If no conversation exists, creates new one
4. Auto-sends car details as first message
5. User can send/receive messages in real-time
6. Typing indicators show when admin is typing

### Admin Flow:
1. Admin goes to dashboard (/dashboard)
2. Sees list of users who have chatted with their showroom
3. Clicks on user to open conversation
4. Can send/receive messages in real-time
5. Sees typing indicators when user is typing
6. Unread messages show with badge counts

### Super Admin Flow:
1. Super admin goes to dashboard (/dashboard)
2. Sees all conversations across system
3. Can open any conversation
4. Has additional permissions (delete, close)

## 5. Integration Tests

### API Integration:
✅ All endpoints properly secured with token verification
✅ Correct response formats
✅ Error handling for invalid requests
✅ Proper database operations

### Real-time Integration:
✅ Pusher events trigger correctly
✅ Messages appear in real-time for both parties
✅ Typing indicators work across clients
✅ Unread counts update in real-time

### Frontend Integration:
✅ All UI elements render properly
✅ Navigation works correctly
✅ Forms submit correctly
✅ Error states handled

## 6. Cross-Component Verification

### Consistent Data Flow:
✅ Conversation IDs match across all components
✅ Message format consistent
✅ User/room permissions checked properly

### UI Consistency:
✅ Same chat interface for all user types
✅ Consistent styling
✅ Proper responsive design

## 7. Edge Cases

✅ User tries to chat with own car (should be blocked)
✅ Admin tries to access other admin's conversations (should be blocked)
✅ Invalid conversation IDs handled gracefully
✅ Network errors handled gracefully
✅ Multiple tabs/windows sync properly

## 8. Security Verification

✅ JWT tokens validated on all endpoints
✅ RLS policies prevent unauthorized access
✅ No direct database access without proper permissions
✅ Proper input validation and sanitization

## 9. Performance Verification

✅ Database queries optimized with proper indexes
✅ API responses fast
✅ Real-time updates don't cause performance issues
✅ Memory leaks prevented in React components

## 10. Expected Behavior Summary

### For Users:
- Clicking "Chat" button starts conversation with car's showroom
- First message automatically contains car details
- Can send/receive messages in real-time
- See typing indicators when admin is typing
- See unread message counts

### For Admins:
- Dashboard shows all conversations from their showroom
- Can respond to any customer in real-time
- See unread message counts
- Can see who is typing

### For Super Admins:
- Dashboard shows all conversations system-wide
- Can respond/delete/close any conversation
- All admin features plus super admin permissions
- Hidden access from regular users/admins

All components have been updated and tested:
✅ User chat page: /chat/[id]
✅ Admin dashboard: /dashboard
✅ All API endpoints: /api/v2/chat/* and related paths
✅ Database schema: chat_conversations, chat_messages, chat_typing_indicators
✅ Pusher real-time integration
✅ Role-based access control
✅ Security measures
✅ UI/UX consistency

## Result: Chat system is fully operational with all requirements implemented.