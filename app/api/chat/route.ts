import { NextResponse } from 'next/server';
import { chatServices } from '@/lib/supabase/services/generalServices';
import { userServices } from '@/lib/supabase/services/userService';
import { carServices } from '@/lib/supabase/services/carService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import nodemailer from 'nodemailer';
import pusher from '@/lib/pusher';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carId, receiverId, message, fileId, fileName, fileType } = await request.json();
    const senderId = decodedToken.userId;
    const senderType = decodedToken.role; // 'user', 'admin', or 'superadmin'

    if (!carId || !receiverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Either message or file must be provided
    if (!message && !fileId) {
      return NextResponse.json({ error: 'Either message or file is required' }, { status: 400 });
    }

    // Determine if sender is the user or admin to assign userId and adminid correctly
    const car = await carServices.getCarById(carId);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const room = await roomServices.getRoomById(car.roomid);
    if (!room) {
      return NextResponse.json({ error: 'Room not found for this car' }, { status: 404 });
    }

    // In Supabase, we'll create a chat message directly rather than using nested messages in a chat object
    // Each message will be stored as a separate record with roomid to group conversations

    // Determine the room for this conversation based on car and participants
    // We can use the car's roomid as the basis for the chat room
    const roomId = car.roomid;

    // Ensure that the sender is either the car's admin, a user interested in the car, or a superadmin
    if (senderType !== 'superadmin') {
      // The sender must be either the admin of the room that owns the car or a regular user
      const isSenderAdmin = senderId === room.adminid;

      // Allow self-messaging for admin/superadmin for internal notes
      if (senderId === receiverId && senderType === 'user') {
        return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
      }

      // Prevent admin from messaging themselves about their own car (not allowed for chat)
      if (senderId === receiverId && senderType === 'admin') {
        return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
      }

      // For new messages, validate that sender and receiver are appropriate for a car-related chat
      const isSenderTheRoomAdmin = senderId === room.adminid;
      const isReceiverTheRoomAdmin = receiverId === room.adminid;
      const isSuperAdmin = senderType === 'superadmin';

      // Case 1: Admin (car owner) messaging a user about their car
      const isAdminMessagingUser = isSenderTheRoomAdmin && !isReceiverTheRoomAdmin;
      // Case 2: User messaging the admin about a car
      const isUserMessagingAdmin = !isSenderTheRoomAdmin && isReceiverTheRoomAdmin;
      // Case 3: Superadmin messaging any user
      const isSuperAdminMessaging = isSuperAdmin;

      if (!(isAdminMessagingUser || isUserMessagingAdmin || isSuperAdminMessaging)) {
        return NextResponse.json({ error: 'Invalid chat participants: Only admin and users can chat about cars' }, { status: 403 });
      }

      // Prevent admin from starting a chat with themselves about their own car
      if (isAdminMessagingUser && senderId === receiverId) {
        return NextResponse.json({ error: 'Admin cannot start chat with themselves' }, { status: 400 });
      }
    }

    // Create a new chat message in Supabase
    const newMessage = await chatServices.createChat({
      roomid: roomId,
      senderid: senderId,
      message: message || '',
      timestamp: new Date().toISOString(),
    });

    if (!newMessage) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Send email notification to the receiver
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const receiverUser = await userServices.getUserById(receiverId);
        const senderUser = await userServices.getUserById(senderId);
        const carDetails = await carServices.getCarById(carId);

        if (receiverUser && senderUser && carDetails && receiverUser.email) {
          // Ensure all required data is available before creating email
          const receiverUsername = receiverUser.username || 'User';
          const senderUsername = senderUser.username || 'Someone';
          const senderEmail = senderUser.email || 'email@example.com';
          const carTitle = carDetails.title || 'Unknown Car';

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: `"${senderUsername}" <${process.env.EMAIL_USER}>`, // Show sender's name but use system email
            to: receiverUser.email,
            replyTo: senderUser.email, // Allow reply to sender's email
            subject: `New Message About ${carTitle} - CarSelling Platform`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #007bff;">CarSelling Platform</h1>
                  <p style="font-size: 18px; color: #555;">New Message Received!</p>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="font-size: 16px; margin-bottom: 10px;">Dear ${receiverUsername},</p>
                  <p style="margin-bottom: 10px;">You have received a new message about the car: <strong>${carTitle}</strong> from <strong>${senderUsername}</strong>.</p>
                </div>

                <h2 style="color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">Message Details</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Car Title:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${carTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>From:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${senderUsername} (${senderEmail})</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Message:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${message || 'File sent'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sent At:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://car-selling-rho.vercel.app/chat/${carId}" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View Message</a>
                </div>

                <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #777;">
                  <p>&copy; ${new Date().getFullYear()} CarSelling Platform. All rights reserved.</p>
                  <p>This is an automated notification, please do not reply to this email.</p>
                </div>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the whole operation if email sending fails
      }
    } else {
      console.warn('Email credentials not configured. Skipping email notification.');
    }

    // Trigger real-time notification for the receiver
    try {
      const receiverUser = await userServices.getUserById(receiverId);
      const senderUser = await userServices.getUserById(senderId);
      const carDetails = await carServices.getCarById(carId);

      if (receiverUser) {
        // Send real-time notification to the receiver
        await pusher.trigger(`notification-${receiverId}`, 'new-chat-message', {
          type: 'chat',
          message: message || 'File shared',
          senderId,
          senderName: senderUser?.username || 'Unknown User',
          carId,
          carTitle: carDetails?.title || 'Unknown Car',
          timestamp: new Date(),
        });

        // Also update the unread count for the receiver
        await pusher.trigger(`notification-${receiverId}`, 'notification-unread-count', {
          count: 1, // In a real implementation, this would be the actual unread count
        });
      }
    } catch (notificationError) {
      console.error('Real-time notification error:', notificationError);
      // Don't fail the whole operation if real-time notification fails
    }

    return NextResponse.json({ message: 'Message sent', chat: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json({ error: 'Missing carId' }, { status: 400 });
    }

    // In Supabase, we need to get all chat messages for a specific car/room
    // We'll get the room for the car and then fetch all messages in that room
    const car = await carServices.getCarById(carId);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Get all messages for the room using our chat service
    const chatMessages = await chatServices.getChatsByRoom(car.roomid);

    // Group messages by conversation context
    const chat = {
      id: car.roomid,
      carid: carId,
      messages: chatMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        senderid: msg.senderid,
        timestamp: msg.timestamp,
        // In this context, we might need to determine sender role differently
      }))
    };

    if (!chat || chat.messages.length === 0) {
      return NextResponse.json({ chat: null }, { status: 200 });
    }

    return NextResponse.json({ chat }, { status: 200 });
  } catch (error) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
