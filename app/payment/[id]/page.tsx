'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Camera,
  Upload,
  CreditCard,
  IndianRupee,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';
import CameraScanner from '@/components/payment/CameraScanner';

interface Booking {
  id: string;
  carid: string;
  userid: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  car: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images?: string[];
  };
}

export default function PaymentPage() {
  const params = useParams();
  const id = (params as { id: string }).id;
  const router = useRouter();
  const { user } = useUser();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentReceiptPreview, setPaymentReceiptPreview] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchBookingDetails();
    }
  }, [user, id, router]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking details');
      }

      const data = await response.json();
      setBooking(data.booking);
      setPaymentAmount(data.booking.total_price);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentReceipt(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) {
      toast.error('Booking details not loaded');
      return;
    }

    if (!paymentReceiptPreview) {
      toast.error('Please capture or upload a payment receipt');
      return;
    }

    if (!expectedDeliveryDate) {
      toast.error('Please provide an expected delivery date');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // If we have a paymentReceipt file, use FormData, otherwise send JSON
      if (paymentReceipt) {
        const formData = new FormData();
        formData.append('bookingId', booking.id);
        formData.append('amount', paymentAmount.toString());
        formData.append('paymentMethod', paymentMethod);
        formData.append('expectedDeliveryDate', expectedDeliveryDate);
        formData.append('paymentReceiptImage', paymentReceiptPreview); // Send as data URL for now

        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            amount: paymentAmount,
            paymentMethod,
            expectedDeliveryDate,
            paymentReceiptImage: paymentReceiptPreview
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit payment');
        }

        const result = await response.json();
        toast.success('Payment submitted successfully! Admin will review it shortly.');
        router.push('/profile?tab=payments');
      } else {
        // If no file but have preview image, send as data URL
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            amount: paymentAmount,
            paymentMethod,
            expectedDeliveryDate,
            paymentReceiptImage: paymentReceiptPreview
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit payment');
        }

        const result = await response.json();
        toast.success('Payment submitted successfully! Admin will review it shortly.');
        router.push('/profile?tab=payments');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Booking not found</h3>
        <p className="text-gray-500 dark:text-gray-400">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/bookings')} className="mt-4">
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Payment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Submit your payment details to confirm your car booking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Info */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Car</Label>
                  <p className="text-gray-900 dark:text-white font-medium">{booking.car.title}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{booking.car.brand} {booking.car.model} ({booking.car.year})</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Date</Label>
                    <p className="text-gray-900 dark:text-white">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</Label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking.total_price)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</Label>
                  <p className="text-gray-900 dark:text-white capitalize">{booking.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Payment Information</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Fill in your payment details and upload receipt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentAmount">Amount to Pay *</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="paymentAmount"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        required
                      >
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="card">Credit/Debit Card</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="expectedDeliveryDate">Expected Delivery Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="expectedDeliveryDate"
                        type="date"
                        value={expectedDeliveryDate}
                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                      <Label className="mb-2 block">Capture Payment Receipt</Label>
                      <CameraScanner onCapture={(imageData) => {
                        setPaymentReceiptPreview(imageData);
                        // Create a blob from the data URL for form submission
                        fetch(imageData)
                          .then(res => res.blob())
                          .then(blob => {
                            // Create a file from the blob
                            const file = new File([blob], `payment_receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
                            setPaymentReceipt(file);
                          });
                      }} />
                    </div>

                    <div>
                      <Label htmlFor="paymentReceipt">Or Upload Payment Receipt *</Label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-300">
                            <label
                              htmlFor="paymentReceipt"
                              className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <Input
                                id="paymentReceipt"
                                name="paymentReceipt"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleReceiptChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>

                      {paymentReceiptPreview && !paymentReceipt && (
                        <div className="mt-4">
                          <Label>Receipt Preview:</Label>
                          <div className="mt-2 flex justify-center">
                            <img
                              src={paymentReceiptPreview}
                              alt="Payment receipt preview"
                              className="max-w-full h-auto rounded border"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Payment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}