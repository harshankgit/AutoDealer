export interface Message {
    id: string;
    conversation_id: string;
    senderid: string;
    message: string;
    message_type: 'text' | 'car_details';
    car_details?: {
        id: string;
        title: string;
        brand: string;
        model: string;
        year: number;
        price: number;
        images: string[];
        description?: string;
    };
    file_url?: string;
    file_name?: string;
    file_type?: string;
    is_read: boolean;
    timestamp: string;
    created_at: string;
    sender?: {
        username: string;
        role: string;
    };
}

export interface Conversation {
    id: string;
    roomid: string;
    userid: string;
    created_at: string;
    updated_at: string;
    last_message_at: string;
    is_active: boolean;
    unread_count: number;
    room?: {
        name: string;
        adminid: string;
    };
    user?: {
        username: string;
        email: string;
    };
}
