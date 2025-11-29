import { getSupabaseServiceRole } from '../server';
import { generateToken } from '@/lib/auth';
import { userServices } from './userService';
import nodemailer from 'nodemailer';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface OTP {
  id: string;
  email: string;
  otp_code: string;
  expires_at: string;
  used: boolean;
  attempts: number;
  created_at: string;
}

export const otpServices = {
  // Send OTP to user's email
  async sendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Sending OTP to email:', email);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Generate a new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // First, remove any existing unused OTPs for this email
      const { error: deleteError } = await getSupabaseServiceRole()
        .from('otps')
        .delete()
        .eq('email', email);

      if (deleteError) {
        console.error('Error deleting existing OTPs:', deleteError);
        return { success: false, message: `Database error during cleanup: ${deleteError.message}` };
      }

      // Create new OTP entry
      const { data, error } = await getSupabaseServiceRole()
        .from('otps')
        .insert({
          email,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
          used: false,
          attempts: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating OTP in database:', error);
        return { success: false, message: `Database error: ${error.message}` };
      }

      // Configure email transporter
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email credentials not configured');
        return { success: false, message: 'Email service not configured' };
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
        console.log('Email transporter verified successfully');
      } catch (connectionError) {
        console.error('Email transporter connection failed:', connectionError);
        return { success: false, message: 'Email service connection failed. Please contact administrators.' };
      }

      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code - CarSelling Platform',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #007bff;">CarSelling Platform</h1>
              <p style="font-size: 18px; color: #555;">Email Verification</p>
            </div>

            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #007bff;">Your OTP Code</h2>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0;">
                ${otpCode}
              </div>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="font-size: 16px; margin-bottom: 10px;">Dear User,</p>
              <p style="margin-bottom: 10px;">Your OTP (One-Time Password) for email verification is: <strong>${otpCode}</strong></p>
              <p>This OTP is valid for the next 10 minutes only. Please use it to complete your registration.</p>
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} CarSelling Platform. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully, Message ID:', info.messageId);

      return { success: true, message: 'OTP sent successfully to your email' };
    } catch (error: any) {
      console.error('Error in sendOTP service:', {
        message: error?.message,
        stack: error?.stack,
        email
      });
      return { success: false, message: 'Failed to send OTP. Please try again.' };
    }
  },

  // Verify OTP and complete registration
  async verifyOTP(email: string, otpCode: string, userData: { username: string; password: string; role: string }): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      console.log('Verifying OTP for email:', email);

      // Check if OTP exists, is valid, and hasn't been used
      const { data: otpRecord, error } = await getSupabaseServiceRole()
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otpCode)
        .gte('expires_at', new Date().toISOString()) // Not expired
        .eq('used', false) // Not used
        .single();

      if (error || !otpRecord) {
        if (error?.code === 'PGRST116') { // No rows returned
          // Record the failed attempt
          await getSupabaseServiceRole()
            .from('otps')
            .update({ attempts: 1 })
            .eq('email', email)
            .is('used', false); // Only update unused records

          return { success: false, message: 'Invalid or expired OTP' };
        }
        console.error('Error checking OTP in database:', error);
        return { success: false, message: 'Failed to verify OTP. Please try again.' };
      }

      // Check if user already exists
      const existingUser = await userServices.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Create the user
      const user = await userServices.createUser({
        username: userData.username,
        email,
        password: userData.password,
        role: userData.role || 'user',
        favorites: [],
      });

      if (!user) {
        return { success: false, message: 'Failed to create user. Please try again.' };
      }

      // Mark the OTP as used in the database
      const { error: updateError } = await getSupabaseServiceRole()
        .from('otps')
        .update({ used: true })
        .eq('id', otpRecord.id);

      if (updateError) {
        console.error('Error updating OTP status:', updateError);
        // Don't return error here as user is already created
      }

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      return {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      };
    } catch (error: any) {
      console.error('Error in verifyOTP service:', {
        message: error?.message,
        stack: error?.stack,
        email
      });
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  },

  // Resend OTP for an email (if needed)
  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Resending OTP for email:', email);

      // Check if there's a valid OTP that hasn't expired and hasn't been used
      const { data: existingOTP, error } = await getSupabaseServiceRole()
        .from('otps')
        .select('*')
        .eq('email', email)
        .gt('expires_at', new Date().toISOString())
        .eq('used', false)
        .single();

      // If there's a valid OTP that hasn't expired yet, check cooldown
      if (!error && existingOTP) {
        const lastSent = new Date(existingOTP.created_at);
        const now = new Date();
        const timeDiff = (now.getTime() - lastSent.getTime()) / 1000; // in seconds

        if (timeDiff < 60) { // 60 seconds cooldown
          const remainingTime = Math.ceil(60 - timeDiff);
          return {
            success: false,
            message: `Please wait ${remainingTime} seconds before requesting another OTP`
          };
        }

        // If the cooldown has passed, delete the old OTP
        await getSupabaseServiceRole()
          .from('otps')
          .delete()
          .eq('id', existingOTP.id);
      }

      return await this.sendOTP(email);
    } catch (error: any) {
      console.error('Error in resendOTP service:', {
        message: error?.message,
        stack: error?.stack,
        email
      });
      return { success: false, message: 'Failed to resend OTP. Please try again.' };
    }
  }
};