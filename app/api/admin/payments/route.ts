import { NextResponse } from 'next/server';
import { paymentServices } from '@/lib/supabase/services/paymentService';
import { bookingServices } from '@/lib/supabase/services/bookingService';
import { userServices } from '@/lib/supabase/services/userService';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token || '');

    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { paymentId, status, adminNotes, adminScannerImage, expectedDeliveryDate } = await req.json();

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await paymentServices.getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If it's a regular admin, ensure they have rights to modify this payment
    if (decoded.role === 'admin') {
      // Check if the payment is related to a booking for a car in their room
      const booking = await bookingServices.getBookingById(payment.booking_id);
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found for this payment' },
          { status: 404 }
        );
      }

      // Check if admin owns the room for this car
      const { supabase } = await import('@/lib/supabase/client');
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('roomid, id')
        .eq('id', booking.carid)
        .single();

      if (carError || !carData?.roomid) {
        return NextResponse.json(
          { error: 'Car not found for this booking' },
          { status: 404 }
        );
      } else {
        // Check if admin owns the room for this car
        const { roomServices } = await import('@/lib/supabase/services/generalServices');
        const roomData = await roomServices
          .getRoomById(carData.roomid);

        if (!roomData || roomData.adminid !== decoded.userId) {
          return NextResponse.json(
            { error: 'Unauthorized - Payment does not belong to your room' },
            { status: 403 }
          );
        }
      }
    }

    // Update the payment status and other details
    const updatedPayment = await paymentServices.updatePayment(paymentId, {
      payment_status: status,
      admin_notes: adminNotes || payment.admin_notes,
      admin_scanner_image: adminScannerImage || payment.admin_scanner_image,
      approved_by: status === 'approved' ? decoded.userId : payment.approved_by,
      approved_at: status === 'approved' ? new Date().toISOString() : payment.approved_at,
      expected_delivery_date: expectedDeliveryDate || payment.expected_delivery_date
    });

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // If the payment is approved, update the booking status to 'Confirmed'
    if (status === 'approved') {
      const booking = await bookingServices.getBookingById(payment.booking_id);
      if (booking) {
        await bookingServices.updateBooking(booking.id, { status: 'Confirmed' });
      }
    }

    // Send email notification to the user whose payment was updated
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Get user details for email
      const user = await userServices.getUserById(payment.user_id);
      
      // Get admin details for email
      const adminUser = await userServices.getUserById(decoded.userId);
      
      // Get car details for email
      const booking = await bookingServices.getBookingById(payment.booking_id);
      let carDetails = null;
      if (booking) {
        const { supabase } = await import('@/lib/supabase/client');
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('title, brand, model')
          .eq('id', booking.carid)
          .single();
          
        if (!carError) {
          carDetails = carData;
        }
      }

      if (user) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Payment ${status.charAt(0).toUpperCase() + status.slice(1)} - CarSelling Platform`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #007bff;">CarSelling Platform</h1>
                <p style="font-size: 18px; color: ${status === 'approved' ? '#28a745' : status === 'rejected' ? '#dc3545' : '#ffc107'};">
                  Payment ${status.charAt(0).toUpperCase() + status.slice(1)}
                </p>
              </div>

              <div style="background-color: ${status === 'approved' ? '#d4edda' : status === 'rejected' ? '#f8d7da' : '#fff3cd'}; 
                   padding: 15px; border-radius: 5px; margin-bottom: 20px; 
                   border: 1px solid ${status === 'approved' ? '#c3e6cb' : status === 'rejected' ? '#f5c6cb' : '#ffeaa7'};">
                <p style="font-size: 16px; margin-bottom: 10px;">Dear ${user.username || 'User'},</p>
                <p style="margin-bottom: 10px;">
                  Your payment has been <strong>${status}</strong> by ${adminUser?.username || 'the admin'}.
                  ${status === 'approved' ? 'Congratulations! The car booking has been confirmed.' : 
                    status === 'rejected' ? 'Unfortunately, your payment has been rejected. Please contact support for more information.' :
                    'The payment status has been updated.'}
                </p>
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
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">₹${payment.amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
                      status === 'approved' ? '#d4edda; color: #155724' : 
                      status === 'rejected' ? '#f8d7da; color: #721c24' : 
                      status === 'completed' ? '#cce7ff; color: #004085' : 
                      '#fff3cd; color: #856404'
                    }; font-weight: bold;">
                      ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Updated By:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${adminUser?.username || 'Admin'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Updated At:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                </tr>
                ${expectedDeliveryDate ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Expected Delivery Date:</strong></td>
                  <td style="padding: 8px 0;">${new Date(expectedDeliveryDate).toLocaleDateString()}</td>
                </tr>
                ` : ''}
              </table>
              ${adminNotes ? `
              <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h3 style="color: #495057; margin-bottom: 10px;">Admin Notes:</h3>
                <p style="margin: 0;">${adminNotes}</p>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://car-selling-rho.vercel.app/profile" style="background-color: #007bff; color: #ffffff; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold;">View Profile</a>
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

    return NextResponse.json({
      message: 'Payment status updated successfully',
      payment: updatedPayment
    }, { status: 200 });
  } catch (error: any) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}