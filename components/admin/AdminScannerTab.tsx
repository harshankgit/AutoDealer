'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/context/user-context';
import { Camera, Download, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AdminScannerTabProps {
  user: User | null;
  scannerImage: File | null;
  previewScannerImage: string | null;
  handleScannerImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleScannerImageUpload: () => void;
}

export default function AdminScannerTab({
  user,
  scannerImage,
  previewScannerImage,
  handleScannerImageChange,
  handleScannerImageUpload
}: AdminScannerTabProps) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showScannerConfirmModal, setShowScannerConfirmModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const sendOtp = async () => {
    try {
      setIsSendingOtp(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/admin/verify-scanner-otp/send-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      // Set up for OTP verification
      setOtpVerified(false);
      setOtp('');
      setShowScannerConfirmModal(false); // Close confirmation modal before showing verification modal
      setShowOtpModal(true);
      toast.success('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/admin/verify-scanner-otp/verify-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid OTP');
      }

      const result = await response.json();
      if (result.verified) {
        setOtpVerified(true);
        toast.success('OTP verified successfully!');

        // Wait a bit before closing the modal to show success
        setTimeout(() => {
          setShowOtpModal(false);
          // Now proceed with the actual upload
          handleScannerImageUpload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadWithOtp = () => {
    if (scannerImage) {
      setShowScannerConfirmModal(true);
    } else {
      toast.error('Please select a scanner image to upload');
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Admin Scanner Images</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Upload and manage scanner images for your account (requires OTP verification)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="scanner-image">Upload Scanner Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="scanner-image"
                type="file"
                accept="image/*"
                onChange={handleScannerImageChange}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => document.getElementById('scanner-image')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>

            {scannerImage && (
              <div className="space-y-2">
                <Label>Preview:</Label>
                <div className="border rounded-lg p-2 flex justify-center">
                  <img
                    src={previewScannerImage || ''}
                    alt="Scanner preview"
                    className="h-32 w-auto object-contain rounded"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleUploadWithOtp}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Scanner (Verify OTP)
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Current Scanner Image</Label>
            {previewScannerImage ? (
              <div className="space-y-2">
                <div className="border rounded-lg p-2 flex justify-center">
                  <img
                    src={previewScannerImage}
                    alt="Current scanner"
                    className="max-w-full h-auto rounded"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a download link for the scanner image
                    const link = document.createElement('a');
                    link.href = previewScannerImage;
                    link.download = `admin-scanner-${user?.id}.jpg`;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Current
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>No scanner image uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Scanner Upload Confirmation Modal */}
      <Dialog open={showScannerConfirmModal} onOpenChange={setShowScannerConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Scanner Image</DialogTitle>
            <DialogDescription>
              Do you want to upload a scanner image? This will require OTP verification for security.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-16 w-16 text-gray-400" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              After confirming, we'll send an OTP to your email for verification.
            </p>
          </div>

          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowScannerConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                sendOtp();
                // setShowScannerConfirmModal is now handled in sendOtp function after success
              }}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to your email to verify your identity before uploading scanner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Please check your email for the OTP. Didn't receive it? Check spam folder or request again.</p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowOtpModal(false);
                setOtp('');
                setOtpVerified(false);
              }}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyOtp}
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={sendOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}