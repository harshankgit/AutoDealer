-- Verification script to ensure chat tables exist and have proper RLS policies

-- Check if chat_conversations table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'chat_conversations'
) AS has_chat_conversations;

-- Check if chat_messages table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'chat_messages'
) AS has_chat_messages;

-- Check if chat_typing_indicators table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'chat_typing_indicators'
) AS has_chat_typing_indicators;

-- If tables exist, check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('chat_conversations', 'chat_messages', 'chat_typing_indicators');