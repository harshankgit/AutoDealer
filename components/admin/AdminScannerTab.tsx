'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/context/user-context';
import { Camera, Download, Upload, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminScannerTabProps {
  user: User | null;
  scannerImage: File | null;
  previewScannerImage: string | null;
  handleScannerImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleScannerImageUpload: () => void;
}

interface Admin {
  id: string;
  username: string;
  email: string;
  room_name?: string;
}

interface ScannerImage {
  id: string;
  admin_id: string;
  room_id: string;
  image_url: string;
  uploaded_at: string;
  admin: {
    username: string;
    email: string;
  };
  room: {
    name: string;
  };
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
  const [allScanners, setAllScanners] = useState<ScannerImage[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all scanners and admins for superadmin
  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchAllScanners();
      fetchAllAdmins();
    }
  }, [user]);

  const fetchAllScanners = async () => {
    if (!user || user.role !== 'superadmin') return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/admin/scanners', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllScanners(data.scanners || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to fetch scanners');
      }
    } catch (error) {
      console.error('Error fetching scanners:', error);
      toast.error('Failed to fetch scanners');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAdmins = async () => {
    if (!user || user.role !== 'superadmin') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllAdmins(data.admins || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    }
  };

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

  // Filter scanners based on selected admin, room, and search term
  const filteredScanners = allScanners.filter(scanner => {
    const matchesAdmin = !selectedAdmin || scanner.admin_id === selectedAdmin;
    const matchesRoom = !selectedRoom || scanner.room_id === selectedRoom;
    const matchesSearch = !searchTerm ||
      scanner.admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scanner.room.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesAdmin && matchesRoom && matchesSearch;
  });

  return (
    <Card className="bg-white dark:bg-gray-800">
      {user?.role === 'superadmin' ? (
        <>
          <CardHeader>
            <CardTitle className="dark:text-white">All Admin Scanner Images</CardTitle>
            <CardDescription className="dark:text-gray-300">
              View all scanner images uploaded by admins, organized by admin and room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Filter by Admin</Label>
                <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Admins" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAdmins.map(admin => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.username} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Filter by Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(allScanners.map(scanner => scanner.room.name))).map(roomName => (
                      <SelectItem key={roomName} value={roomName}>
                        {roomName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by admin or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAdmin('');
                    setSelectedRoom('');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Scanners Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredScanners.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScanners.map(scanner => (
                  <div key={scanner.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium dark:text-white">{scanner.admin.username}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{scanner.room.name}</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(scanner.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2 border rounded p-2 flex justify-center">
                      {scanner.image_url ? (
                        <img
                          src={scanner.image_url}
                          alt={`Scanner for ${scanner.admin.username}`}
                          className="max-w-full h-auto rounded max-h-40 object-contain"
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <p>No image available</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create a download link for the scanner image
                          const link = document.createElement('a');
                          link.href = scanner.image_url;
                          link.download = `scanner-${scanner.admin.username}-${scanner.room.name}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No scanner images found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </>
      ) : (
        <>
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
        </>
      )}
    </Card>
  );
}