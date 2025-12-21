'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Camera,
  Upload,
  Search,
  Eye,
  Check,
  X,
  Calendar,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_receipt_image: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  admin_scanner_image: string | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    email: string;
  };
  car: {
    title: string;
    brand: string;
    model: string;
  };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showScannerUploadModal, setShowScannerUploadModal] = useState(false);
  const [showScannerConfirmModal, setShowScannerConfirmModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [scannerImage, setScannerImage] = useState<File | null>(null);
  const [previewScannerImage, setPreviewScannerImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpAction, setOtpAction] = useState<'upload_general' | 'upload_payment' | 'upload_user' | null>(null);
  const [uploadUserId, setUploadUserId] = useState<string | null>(null); // For user-specific uploads

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }

    fetchPayments();
  }, [user, router]);

  useEffect(() => {
    if (payments.length > 0) {
      setStats({
        total: payments.length,
        pending: payments.filter(p => p.payment_status === 'pending').length,
        approved: payments.filter(p => p.payment_status === 'approved').length,
        rejected: payments.filter(p => p.payment_status === 'rejected').length
      });
    }
  }, [payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare form data for scanner image upload
      const formData = new FormData();
      if (scannerImage) {
        formData.append('scannerImage', scannerImage);
      }
      formData.append('paymentId', selectedPayment.id);

      // Upload scanner image if provided
      if (scannerImage) {
        const uploadResponse = await fetch('/api/admin/payments/scanner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload scanner image');
        }
      }

      // Approve the payment
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status: 'approved',
          adminNotes,
          expectedDeliveryDate,
          adminScannerImage: scannerImage ? `uploaded_scanner_${Date.now()}` : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve payment');
      }

      const result = await response.json();
      toast.success('Payment approved successfully');

      // Update the payment in local state
      setPayments(prev => prev.map(p =>
        p.id === selectedPayment.id ? result.payment : p
      ));

      setShowApproveModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
      setExpectedDeliveryDate('');
      setScannerImage(null);
      setPreviewScannerImage(null);
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status: 'rejected',
          adminNotes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject payment');
      }

      const result = await response.json();
      toast.success('Payment rejected successfully');

      // Update the payment in local state
      setPayments(prev => prev.map(p =>
        p.id === selectedPayment.id ? result.payment : p
      ));

      setShowRejectModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewScannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendOtp = async (action: 'upload_general' | 'upload_payment' | 'upload_user', userId?: string) => {
    try {
      setIsSendingOtp(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
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

      // Set the action that will be performed after OTP verification
      setOtpAction(action);
      if (userId) {
        setUploadUserId(userId);
      }
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
        router.push('/login');
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

        // Perform the original action based on otpAction
        if (otpAction === 'upload_general' || otpAction === 'upload_payment' || otpAction === 'upload_user') {
          // Close OTP modal and open scanner upload modal
          setShowScannerUploadModal(true);
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleScannerUploadAfterVerification = async () => {
    if (!scannerImage) {
      toast.error('Please select a scanner image to upload');
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Handle different upload scenarios
      if (selectedPayment) {
        // Upload for specific payment
        const formData = new FormData();
        formData.append('scannerImage', scannerImage);
        formData.append('paymentId', selectedPayment.id);

        const uploadResponse = await fetch('/api/admin/payments/scanner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload scanner image');
        }

        const uploadResult = await uploadResponse.json();

        // Update the payment to include the scanner image URL
        const updateResponse = await fetch('/api/admin/payments', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentId: selectedPayment.id,
            adminScannerImage: uploadResult.scannerImageUrl
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update payment with scanner image');
        }

        const result = await updateResponse.json();
        toast.success('Scanner image uploaded and linked to payment successfully');

        // Update the payment in local state
        setPayments(prev => prev.map(p =>
          p.id === selectedPayment.id ? result.payment : p
        ));

        setSelectedPayment(null);
      } else if (uploadUserId) {
        // Upload for specific user
        const formData = new FormData();
        formData.append('scannerImage', scannerImage);
        formData.append('userId', uploadUserId);

        const uploadResponse = await fetch('/api/admin/scanner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload scanner image for user');
        }

        const result = await uploadResponse.json();
        toast.success('Scanner image uploaded and linked to user successfully');

        // Reset the userId for user-specific uploads
        setUploadUserId(null);
      } else {
        // General upload (not tied to specific payment or user) - just upload the image
        const formData = new FormData();
        formData.append('scannerImage', scannerImage);

        const uploadResponse = await fetch('/api/admin/payments/scanner', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || 'Failed to upload scanner image');
        }

        toast.success('General scanner image uploaded successfully');
      }

      // Reset state
      setShowScannerUploadModal(false);
      setScannerImage(null);
      setPreviewScannerImage(null);
      setOtpVerified(false);
      // Also close the OTP modal if it was still open
      setShowOtpModal(false);
    } catch (error) {
      console.error('Error uploading scanner image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload scanner image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadScanner = async () => {
    // Instead of uploading directly, send OTP first
    if (selectedPayment) {
      // For specific payment upload
      sendOtp('upload_payment');
    } else {
      // For general upload
      sendOtp('upload_general');
    }
  };

  // Function to trigger scanner upload for a specific user
  const handleUploadScannerForUser = (userId: string) => {
    setUploadUserId(userId);
    setSelectedPayment(null); // Clear any selected payment
    sendOtp('upload_user', userId);
  };

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (payment.car?.title || '').toLowerCase().includes(searchLower) ||
      (payment.user?.username || '').toLowerCase().includes(searchLower) ||
      (payment.user?.email || '').toLowerCase().includes(searchLower) ||
      payment.amount.toString().includes(searchLower)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View and manage customer payment requests
            </p>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              onClick={() => setShowScannerConfirmModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              General Scanner
            </Button> */}
            <Button
              variant="outline"
              onClick={() => {
                // Upload scanner for the currently logged-in admin user
                setSelectedPayment(null); // Ensure no payment is selected
                setUploadUserId(user?.id || null); // Use current user ID if available
                setOtpAction('upload_user'); // Set the action type
                setShowScannerConfirmModal(true); // Show confirmation modal
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              My Scanner
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {loading ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.total}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Payments</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{stats.pending}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.approved}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Approved</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.rejected}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Rejected</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search payments by car, customer, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">Payment Requests</CardTitle>
            <CardDescription className="dark:text-gray-300">
              List of all payment requests from customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {/* Skeleton for table header */}
                <div className="hidden md:table-header-group">
                  <div className="flex space-x-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {/* Skeleton rows */}
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex flex-col md:table-row border-b border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="mb-2 md:mb-0 md:w-1/6">
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No payments found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No payments match your search.' : 'No payment requests yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Car
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Scanner Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.car?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.car?.brand || ''} {payment.car?.model || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {payment.user?.username || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatPrice(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              payment.payment_status === 'pending' ? 'secondary' :
                              payment.payment_status === 'approved' ? 'default' :
                              payment.payment_status === 'rejected' ? 'destructive' :
                              'outline'
                            }
                          >
                            {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.admin_scanner_image ? (
                            <div className="flex items-center space-x-2">
                              <img
                                src={payment.admin_scanner_image}
                                alt="Scanner preview"
                                className="h-10 w-10 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  router.push(`/admin/payments/${payment.id}`);
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  router.push(`/admin/payments/${payment.id}`);
                                }}
                                title="View and update scanner"
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">No preview</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment);
                                router.push(`/admin/payments/${payment.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUploadScannerForUser(payment.user_id)}
                              title="Upload scanner for this user"
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              User Scanner
                            </Button>
                            {payment.payment_status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowApproveModal(true);
                                  }}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowRejectModal(true);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Payment Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Review and approve this payment request. You can add notes and expected delivery date.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.user?.username || 'N/A'}</p>
                </div>
                <div>
                  <Label>Car</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.car?.title || 'N/A'}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">{formatPrice(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.payment_method || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Input
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the customer..."
                />
              </div>

              <div>
                <Label htmlFor="scannerImage">Upload Scanner Image (Optional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="scannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Button size="sm" variant="outline" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {previewScannerImage && (
                  <div className="mt-2">
                    <Label>Preview:</Label>
                    <div className="mt-1">
                      <img
                        src={previewScannerImage}
                        alt="Scanner preview"
                        className="h-32 w-auto object-contain border rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedPayment(null);
                setAdminNotes('');
                setExpectedDeliveryDate('');
                setScannerImage(null);
                setPreviewScannerImage(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprovePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Reject this payment request. Add notes explaining why it was rejected.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.user?.username || 'N/A'}</p>
                </div>
                <div>
                  <Label>Car</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedPayment.car?.title || 'N/A'}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-sm font-medium">{formatPrice(selectedPayment.amount)}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="rejectNotes">Reason for Rejection</Label>
                <Input
                  id="rejectNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedPayment(null);
                setAdminNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
                // Clear selected payment to indicate general upload
                setSelectedPayment(null);
                if (otpAction === 'upload_user') {
                  // For user upload, we already have the userId set
                  sendOtp('upload_user', uploadUserId || undefined);
                } else {
                  setUploadUserId(null); // Ensure no specific user is selected for general upload
                  sendOtp('upload_general');
                }
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
              onClick={() => sendOtp(otpAction as 'upload_general' | 'upload_payment')}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scanner Upload Modal - After OTP Verification */}
      <Dialog open={showScannerUploadModal} onOpenChange={setShowScannerUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {otpAction === 'upload_user'
                ? 'Upload User Scanner Image'
                : otpAction === 'upload_payment'
                  ? 'Upload Payment Scanner Image'
                  : 'Upload General Scanner Image'}
            </DialogTitle>
            <DialogDescription>
              {otpAction === 'upload_user'
                ? 'Select and upload a scanner image for the user. This will be stored in the user\'s profile.'
                : otpAction === 'upload_payment'
                  ? 'Select and upload a scanner image for the payment. This will be linked to the payment record.'
                  : 'Select and upload a general scanner image. This will be stored for administrative purposes.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="scannerImageUpload">Select Scanner Image</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                <div className="space-y-1 text-center w-full">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-300">
                    <label
                      htmlFor="scannerImageUpload"
                      className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none w-full"
                    >
                      <span className="w-full text-center block">Upload a scanner image</span>
                      <Input
                        id="scannerImageUpload"
                        name="scannerImageUpload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {previewScannerImage && (
                <div className="mt-4">
                  <Label>Preview:</Label>
                  <div className="mt-2 flex justify-center">
                    <img
                      src={previewScannerImage}
                      alt="Scanner preview"
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowScannerUploadModal(false);
                setScannerImage(null);
                setPreviewScannerImage(null);
                // Close OTP modal as well when canceling scanner upload
                setShowOtpModal(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScannerUploadAfterVerification}
              disabled={isProcessing || !scannerImage}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Scanner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}