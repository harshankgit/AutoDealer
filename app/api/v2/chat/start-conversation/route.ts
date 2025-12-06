import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';
import { pusherService } from '@/lib/pusherService';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      console.error('No token provided in authorization header');
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decodedToken: any = verifyToken(token);
    if (!decodedToken) {
      console.error('Invalid or expired token provided');
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    // Create a Supabase client with the user's token to enable RLS policies
    // We'll use this for operations that require user authentication
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { carId } = await request.json();
    const userId = decodedToken.userId;

    if (!carId) {
      return NextResponse.json({ error: 'Missing carId' }, { status: 400 });
    }

    // Get car details to get the room and check if user can chat
    // Use the service role client to bypass RLS policies that might prevent access to public cars
    let car: any = null;
    let carError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('cars')
        .select('id, title, brand, model, year, price, images, description, roomid, adminid')
        .eq('id', carId)
        .single();

      car = result.data;
      carError = result.error;
    } else {
      // Fallback: try with user client (may fail if RLS prevents access)
      const result = await userSupabase
        .from('cars')
        .select('id, title, brand, model, year, price, images, description, roomid, adminid')
        .eq('id', carId)
        .single();

      car = result.data;
      carError = result.error;
    }

    if (carError || !car) {
      console.error('Error fetching car:', carError);
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Check if user is trying to chat with their own car
    if (userId === car.adminid) {
      return NextResponse.json({ error: 'Cannot chat with your own car' }, { status: 400 });
    }

    // Get room details using the service role client to bypass RLS issues
    let room: any = null;
    let roomError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('rooms')
        .select('id, name, is_active, adminid')
        .eq('id', car.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    } else {
      // Fallback: try with user client (may fail if RLS prevents access)
      const result = await userSupabase
        .from('rooms')
        .select('id, name, is_active, adminid')
        .eq('id', car.roomid)
        .single();

      room = result.data;
      roomError = result.error;
    }

    if (roomError || !room) {
      console.error('Error fetching room for conversation:', roomError);
      return NextResponse.json({ error: 'Room not found or inaccessible' }, { status: 404 });
    }

    // Check if room is active
    if (!room.is_active) {
      return NextResponse.json({ error: 'This showroom is not active' }, { status: 400 });
    }

    // Check if user is trying to chat in their own room (as admin)
    if (userId === room.adminid) {
      return NextResponse.json({ error: 'Cannot chat in your own showroom' }, { status: 400 });
    }

    // Get or create the conversation
    // First, try to find an existing conversation
    // Use service role client for this query to avoid JWT issues
    let existingConversation: any = null;
    let convError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const result = await serviceRoleSupabase
        .from('chat_conversations')
        .select('*')
        .eq('roomid', car.roomid)
        .eq('userid', userId)
        .single();

      existingConversation = result.data;
      convError = result.error;
    } else {
      // Fallback to user client with RLS (this might cause the JWT error)
      const result = await userSupabase
        .from('chat_conversations')
        .select('*')
        .eq('roomid', car.roomid)
        .eq('userid', userId)
        .single();

      existingConversation = result.data;
      convError = result.error;
    }

    let conversation;

    if (convError) {
      if (convError.code === 'PGRST116') { // PGRST116 means no rows returned (conversation doesn't exist yet)
        // Create new conversation
        try {
          // Use service role client for creating conversation to avoid JWT issues
          const { data: newConversation, error: createError } = process.env.SUPABASE_SERVICE_ROLE_KEY
            ? await (createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
                .from('chat_conversations')
                .insert({
                  roomid: car.roomid,
                  userid: userId,
                })
                .select()
                .single())
            : await userSupabase // Fallback to user client
                .from('chat_conversations')
                .insert({
                  roomid: car.roomid,
                  userid: userId,
                })
                .select()
                .single();

          if (createError) {
            console.error('Error creating conversation:', createError);
            return NextResponse.json({ error: 'Failed to start conversation: ' + createError.message }, { status: 500 });
          }

          conversation = newConversation;
        } catch (insertError: any) {
          // Check if this is a unique violation (conversation already exists) - race condition
          if (insertError.code === '23505') { // Unique violation error code
            // Fetch the conversation that was created by another request using service role client
            const result = process.env.SUPABASE_SERVICE_ROLE_KEY
              ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
                  .from('chat_conversations')
                  .select('*')
                  .eq('roomid', car.roomid)
                  .eq('userid', userId)
                  .single()
              : await userSupabase
                  .from('chat_conversations')
                  .select('*')
                  .eq('roomid', car.roomid)
                  .eq('userid', userId)
                  .single();

            if (result.error) {
              console.error('Error fetching conversation after race condition:', result.error);
              return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
            }

            conversation = result.data;
          } else {
            console.error('Unexpected error creating conversation:', insertError);
            return NextResponse.json({ error: 'Failed to start conversation: ' + insertError.message }, { status: 500 });
          }
        }
      } else {
        // Some other error occurred while trying to find conversation
        console.error('Error finding conversation:', convError);
        return NextResponse.json({ error: 'Error accessing conversation: ' + convError.message }, { status: 500 });
      }
    } else {
      // Conversation already exists
      conversation = existingConversation;
    }

    let newMessage = null;

    // First, explicitly check if car details for this specific car already exist in the conversation
    // Use service role client to avoid JWT issues
    const { data: existingCarMessage, error: searchError } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('message_type', 'car_details')
          .eq('car_reference_id', carId) // Check using the new indexed column
          .maybeSingle() // Use maybeSingle to return null if not found, instead of error
      : await userSupabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('message_type', 'car_details')
          .eq('car_reference_id', carId) // Check using the new indexed column
          .maybeSingle(); // Use maybeSingle to return null if not found, instead of error

    if (searchError) {
      console.error('Error checking for existing car details:', searchError);
      // Continue anyway, don't block the conversation
    }

    // Only send car details if this is the first time mentioning this car in this conversation
    if (!existingCarMessage) {
      const carDetails = {
        id: car.id,
        title: car.title,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        images: car.images,
        description: car.description,
        room_name: room.name
      };

      // Create the car details message with the new car_reference_id for proper uniqueness
      // Use service role client to avoid JWT issues
      const { data: messageData, error: msgError } = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
            .from('chat_messages')
            .insert({
              conversation_id: conversation.id,
              senderid: userId, // User is sending the car details request
              message: `User is interested in ${car.title}`,
              message_type: 'car_details',
              car_details: carDetails,
              car_reference_id: carId // Use the new indexed column for uniqueness
            })
            .select()
            .single()
        : await userSupabase
            .from('chat_messages')
            .insert({
              conversation_id: conversation.id,
              senderid: userId, // User is sending the car details request
              message: `User is interested in ${car.title}`,
              message_type: 'car_details',
              car_details: carDetails,
              car_reference_id: carId // Use the new indexed column for uniqueness
            })
            .select()
            .single();

      if (msgError) {
        console.error('Error creating car details message:', msgError);
        // Check if this is because another request created the message in the meantime
        // We'll do a final check to get any existing car details message
        const { data: finalCheck, error: finalCheckError } = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .eq('message_type', 'car_details')
              .eq('car_reference_id', carId)
              .maybeSingle()
          : await userSupabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversation.id)
              .eq('message_type', 'car_details')
              .eq('car_reference_id', carId)
              .maybeSingle();

        if (!finalCheckError && finalCheck) {
          newMessage = finalCheck;
          console.log('Found existing car details after insertion error for car:', carId);
        }
      } else {
        newMessage = messageData;
        console.log('Created new car details message for car:', carId);
      }
    } else {
      // Car details message already exists
      console.log('Car details message already exists for this car in this conversation');
      newMessage = existingCarMessage;
    }

    // Update last message time in conversation
    // Use service role client to avoid JWT issues
    const { error: updateError } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
          .from('chat_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id)
      : await userSupabase
          .from('chat_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);

    if (updateError) {
      console.error('Error updating conversation last message time:', updateError);
    }

    // Get sender info for real-time notification
    // Use the service role client if available, otherwise use the user client
    let senderInfo: any = null;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data, error: userError } = await serviceRoleSupabase
        .from('users')
        .select('id, username, email, role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching sender info with service role:', userError);
      } else {
        senderInfo = data;
      }
    } else {
      // Fallback to using the user's authenticated client to get user info
      const { data, error: userError } = await userSupabase
        .from('users')
        .select('id, username, email, role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching sender info with user client:', userError);
      } else {
        senderInfo = data;
      }
    }

    // Trigger real-time notification for the admin of the room (only if we sent a new message)
    try {
      // Get the room admin to notify
      let roomAdmin: any = null;
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceRoleSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data, error: adminError } = await serviceRoleSupabase
          .from('users')
          .select('id, username, email, role')
          .eq('id', room.adminid)
          .single();

        if (adminError) {
          console.error('Error fetching room admin with service role:', adminError);
        } else {
          roomAdmin = data;
        }
      } else {
        // Fallback to using the user's authenticated client to get admin info
        const { data, error: adminError } = await userSupabase
          .from('users')
          .select('id, username, email, role')
          .eq('id', room.adminid)
          .single();

        if (adminError) {
          console.error('Error fetching room admin with user client:', adminError);
        } else {
          roomAdmin = data;
        }
      }

      if (roomAdmin && newMessage) {
        console.log('Sending new message via Pusher from start-conversation:', {
          message: newMessage,
          sender: senderInfo,
          conversationId: conversation.id,
          timestamp: new Date().toISOString(),
        }); // Debug log

        // Trigger notification for the admin
        await pusherService.sendNewMessage(conversation.id, {
          message: newMessage,
          sender: senderInfo,
          conversationId: conversation.id,
          timestamp: new Date().toISOString(),
        });

        // Update unread count for the admin
        await pusherService.sendUnreadCountUpdate(room.adminid, {
          count: 1
        });

        // Send notification to admin about new user interest
        await pusherService.sendNotification(room.adminid, {
          type: 'user_interest',
          message: `New interest in ${car.title} from ${senderInfo?.username || 'a user'}`,
          senderId: userId,
          senderName: senderInfo?.username || 'Unknown User',
          carTitle: car.title,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (notificationError) {
      console.error('Real-time notification error:', notificationError);
      // Don't fail the whole operation if real-time notification fails
    }

    return NextResponse.json({
      message: 'Conversation started successfully',
      conversationId: conversation.id,
      newMessage: newMessage || null
    }, { status: 201 });
  } catch (error) {
    console.error('Start conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}