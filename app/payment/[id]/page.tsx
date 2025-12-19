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
import { PaymentPageSkeleton } from '@/components/skeletons/PaymentPageSkeleton';

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  location?: string;
  image?: string;
  images?: string[];
  features?: string[];
  description?: string;
  contactNumber?: string;
  adminid?: string;
  roomid?: string;
}

interface Booking {
  id: string;
  carid: string;
  userid: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
  roomid: string;
  car: Car;
}

interface ScannerInfo {
  scanner_image: string | null;
}

export default function PaymentPage() {
  const params = useParams();
  const id = (params as { id: string }).id;
  const router = useRouter();
  const { user } = useUser();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [adminScanner, setAdminScanner] = useState<string | null>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
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
      fetchPaymentDetails();
    }
  }, [user, id, router]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // First, fetch car details to get the room ID
      const carResponse = await fetch(`/api/cars/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (carResponse.ok) {
        const carData = await carResponse.json();
        setCar(carData.car);

        // Fetch user's bookings to check if they have an active booking for this car
        const bookingsResponse = await fetch('/api/user/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const activeBooking = bookingsData.bookings.find(
            (b: any) => b.carId?.id === id && ['Pending', 'Booked', 'Confirmed'].includes(b.status)
          );

          if (activeBooking) {
            setBooking(activeBooking);
            setPaymentAmount(activeBooking.total_price);
          } else {
            // If no active booking found, user shouldn't be on payment page
            toast.error('No active booking found for this car. Please book the car first.');
            setTimeout(() => {
              router.push(`/cars/${id}`);
            }, 2000);
            return;
          }
        }

        // Fetch admin scanner using the room ID from the car
        if (carData.car?.roomid) {
          fetchAdminScanner(carData.car.roomid);
        }
      } else {
        // If car doesn't exist, try to treat as booking ID (for backward compatibility)
        const bookingResponse = await fetch(`/api/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (bookingResponse.ok) {
          const data = await bookingResponse.json();
          setBooking(data.booking);
          setCar(data.booking.car);
          setPaymentAmount(data.booking.total_price);

          // Fetch admin scanner using the room ID from the booking
          if (data.booking?.roomid) {
            fetchAdminScanner(data.booking.roomid);
          }
        } else {
          throw new Error('Car or booking not found');
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminScanner = async (roomId: string) => {
    try {
      setScannerLoading(true);

      // Use the new API endpoint to get the admin scanner for the room
      const response = await fetch(`/api/rooms/${roomId}/scanner`);

      if (response.ok) {
        const data = await response.json();
        if (data.scanner_image) {
          setAdminScanner(data.scanner_image);
        } else {
          console.log('No scanner image found for room:', roomId);
        }
      } else {
        console.error('Failed to fetch admin scanner for room:', roomId);
        console.error('Response status:', response.status);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching admin scanner:', error);
    } finally {
      setScannerLoading(false);
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
            paymentReceiptImage: paymentReceiptPreview // This is the data URL which might be too large
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
    // Return a basic loading spinner while fetching data
    return (
      // <div className="container mx-auto py-8 px-4 flex justify-center items-center">
      //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      // </div>
      <PaymentPageSkeleton/>
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
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center mr-4"
          >
            <span>← Back</span>
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {car ? `Complete Payment for ${car.title}` : 'Complete Your Payment'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit your payment details to confirm your car booking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Info */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">Car & Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Car</Label>
                  <p className="text-gray-900 dark:text-white font-medium">{car ? car.title : booking?.car.title}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {car ? `${car.brand} ${car.model} (${car.year})` : `${booking?.car.brand} ${booking?.car.model} (${booking?.car.year})`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking Date</Label>
                    <p className="text-gray-900 dark:text-white">{booking?.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</Label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking?.total_price || 0)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</Label>
                  <p className="text-gray-900 dark:text-white capitalize">{booking?.status}</p>
                </div>

                {/* Admin Scanner */}
                {scannerLoading ? (
                  <div className="mt-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : adminScanner ? (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dealer Verification</Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">This is the scanner uploaded by the dealer for verification</p>
                    <div className="flex justify-center">
                      <img
                        src={adminScanner}
                        alt="Dealer verification scanner"
                        className="w-full h-auto max-h-32 object-contain border rounded-lg bg-white dark:bg-gray-700 shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">No Verification Scanner</Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      The dealer has not uploaded a verification scanner. Contact them for payment details.
                    </p>
                  </div>
                )}
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
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Important Note</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please coordinate with the dealer for the exact payment amount before making payment.
                  After making the payment, submit the details here along with the payment proof.
                  The dealer will verify the payment and proceed with the car delivery process.
                </p>
              </div>
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
                    {/* File Upload Section */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <div className="flex items-center mb-3">
                        <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <Label htmlFor="paymentReceipt" className="font-medium text-gray-700 dark:text-gray-300">
                          Upload Payment Receipt *
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Upload an existing payment receipt image</p>
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

                      {paymentReceiptPreview && (
                        <div className="mt-4">
                          <Label>Receipt Preview:</Label>
                          <div className="mt-2 flex justify-center">
                            <img
                              src={paymentReceiptPreview}
                              alt="Payment receipt preview"
                              className="max-w-full h-auto max-h-48 rounded border object-contain"
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