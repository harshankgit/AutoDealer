// Helper function to create or get conversation and send car details
export async function startChatWithDealer(carId: string, roomId: string, userId: string) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated');
        }

        // First, create or get the conversation
        const convResponse = await fetch('/api/v2/chat/start-conversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                roomId,
                userId,
            }),
        });

        if (!convResponse.ok) {
            throw new Error('Failed to create conversation');
        }

        const convData = await convResponse.json();
        const conversationId = convData.conversation.id;

        // Send car details as first message
        const messageResponse = await fetch('/api/v2/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                conversationId,
                message: 'Hi, I am interested in this car.',
                message_type: 'car_details',
                carId,
            }),
        });

        if (!messageResponse.ok) {
            throw new Error('Failed to send car details');
        }

        return conversationId;
    } catch (error) {
        console.error('Error starting chat:', error);
        throw error;
    }
}
