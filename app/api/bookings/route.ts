import { NextResponse } from 'next/server';
import { carServices } from '@/lib/supabase/services/carService';
import { userServices } from '@/lib/supabase/services/userService';
import { roomServices } from '@/lib/supabase/services/generalServices';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { carId, userId, bookingDetails } = await req.json();

    // Basic validation
    if (!carId || !userId || !bookingDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find car, user, and associated room
    const car = await carServices.getCarById(carId);
    const user = await userServices.getUserById(userId);

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find room for the car to get admin details
    const room = await roomServices.getRoomById(car.roomid);
    if (!room) {
      return NextResponse.json({ error: 'Room not found for this car' }, { status: 404 });
    }

    // Prevent admin from booking their own car
    if (user.id === room.adminid) {
      return NextResponse.json({ error: 'Admin cannot book their own car' }, { status: 400 });
    }

    // Find admin user to get their email, only if adminid exists
    const adminUser = room.adminid ? await userServices.getUserById(room.adminid) : null;

    // Update car availability to 'Reserved'
    await carServices.updateCar(carId, { availability: 'Reserved' });

    // Create a new booking record in the database
    const booking = await bookingServices.createBooking({
      carid: carId,
      userid: userId,
      roomid: car.roomid, // Include the room ID from the car
      start_date: bookingDetails.startDate || new Date().toISOString(),
      end_date: bookingDetails.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to 1 day from now
      total_price: bookingDetails.bookingAmount || bookingDetails.totalPrice || 0,
      status: 'Pending', // Default to Pending status
    });

    if (!booking) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Send real-time notification to the admin who owns the car (if admin exists)
    let pusher = null;
    try {
      pusher = await import('@/lib/pusher').then(module => module.default);
    } catch (error) {
      console.warn('Pusher not available for real-time notifications:', error);
    }

    if (pusher && adminUser) {
      try {
        await pusher.trigger(`notification-${adminUser.id}`, 'new-booking', {
          type: 'booking',
          message: `New booking for ${car.title}`,
          carId: car.id,
          userId: user.id,
          userName: user.username,
          userPhone: bookingDetails.phone || 'No phone provided',
          notes: bookingDetails.notes || '',
          timestamp: new Date(),
        });
      } catch (pusherError) {
        console.error('Pusher notification error:', pusherError);
        // Don't fail the booking if pusher fails
      }
    }

    // Create a database notification for the admin who owns the car (if admin exists)
    if (adminUser) {
      try {
        const { notificationServices } = await import('@/lib/supabase/services/generalServices');
        await notificationServices.createNotification({
          recipientid: adminUser.id,
          type: 'booking',
          title: 'New Car Booking',
          message: `New booking for ${car.title} by ${user.username}`,
          senderid: user.id,
          related_entity_id: booking.id, // Link to the booking
          read: false,  // Default value
          updated_at: new Date().toISOString(),  // Current timestamp
        });
      } catch (error) {
        console.error('Database notification creation error:', error);
        // Don't fail the booking if database notification creation fails
      }
    }

    // Send email notification to the admin who owns the car (if admin exists)
    // Only send if email credentials are configured and admin user exists
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && adminUser) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminUser.email, // Send to the admin who owns the car
        subject: 'New Car Booking Notification - CarSelling Platform',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">CarSelling Platform</h1>
              <p style="font-size: 18px; color: #555;">New Car Booking Received!</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 16px; margin-bottom: 10px;">Dear ${adminUser.username || 'Admin'},</p>
              <p style="margin-bottom: 10px;">A new car booking has been made for your car on the CarSelling Platform. Please review the details below:</p>
            </div>

            <h2 style="color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">Booking Information</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Car Title:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Brand:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.brand}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Model:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.model}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booked By:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${user.username} (${user.email})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contact Phone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingDetails.phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Additional Notes:</strong></td>
                <td style="padding: 8px 0;">${bookingDetails.notes || 'N/A'}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://auto-dealer-beige.vercel.app/admin" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View All Bookings</a>
            </div>

            <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #777;">
              <p>&copy; ${new Date().getFullYear()} CarSelling Platform. All rights reserved.</p>
              <p>This is an automated notification, please do not reply to this email.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      if (!adminUser) {
        console.warn(`Admin user not found for room ${room.id}. Booking created, but email notification skipped.`);
      } else if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured. Skipping email notification.');
      }
      // In a production environment, you might want to use an alternative notification method
    }

    // Send confirmation email to the user who made the booking
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && user) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const userMailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email, // Send to the user who made the booking
        subject: 'Booking Confirmation - CarSelling Platform',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">CarSelling Platform</h1>
              <p style="font-size: 18px; color: #555;">Booking Confirmation</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 16px; margin-bottom: 10px;">Dear ${user.username || 'User'},</p>
              <p style="margin-bottom: 10px;">Your car booking has been successfully submitted and is currently pending approval. Please review the details below:</p>
            </div>

            <h2 style="color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">Booking Information</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Car Title:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Brand:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.brand}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Model:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${car.model}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Status:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Pending</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Contact Phone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingDetails.phone || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Date:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Additional Notes:</strong></td>
                <td style="padding: 8px 0;">${bookingDetails.notes || 'N/A'}</td>
              </tr>
            </table>

            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc;">The car owner will contact you shortly to confirm the booking. You will receive an email notification once your booking status changes.</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://auto-dealer-beige.vercel.app/bookings" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View My Bookings</a>
            </div>

            <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #777;">
              <p>&copy; ${new Date().getFullYear()} CarSelling Platform. All rights reserved.</p>
              <p>This is an automated notification, please do not reply to this email.</p>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(userMailOptions);
      } catch (emailError) {
        console.error('User confirmation email error:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      message: 'Car booking created successfully and email notifications sent',
      booking
    }, { status: 200 });

  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
