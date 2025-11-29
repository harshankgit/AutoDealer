import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Using Gmail as example, change as needed
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email template for the admin
    const adminEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Contact Form Submission</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">You have received a new message from your website contact form.</h2>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message Details:</h3>
            <p><strong style="color: #374151;">Name:</strong> ${name}</p>
            <p><strong style="color: #374151;">Email:</strong> ${email}</p>
            <p><strong style="color: #374151;">Subject:</strong> ${subject}</p>
            <p><strong style="color: #374151;">Message:</strong></p>
            <div style="background: white; padding: 10px; border-left: 3px solid #3b82f6; margin: 10px 0;">
              <p style="white-space: pre-line;">${message}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-weight: 500;">This is an automated message from your CarSelling website.</p>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CarSelling. All rights reserved.</p>
        </div>
      </div>
    `;

    // Email template for the user (confirmation)
    const userConfirmationContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Message Received</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Thank You for Contacting Us!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Dear ${name},
          </p>
          
          <p style="color: #4b5563; line-height: 1.6;">
            We have received your message and we appreciate you reaching out to us. Here's a summary of your message:
          </p>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Your Message:</h3>
            <p><strong style="color: #374151;">Subject:</strong> ${subject}</p>
            <p><strong style="color: #374151;">Message:</strong></p>
            <div style="background: white; padding: 10px; border-left: 3px solid #3b82f6; margin: 10px 0;">
              <p style="white-space: pre-line;">${message}</p>
            </div>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Our team will review your message and get back to you as soon as possible. We typically respond within 24 hours.
          </p>
          
          <p style="color: #4b5563; line-height: 1.6;">
            If you have any urgent inquiries, please don't hesitate to call us at 8965992025.
          </p>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0; color: #1d4ed8; font-weight: 500;">Contact Information:</p>
            <p style="margin: 5px 0 0 0; color: #374151;">Email: carsellingdealerhelp@gmail.com</p>
            <p style="margin: 5px 0 0 0; color: #374151;">Phone: 8965992025</p>
            <p style="margin: 5px 0 0 0; color: #374151;">Address: Mata Chowk, Khandwa, Madhya Pradesh</p>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} CarSelling. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email to admin
    const adminMailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to the same email for notifications
      subject: `New Contact Form Submission: ${subject}`,
      html: adminEmailContent,
    };

    await transporter.sendMail(adminMailOptions);

    // Send confirmation email to the user
    const userMailOptions = {
      from: `"CarSelling" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Contacting Us!',
      html: userConfirmationContent,
    };

    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}