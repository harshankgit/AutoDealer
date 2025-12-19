import { NextResponse } from 'next/server';
import { paymentServices } from '@/lib/supabase/services/paymentService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      bookingId, 
      amount, 
      paymentReceiptImage, 
      paymentMethod, 
      paymentDetails,
      expectedDeliveryDate 
    } = await req.json();

    // Validate required fields
    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'Booking ID and amount are required' }, { status: 400 });
    }

    // Check if the booking belongs to the user
    const booking = await bookingServices.getBookingById(bookingId);
    if (!booking || booking.userid !== decoded.userId) {
      return NextResponse.json({ error: 'Booking not found or does not belong to user' }, { status: 404 });
    }

    // Create a new payment record
    const payment = await paymentServices.createPayment({
      booking_id: bookingId,
      user_id: decoded.userId,
      amount,
      payment_receipt_image: paymentReceiptImage || null,
      payment_method: paymentMethod || null,
      payment_details: paymentDetails || null,
      admin_notes: null,
      admin_scanner_image: null,
      expected_delivery_date: expectedDeliveryDate || null
    });

    if (!payment) {
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    // Fetch booking details to get car info for notification
    const fullBooking = await bookingServices.getBookingById(bookingId);
    
    // Get admin of the car's room to notify them about the payment
    if (fullBooking && fullBooking.carid) {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('roomid')
        .eq('id', fullBooking.carid)
        .single();
      
      if (!carError && carData?.roomid) {
        // Get admin details
        const { roomServices } = await import('@/lib/supabase/services/generalServices');
        const roomData = await roomServices
          .getRoomById(carData.roomid);

        if (roomData && roomData?.adminid) {
          const adminUser = await userServices.getUserById(roomData.adminid);
          
          if (adminUser && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            // Send email notification to admin
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            // Get car details for email
            const { supabase } = await import('@/lib/supabase/client');
            const { data: carDetails, error: carDetailsError } = await supabase
              .from('cars')
              .select('title, brand, model')
              .eq('id', fullBooking.carid)
              .single();
              
            // Get user details for email
            const user = await userServices.getUserById(decoded.userId);
            
            if (user) {
              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminUser.email,
                subject: 'New Payment Received - CarSelling Platform',
                html: `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <h1 style="color: #007bff;">CarSelling Platform</h1>
                      <p style="font-size: 18px; color: #555;">New Payment Received!</p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                      <p style="font-size: 16px; margin-bottom: 10px;">Dear ${adminUser.username || 'Admin'},</p>
                      <p style="margin-bottom: 10px;">A new payment has been submitted for your car. Please review the details below:</p>
                    </div>

                    <h2 style="color: #007bff; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">Payment Information</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Car Title:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${carDetails?.title || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Car Brand/Model:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${carDetails?.brand || ''} ${carDetails?.model || ''}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">₹${amount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentMethod || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Paid By:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${user.username} (${user.email})</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Date:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;"><strong>Expected Delivery Date:</strong></td>
                        <td style="padding: 8px 0;">${expectedDeliveryDate ? new Date(expectedDeliveryDate).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin-top: 30px;">
                      <a href="https://auto-dealer-beige.vercel.app/admin" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View Payments</a>
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
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Payment created successfully and notification sent',
      payment
    }, { status: 200 });

  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For regular users: get their own payments
    if (decoded.role === 'user') {
      const payments = await paymentServices.getPaymentsByUser(decoded.userId, token);
      return NextResponse.json({ payments }, { status: 200 });
    }
    
    // For superadmins: get all payments
    if (decoded.role === 'superadmin') {
      const payments = await paymentServices.getAllPayments();
      return NextResponse.json({ payments }, { status: 200 });
    }
    
    // For admins: get payments for their bookings
    if (decoded.role === 'admin') {
      const payments = await paymentServices.getPaymentsByAdmin(decoded.userId);
      return NextResponse.json({ payments }, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });

  } catch (error: any) {
    console.error('Get payments API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}