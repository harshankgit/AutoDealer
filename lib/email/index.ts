import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<void> {
  // Configure email transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify the transporter connection
  try {
    await transporter.verify();
    console.log('Email transporter verified successfully for password reset');
  } catch (connectionError) {
    console.error('Email transporter connection failed:', connectionError);
    throw new Error('Email service connection failed');
  }

  // Create the reset URL - prioritize production URL, fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                 process.env.VERCEL_URL ||
                 'http://localhost:3000';

  // Ensure the URL has the proper protocol
  const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;

  const resetUrl = `${normalizedBaseUrl}/reset-password?token=${resetToken}`;

  // Send password reset email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - CarSelling Platform',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #007bff;">CarSelling Platform</h1>
          <p style="font-size: 18px; color: #555;">Password Reset</p>
        </div>

        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="font-size: 16px; margin-bottom: 10px;">Hello ${username},</p>
          <p style="margin-bottom: 15px;">We received a request to reset your password for your CarSelling account.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p style="margin-bottom: 10px;">If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
          <p style="margin-bottom: 10px;">This link will expire in 1 hour for security reasons.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} CarSelling Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Password reset email sent successfully, Message ID:', info.messageId);
}