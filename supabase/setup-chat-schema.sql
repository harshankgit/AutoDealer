-- Complete Chat System Schema Setup with Correct RLS Policies

-- Drop existing chat-related tables if they exist
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_typing_indicators CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;

-- Create the chat_conversations table to track chat sessions between user and room
CREATE TABLE chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roomid UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unread_count INTEGER DEFAULT 0,

    -- Ensure one chat per user per room
    UNIQUE(roomid, userid)
);

-- Create the chat_messages table to store individual messages
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    senderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'car_details', 'image', 'file'
    car_details JSONB, -- Store car details when sending car info
    file_url TEXT, -- URL for file attachments
    file_name VARCHAR(255), -- Original file name
    file_type VARCHAR(50), -- File type (image, pdf, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the chat_typing_indicators table for real-time typing indicators
CREATE TABLE chat_typing_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 seconds', -- Auto-expire typing indicators

    UNIQUE(conversation_id, userid)
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_conversations_room_user ON chat_conversations(roomid, userid);
CREATE INDEX idx_chat_conversations_user ON chat_conversations(userid);
CREATE INDEX idx_chat_conversations_room ON chat_conversations(roomid);
CREATE INDEX idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(senderid);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_messages_read_status ON chat_messages(is_read);
CREATE INDEX idx_chat_messages_conversation_sender ON chat_messages(conversation_id, senderid);
CREATE INDEX idx_chat_messages_conversation_read ON chat_messages(conversation_id, is_read);

CREATE INDEX idx_chat_typing_indicators_conversation ON chat_typing_indicators(conversation_id);
CREATE INDEX idx_chat_typing_indicators_user ON chat_typing_indicators(userid);

-- Enable Row Level Security on new chat tables
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Create the function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
        -- Update timestamp for all operations (INSERT and UPDATE)
        NEW.timestamp = NOW();

        -- Only set updated_at for UPDATE operations and if the column exists
        IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'chat_conversations' THEN
            NEW.updated_at = NOW();
        ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'chat_messages' THEN
            NEW.updated_at = NOW();
        ELSIF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'chat_conversations' THEN
            NEW.updated_at = NOW();
        ELSIF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'chat_messages' THEN
            NEW.updated_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply the function to chat_conversations table
CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply the function to chat_messages table to update timestamp
CREATE TRIGGER update_chat_messages_timestamp
    BEFORE INSERT OR UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for chat_conversations table
CREATE POLICY "Users can view their own chat conversations" ON chat_conversations FOR SELECT TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can create own chat conversations" ON chat_conversations FOR INSERT TO authenticated WITH CHECK (
    userid = auth.uid()
);
CREATE POLICY "Users can update own chat conversations" ON chat_conversations FOR UPDATE TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Users can delete own chat conversations" ON chat_conversations FOR DELETE TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Admin can view chat conversations in their rooms" ON chat_conversations FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = chat_conversations.roomid AND r.adminid = auth.uid()
    )
);
CREATE POLICY "Admin can manage chat conversations in their rooms" ON chat_conversations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM rooms r WHERE r.id = chat_conversations.roomid AND r.adminid = auth.uid()
    )
);
CREATE POLICY "Superadmin can manage all chat conversations" ON chat_conversations FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- RLS Policies for chat_messages table
CREATE POLICY "Users can view messages in their conversations" ON chat_messages FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_conversations cc WHERE cc.id = chat_messages.conversation_id AND cc.userid = auth.uid()
    )
);
CREATE POLICY "Users can send messages in their conversations" ON chat_messages FOR INSERT TO authenticated WITH CHECK (
    senderid = auth.uid() AND
    EXISTS (
        SELECT 1 FROM chat_conversations cc WHERE cc.id = chat_messages.conversation_id AND cc.userid = auth.uid()
    )
);
CREATE POLICY "Users can update own messages" ON chat_messages FOR UPDATE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Users can delete own messages" ON chat_messages FOR DELETE TO authenticated USING (
    senderid = auth.uid()
);
CREATE POLICY "Admin can manage messages in their room conversations" ON chat_messages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_messages cm
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        JOIN rooms r ON cc.roomid = r.id
        WHERE cm.id = chat_messages.id AND r.adminid = auth.uid()
    )
);
CREATE POLICY "Superadmin can manage all chat messages" ON chat_messages FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- RLS Policies for chat_typing_indicators table
CREATE POLICY "Users can manage their own typing indicators" ON chat_typing_indicators FOR ALL TO authenticated USING (
    userid = auth.uid()
);
CREATE POLICY "Admin can view typing indicators in their rooms" ON chat_typing_indicators FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM chat_typing_indicators cti
        JOIN chat_conversations cc ON cti.conversation_id = cc.id
        JOIN rooms r ON cc.roomid = r.id
        WHERE cti.id = chat_typing_indicators.id AND r.adminid = auth.uid()
    )
);
CREATE POLICY "Superadmin can manage all typing indicators" ON chat_typing_indicators FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- Function to update unread count when a new message is inserted
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the unread count in the chat_conversations table
    -- Only increment for messages sent by others, not by the conversation owner
    UPDATE chat_conversations
    SET
        unread_count = unread_count + 1,
        last_message_at = NEW.timestamp
    WHERE id = NEW.conversation_id
    AND userid != NEW.senderid; -- Only increment for messages sent by others

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update unread count after inserting a new message
CREATE TRIGGER trigger_update_unread_count
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_count();

-- Function to mark messages as read when user accesses conversation
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param UUID, user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE chat_messages
    SET is_read = TRUE
    WHERE conversation_id = conversation_id_param
    AND senderid != user_id_param  -- Only mark messages from others as read
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Additional function to reset conversation unread count when accessed
CREATE OR REPLACE FUNCTION reset_conversation_unread_count(conversation_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE chat_conversations
    SET unread_count = 0
    WHERE id = conversation_id_param;
END;
$$ LANGUAGE plpgsql;