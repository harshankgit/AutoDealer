'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Camera,
  Check,
  X,
  Download,
  Mail,
  Upload
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_receipt_image: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_details: any;
  admin_notes: string | null;
  admin_scanner_image: string | null;
  approved_by: string | null;
  approved_at: string | null;
  expected_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    email: string;
    phone?: string;
  };
  car?: {
    title: string;
    brand: string;
    model: string;
    year: number;
  };
  booking?: {
    start_date: string;
    end_date: string;
  };
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const id = (params as { id: string }).id;
  const router = useRouter();
  const { user } = useUser();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [scannerImage, setScannerImage] = useState<File | null>(null);
  const [previewScannerImage, setPreviewScannerImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      router.push('/login');
      return;
    }

    fetchPaymentDetails();
  }, [user, id, router]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/payments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment details');
      }

      const data = await response.json();
      setPayment(data.payment);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
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

  const handleApprovePayment = async () => {
    if (!payment) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Prepare form data for scanner image upload if provided
      const formData = new FormData();
      if (scannerImage) {
        formData.append('scannerImage', scannerImage);
      }
      formData.append('paymentId', payment.id);

      // Upload scanner image if provided
      let scannerImageUrl: string | null = null;
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

        const uploadResult = await uploadResponse.json();
        scannerImageUrl = uploadResult.scannerImageUrl;
      }

      // Approve the payment
      const response = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: payment.id,
          status: 'approved',
          adminNotes,
          expectedDeliveryDate,
          adminScannerImage: scannerImageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve payment');
      }

      const result = await response.json();
      toast.success('Payment approved successfully');

      setPayment(result.payment);
      setShowApproveModal(false);
      setAdminNotes('');
      setExpectedDeliveryDate('');
      setScannerImage(null);
      setPreviewScannerImage(null);
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async () => {
    if (!payment) return;

    try {
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
          paymentId: payment.id,
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
      
      setPayment(result.payment);
      setShowRejectModal(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reject payment');
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Information Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Car Information Skeleton */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information Skeleton */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Payment Actions Skeleton */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div>
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>

              {/* Payment Receipt Skeleton */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Skeleton className="h-12 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Scanner Skeleton */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Skeleton className="h-12 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Payment not found</h3>
        <p className="text-gray-500 dark:text-gray-400">The payment you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/admin/payments')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/payments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="dark:text-white">Payment Information</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Details about the payment request
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      payment.payment_status === 'pending' ? 'secondary' :
                      payment.payment_status === 'approved' ? 'default' :
                      payment.payment_status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className="text-sm"
                  >
                    {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</Label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatPrice(payment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</Label>
                    <p className="text-gray-900 dark:text-white">{payment.payment_method || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</Label>
                    <p className="text-gray-900 dark:text-white">{formatDate(payment.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Delivery Date</Label>
                    <p className="text-gray-900 dark:text-white">
                      {payment.expected_delivery_date ? formatDate(payment.expected_delivery_date) : 'Not set'}
                    </p>
                  </div>
                </div>
                
                {payment.payment_details && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Payment Details</Label>
                    <p className="text-gray-900 dark:text-white mt-1">{JSON.stringify(payment.payment_details)}</p>
                  </div>
                )}
                
                {payment.admin_notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Notes</Label>
                    <p className="text-gray-900 dark:text-white mt-1">{payment.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car Information */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Car Information</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Details about the car being purchased
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Car Title</Label>
                  <p className="text-gray-900 dark:text-white">{payment.car?.brand} {payment.car?.model} - {payment.car?.title}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</Label>
                    <p className="text-gray-900 dark:text-white">{payment.car?.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Customer Information</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Details about the customer who made the payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</Label>
                  <p className="text-gray-900 dark:text-white">{payment.user?.username || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</Label>
                    <p className="text-gray-900 dark:text-white">{payment.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</Label>
                    <p className="text-gray-900 dark:text-white">{payment.user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Actions and Receipt */}
          <div className="space-y-6">
            {/* Payment Actions */}
            {payment.payment_status === 'pending' && (
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Actions</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Approve or reject this payment request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowApproveModal(true)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      // Send email to customer
                      window.location.href = `mailto:${payment.user?.email || ''}?subject=Payment Update&body=Hi ${payment.user?.username || 'Customer'}, your payment status has been updated.`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Customer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Receipt */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Payment Receipt</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Image of the payment receipt provided by customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payment.payment_receipt_image ? (
                  <div className="flex justify-center">
                    <img 
                      src={payment.payment_receipt_image} 
                      alt="Payment receipt" 
                      className="max-w-full h-auto rounded border"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>No receipt uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Scanner Image */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="dark:text-white">Admin Scanner</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Scanner image uploaded by admin
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Trigger the upload functionality
                      document.getElementById('scannerImageUpdate')?.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {payment.admin_scanner_image ? 'Update' : 'Upload'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payment.admin_scanner_image ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={payment.admin_scanner_image}
                        alt="Admin scanner"
                        className="max-w-full h-auto rounded border"
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Create a download link for the scanner image
                          const link = document.createElement('a');
                          link.href = payment.admin_scanner_image!;
                          link.download = `scanner-${payment.id}.jpg`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>No scanner image uploaded yet</p>
                  </div>
                )}
                {/* Hidden file input for updating scanner image */}
                <Input
                  id="scannerImageUpdate"
                  name="scannerImageUpdate"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !payment) return;

                    try {
                      const token = localStorage.getItem('token');
                      if (!token) {
                        router.push('/login');
                        return;
                      }

                      // Prepare form data for scanner image upload
                      const formData = new FormData();
                      formData.append('scannerImage', file);
                      formData.append('paymentId', payment.id);

                      // Upload scanner image
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
                          paymentId: payment.id,
                          adminScannerImage: uploadResult.scannerImageUrl
                        }),
                      });

                      if (!updateResponse.ok) {
                        const errorData = await updateResponse.json();
                        throw new Error(errorData.error || 'Failed to update payment with scanner image');
                      }

                      const result = await updateResponse.json();
                      toast.success('Scanner image updated successfully');
                      setPayment(result.payment);
                    } catch (error) {
                      console.error('Error updating scanner image:', error);
                      toast.error(error instanceof Error ? error.message : 'Failed to update scanner image');
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Payment Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Confirm approval of this payment. You can add notes, expected delivery date, and upload scanner images.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.user?.username || 'N/A'}</p>
              </div>
              <div>
                <Label>Car</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.car?.title || 'N/A'}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm font-medium">{payment?.amount ? formatPrice(payment.amount) : 'N/A'}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.payment_method || 'N/A'}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="expectedDeliveryDate">Expected Delivery Date (Optional)</Label>
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
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                <div className="space-y-1 text-center w-full">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-300">
                    <label
                      htmlFor="scannerImage"
                      className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none w-full"
                    >
                      <span className="w-full text-center block">Upload a scanner image</span>
                      <Input
                        id="scannerImage"
                        name="scannerImage"
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
                setShowApproveModal(false);
                setAdminNotes('');
                setExpectedDeliveryDate('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprovePayment}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve Payment
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
              Reject this payment request. The customer will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.user?.username || 'N/A'}</p>
              </div>
              <div>
                <Label>Car</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.car?.title || 'N/A'}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="text-sm font-medium">{payment?.amount ? formatPrice(payment.amount) : 'N/A'}</p>
              </div>
              <div>
                <Label>Payment Method</Label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{payment?.payment_method || 'N/A'}</p>
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

          <DialogFooter className="flex sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectModal(false);
                setAdminNotes('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectPayment}
            >
              <X className="h-4 w-4 mr-2" />
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}