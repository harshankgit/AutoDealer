-- Add message status column for delivery receipts
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(conversation_id, status);