'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useUser } from '@/context/user-context';

export default function RegisterPage() {
  // Step 1: Registration form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Step 2: OTP verification data
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { login } = useUser();

  // Handle registration form submission (send OTP)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setIsOtpSent(true);
        setError('');

        // Start countdown for resending OTP
        setCountdown(60); // 60 seconds cooldown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login user and redirect
        const userWithToken = { ...data.user, token: data.token };
        login(userWithToken);
        setOtpVerified(true);

        // Redirect based on role
        if (userWithToken.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/rooms');
        }
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setCountdown(60); // Reset countdown

        // Restart the countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isOtpSent ? 'Verify Your Email' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            {isOtpSent
              ? 'Enter the OTP sent to your email'
              : 'Join AutoDealer to start buying or selling cars'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {successMessage && !otpVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-4">
              {successMessage}
            </div>
          )}

          {otpVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Registration successful! Redirecting...
            </div>
          )}

          {!isOtpSent ? (
            // Step 1: Registration form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="dark:text-gray-200">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} disabled={isLoading}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Buyer - Browse and buy cars</SelectItem>
                    <SelectItem value="admin">Dealer - Sell cars and manage showroom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-200">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          ) : (
            // Step 2: OTP verification form
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="dark:text-gray-200">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only allow digits, max 6
                  required
                  maxLength={6}
                  className="h-11 text-center text-2xl tracking-widest"
                  disabled={isLoading || otpVerified}
                />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent an OTP to <span className="font-medium">{formData.email}</span>
              </p>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium"
                  disabled={isLoading || otpVerified}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  className="h-11"
                  disabled={isLoading || countdown > 0 || otpVerified}
                >
                  Resend {countdown > 0 ? `(${countdown}s)` : ''}
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || countdown > 0 || otpVerified}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          )}

          {!isOtpSent && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}