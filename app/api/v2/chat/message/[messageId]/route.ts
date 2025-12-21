import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
    request: Request,
    { params }: { params: { messageId: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken: any = verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messageId } = params;

        if (!messageId) {
            return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch message with sender details
        const { data: message, error } = await supabase
            .from('chat_messages')
            .select(`
        id,
        conversation_id,
        senderid,
        message,
        message_type,
        car_details,
        file_url,
        file_name,
        file_type,
        is_read,
        timestamp,
        created_at,
        sender:users(username, role)
      `)
            .eq('id', messageId)
            .single();

        if (error || !message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({ message }, { status: 200 });
    } catch (error) {
        console.error('Fetch message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
