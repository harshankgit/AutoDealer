'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Car, Home, BarChart3, MessageCircle, Settings, Loader2, Trash2, Bell, Calendar, Phone, Mail, CreditCard, Upload } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications';
import NotificationBadge, { NotificationItem } from '@/components/ui/notification-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BackButton from '@/components/BackButton';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';
import { toast } from 'sonner';

interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  availability: string;
  createdAt: string;
  images?: string[];
  description?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
}

export default function AdminDashboard() {
  const [room, setRoom] = useState<Room | null>(null);

  interface Booking {
    id: string;
    carid: string;
    userid: string;
    roomid: string | null;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
    created_at: string;
    updated_at: string;
    car: {
      id: string;
      title: string;
      brand: string;
      model: string;
      year?: number;
      price?: number;
      images?: string[];
      roomid: string;
    } | null;
    user: {
      id: string;
      username: string;
      email: string;
    } | null;
  }

  // Define ChatMessage interface
  interface ChatMessage {
    id: string;
    roomid: string;
    car?: {
      id: string;
      title: string;
      images?: string[];
      room: string;
    };
    user?: {
      id: string;
      username: string;
      email: string;
    };
    lastMessage?: {
      message: string;
      timestamp: string;
      senderId: string;
    };
    messageCount: number;
    updatedAt: string;
  }

  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    totalViews: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });

  // Add state for chart data
  const [chartData, setChartData] = useState({
    monthlyData: [],
    availabilityData: {
      available: 0,
      sold: 0,
      reserved: 0,
    },
    yearlySummary: {
      totalBookings: 0,
      totalRevenue: 0,
      year: new Date().getFullYear(),
    }
  });
  const [chartLoading, setChartLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentStats, setPaymentStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  // OTP and Scanner Upload state
  const [showScannerConfirmModal, setShowScannerConfirmModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showScannerUploadModal, setShowScannerUploadModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpAction, setOtpAction] = useState<'upload_general' | 'upload_payment' | 'upload_user' | null>(null);
  const [scannerImage, setScannerImage] = useState<File | null>(null);
  const [previewScannerImage, setPreviewScannerImage] = useState<string | null>(null);
  const [uploadUserId, setUploadUserId] = useState<string | null>(null); // For user-specific uploads
  const router = useRouter();
  const { user, loading } = useUser(); // Use context instead of local state
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead } = useRealtimeNotifications();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Super admins should go to the superadmin dashboard
    if (user && user.role === 'superadmin') {
      router.push('/admin/superadmin');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      // Fetch admin's room
      const roomResponse = await fetch('/api/admin/room', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        setRoom(roomData.room);

        // Fetch cars if room exists
        if (roomData.room) {
          // Fetch cars and bookings in parallel
          const [carsResponse, bookingsResponse] = await Promise.all([
            fetch(`/api/cars?roomid=${roomData.room.id}`, {
              headers: { 'Authorization': `Bearer ${user?.token}` },
            }),
            fetch('/api/admin/bookings', {
              headers: { 'Authorization': `Bearer ${user?.token}` },
            })
          ]);

          if (carsResponse.ok) {
            const carsData = await carsResponse.json();
            setCars(carsData.cars);

            // Calculate stats
            const totalCars = carsData.cars.length;
            const availableCars = carsData.cars.filter((car: Car) => car.availability === 'Available').length;
            const soldCars = carsData.cars.filter((car: Car) => car.availability === 'Sold').length;

            setStats({
              totalCars,
              availableCars,
              soldCars,
              totalViews: totalCars * 15, // Mock data
              totalBookings: 0,
              confirmedBookings: 0,
              pendingBookings: 0,
              totalRevenue: 0,
            });
          }

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            setBookings(bookingsData.bookings || []);
          }

          // Fetch dashboard stats
          const statsResponse = await fetch('/api/admin/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${user?.token}` },
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData.stats || {
              totalCars: 0,
              availableCars: 0,
              soldCars: 0,
              totalViews: 0,
              totalBookings: 0,
              confirmedBookings: 0,
              pendingBookings: 0,
              totalRevenue: 0,
            });
          }

          // Fetch chat messages as well
          const chatResponse = await fetch('/api/admin/chats', {
            headers: { 'Authorization': `Bearer ${user?.token}` },
          });

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            setChatMessages(chatData.chats || []);
          }

          // Fetch chart data
          setChartLoading(true);
          const chartResponse = await fetch('/api/admin/dashboard/chart', {
            headers: { 'Authorization': `Bearer ${user?.token}` },
          });

          if (chartResponse.ok) {
            const chartData = await chartResponse.json();
            setChartData(chartData.chartData || {
              monthlyData: [],
              availabilityData: {
                available: 0,
                sold: 0,
                reserved: 0,
              },
              yearlySummary: {
                totalBookings: 0,
                totalRevenue: 0,
                year: new Date().getFullYear(),
              }
            });
          }

          // Fetch payment data
          try {
            const paymentResponse = await fetch('/api/admin/payments', {
              headers: { 'Authorization': `Bearer ${user?.token}` },
            });

            if (paymentResponse.ok) {
              const paymentData = await paymentResponse.json();
              const payments = paymentData.payments || [];

              // Calculate payment stats
              const total = payments.length;
              const pending = payments.filter((p: any) => p.payment_status === 'pending').length;
              const approved = payments.filter((p: any) => p.payment_status === 'approved').length;
              const rejected = payments.filter((p: any) => p.payment_status === 'rejected').length;

              setPaymentStats({
                total,
                pending,
                approved,
                rejected,
              });

              // Set recent payments (last 5)
              setRecentPayments(payments.slice(0, 5));
            }
          } catch (paymentError) {
            console.error('Error fetching payment data:', paymentError);
            // Don't let payment errors break the whole page
          }

          setChartLoading(false);
        }
      }
    } catch (error) {
      setError('Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { // Changed locale to en-IN
      style: 'currency',
      currency: 'INR', // Changed currency to INR
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteRoom = async () => {
    if (!room || !window.confirm('Are you sure you want to delete this showroom? All associated cars will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete showroom');
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || 'Failed to delete showroom. Please try again.');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const data = await response.json();

      // Update the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, updatedAt: data.booking.updatedAt }
            : booking
        )
      );

      setIsStatusModalOpen(false);
      setCurrentBookingId(null);
      setCurrentStatus('');

      // Show success message in modal
      setSuccessMessage('Booking status updated successfully!');
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      alert(error.message || 'Failed to update booking status');
    }
  };

  const handleStatusConfirm = () => {
    if (currentBookingId) {
      handleStatusChange(currentBookingId, currentStatus);
      setIsStatusModalOpen(false);
      setCurrentBookingId('');
      setCurrentStatus('');
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
          setShowOtpModal(false);
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
      if (uploadUserId) {
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

        const uploadResponse = await fetch('/api/admin/scanner', {
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
    } catch (error) {
      console.error('Error uploading scanner image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload scanner image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  // Helper function to safely format date strings or Date objects
  const formatSafeDate = (dateValue: string | Date) => {
    if (!dateValue) return 'Date not available';

    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Date not available';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <BackButton variant="outline" size="sm" className="flex items-center" />
            <div className="flex items-center">
              <NotificationBadge
                notifications={notifications.map(n => ({
                  ...n,
                  timestamp: n.timestamp || new Date(),
                  type: n.type || 'notification'
                }))}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onNotificationClick={() => {}}
              />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Manage your showroom and car listings from your admin dashboard.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {!room ? (
          /* No Room Created */
          <div className="text-center py-16">
            <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              Create Your Showroom
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              You haven't created a showroom yet. Create your virtual showroom to start
              adding and managing your car listings.
            </p>
            <Link href="/admin/create-room">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                <Plus className="h-5 w-5 mr-2" />
                Create Showroom
              </Button>
            </Link>
          </div>
        ) : (
          /* Dashboard with Room */
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="w-full overflow-x-auto -mx-4 px-4">
              <TabsList className="flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-6 sm:mx-0 sm:px-0">
                <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Overview</TabsTrigger>
                <TabsTrigger value="cars" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Cars</TabsTrigger>
                <TabsTrigger value="room" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Showroom</TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Notifications</TabsTrigger>
                <TabsTrigger value="messages" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Messages</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm px-3 py-2 min-w-[80px] whitespace-nowrap">Payments</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-gray-800 p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Total Cars</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      All cars in your showroom
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Available</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.availableCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Ready for sale
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Sold</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.soldCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Successfully sold
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 p-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Total Views</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold dark:text-white">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Car page views
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Common tasks to manage your showroom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    <Link href="/admin/add-car">
                      <Button className="w-full h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-xs">Add Car</span>
                      </Button>
                    </Link>
                    <Link href={`/rooms/${room.id}`}>
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <Home className="h-6 w-6 mb-1" />
                        <span className="text-xs">Showroom</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <MessageCircle className="h-6 w-6 mb-1" />
                        <span className="text-xs">Messages</span>
                      </Button>
                    </Link>
                    <Link href="/admin/bookings">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <Calendar className="h-6 w-6 mb-1" />
                        <span className="text-xs">Bookings</span>
                      </Button>
                    </Link>
                    <Link href="/admin/payments">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <CreditCard className="h-6 w-6 mb-1" />
                        <span className="text-xs">Payments</span>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center"
                      onClick={() => {
                        // Upload scanner for the currently logged-in admin user
                        setUploadUserId(user?.id || null); // Use current user ID if available
                        setOtpAction('upload_user'); // Set the action type
                        setShowScannerConfirmModal(true); // Show confirmation modal
                      }}
                    >
                      <Upload className="h-6 w-6 mb-1" />
                      <span className="text-xs">My Scanner</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Cars */}
              {cars.length > 0 && (
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Recent Cars</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Your latest car listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cars.slice(0, 5).map((car) => (
                        <div key={car.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border dark:border-gray-600 rounded-lg gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium dark:text-white truncate">{car.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {car.year} {car.brand} {car.model}
                            </p>
                          </div>
                          <div className="text-right sm:text-right">
                            <p className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">{formatPrice(car.price)}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{car.availability}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charts Section */}
              <div className="mt-8">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Performance Overview</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Monthly bookings and revenue for {chartData.yearlySummary.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-8">
                      {/* Monthly Bookings Chart */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Bookings</h3>
                        <div className="h-64 sm:h-72 md:h-80 flex items-end space-x-1 sm:space-x-2 justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-x-auto">
                          {chartLoading ? (
                            <div className="flex items-center justify-center h-full w-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                          ) : chartData.monthlyData.length > 0 ? (
                            chartData.monthlyData.map((monthData, index) => {
                              // Calculate max value to scale the bars
                              const maxValue = Math.max(...chartData.monthlyData.map(m => (m as any).bookings || 0), 1);
                              const barHeight = Math.min(((monthData as any).bookings / maxValue) * 120, 200); // Cap max height and make it smaller for mobile

                              return (
                                <div key={index} className="flex flex-col items-center flex-shrink-0">
                                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {(monthData as any).monthName}
                                  </div>
                                  <div
                                    className="w-4 sm:w-6 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                    style={{ height: `${barHeight}px` }}
                                    title={`${(monthData as any).bookings} bookings in ${(monthData as any).monthName}`}
                                  ></div>
                                  <div className="text-xs sm:text-sm mt-1 text-gray-600 dark:text-gray-300">
                                    {(monthData as any).bookings}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-500 dark:text-gray-400">
                              No data available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Chart - Responsive */}
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center md:text-left">Car Availability</h3>
                          <div className="flex items-center justify-center h-64">
                            {chartLoading ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              </div>
                            ) : (
                              <div>
                              <div className="flex items-center justify-center w-full">
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                                {/* Simple pie chart visualization */}
                                {(() => {
                                  // Calculate percentages based on availability data
                                  const total = chartData.availabilityData.available + chartData.availabilityData.sold + chartData.availabilityData.reserved || 1;
                                  const availablePercent = (chartData.availabilityData.available / total) * 100;
                                  const reservedPercent = (chartData.availabilityData.reserved / total) * 100;
                                  const availableAndReservedPercent = (chartData.availabilityData.available + chartData.availabilityData.reserved) / total * 100;

                                  return (
                                    <>
                                      <div
                                        className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500"
                                        style={{
                                          clipPath: `inset(0 0 ${100 - availablePercent}% 0)`
                                        }}
                                      ></div>
                                      <div
                                        className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-yellow-500"
                                        style={{
                                          clipPath: `inset(${availablePercent}% 0 0 0)`
                                        }}
                                      ></div>
                                      <div
                                        className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-red-500"
                                        style={{
                                          clipPath: `inset(${availableAndReservedPercent}% 0 0 ${100 - availableAndReservedPercent}% )`
                                        }}
                                      ></div>
                                    </>
                                  );
                                })()}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold dark:text-white">
                                      {chartData.availabilityData.available + chartData.availabilityData.sold + chartData.availabilityData.reserved}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Cars</div>
                                  </div>
                                </div>
                                </div>
                              </div>
                              {/* Legend for the pie chart */}
                              <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
                                <div className="flex items-center mb-1">
                                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                                  <span className="text-xs sm:text-sm">Available: {chartData.availabilityData.available}</span>
                                </div>
                                <div className="flex items-center mb-1">
                                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                                  <span className="text-xs sm:text-sm">Reserved: {chartData.availabilityData.reserved}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                                  <span className="text-xs sm:text-sm">Sold: {chartData.availabilityData.sold}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {chartData.yearlySummary.totalBookings}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Bookings</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                          }).format(chartData.yearlySummary.totalRevenue)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Revenue</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {stats.confirmedBookings}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Confirmed Bookings</div>
                      </div>
                    </div>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cars" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Your Cars</h2>
                <div className="flex items-center gap-2">
                  <Link href="/admin/add-car">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Car</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {cars.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No cars yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first car to start selling.</p>
                  <Link href="/admin/add-car">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Car
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Card key={car.id} className="overflow-hidden hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
                      {/* Car Image */}
                      <div className="relative h-48 overflow-hidden">
                        {car.images && car.images[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Car className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="text-lg font-bold text-white truncate">{car.title}</h3>
                              <p className="text-sm text-gray-200">
                                {car.year} {car.brand} {car.model}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              car.availability === 'Available'
                                ? 'bg-green-500 text-white'
                                : car.availability === 'Sold'
                                ? 'bg-red-500 text-white'
                                : car.availability === 'Booked'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-500 text-white'
                            }`}>
                              {car.availability}
                            </span>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatPrice(car.price)}
                          </span>
                          {car.mileage && (
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {car.mileage} km
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {car.fuel_type && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                              {car.fuel_type}
                            </span>
                          )}
                          {car.transmission && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                              {car.transmission}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link href={`/cars/${car.id}`} className="flex-1 min-w-[80px]">
                            <Button variant="outline" size="sm" className="w-full">
                              <span className="text-sm">View Details</span>
                            </Button>
                          </Link>
                          <Link href={`/admin/edit-car/${car.id}`} className="flex-1 min-w-[80px]">
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              <span className="text-sm">Edit</span>
                            </Button>
                          </Link>
                          {car.availability === 'Booked' && (
                            <Link href={`/chat/${car.id}`} className="flex-1 min-w-[80px]">
                              <Button size="sm" variant="outline" className="w-full">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span className="text-sm">Chat</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="room" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg sm:text-xl font-bold dark:text-white">Showroom Settings</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Link href={`/admin/edit-room/${room.id}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Showroom
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRoom}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg dark:text-white">{room.name}</CardTitle>
                  <CardDescription className="dark:text-gray-300">{room.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      {room.image ? (
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-32 sm:h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{room.description}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-4 border-t">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Created: {formatSafeDate(room.createdAt)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        room.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Car Bookings & Messages</h2>
              </div>

              {/* Show bookings */}
              {bookings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold dark:text-white mb-4">Recent Bookings</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                    {/* Mobile view for smaller screens */}
                    <div className="block sm:hidden space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-3 bg-white dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {booking.car ? booking.car.title : 'Car not found'}
                              {booking.car && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {booking.car.year || ''} {booking.car.brand} {booking.car.model}
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-medium ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              booking.status === 'Sold' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                              booking.status === 'Booked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' :
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' :
                              'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                            } px-2 py-1 rounded-full`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Customer: {booking.user?.username || 'Customer'}
                          </div>
                          {booking.user?.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {booking.user.email}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Created: {formatSafeDate(booking.created_at)}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Link href="/dashboard">
                              <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 text-white">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Chat
                              </Button>
                            </Link>
                            {booking.car?.id ? (
                              <Link href={`/cars/${booking.car.id}`}>
                                <Button size="sm" variant="outline" className="text-xs">
                                  View Car
                                </Button>
                              </Link>
                            ) : (
                              <Button size="sm" variant="outline" className="text-xs" disabled>
                                View Car
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentBookingId(booking.id);
                                setCurrentStatus(booking.status);
                                setIsStatusModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop view for larger screens */}
                    <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.car ? booking.car.title : 'Car not found'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {booking.car ? `${booking.car.year || ''} ${booking.car.brand} ${booking.car.model}` : ''}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.user?.username || 'Customer'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {booking.user?.email && (
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {booking.user.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              booking.status === 'Sold' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                              booking.status === 'Booked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' :
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' :
                              'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {formatSafeDate(booking.created_at)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Link href="/dashboard">
                                <Button className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                              </Link>
                              {booking.car?.id ? (
                                <Link href={`/cars/${booking.car.id}`}>
                                  <Button variant="outline" className="text-xs">
                                    View Car
                                  </Button>
                                </Link>
                              ) : (
                                <Button variant="outline" className="text-xs" disabled>
                                  View Car
                                </Button>
                              )}
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentBookingId(booking.id);
                                    setCurrentStatus(booking.status);
                                    setIsStatusModalOpen(true);
                                  }}
                                  className="text-xs flex items-center min-w-[60px] justify-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              )}

              {/* Show chat messages */}
              {chatMessages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold dark:text-white mb-4">Recent Messages</h3>
                  <div className="space-y-3">
                    {chatMessages.map((chat) => (
                      <div key={chat.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                {chat.car?.title || 'Unknown Car'}
                              </h4>
                              <span className="text-xs text-gray-500 sm:hidden">•</span>
                              <span className="text-xs text-gray-500 line-clamp-1">
                                {chat.user?.username || 'Unknown User'}
                              </span>
                              {chat.messageCount > 0 && (
                                <span className="ml-0 sm:ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                  {chat.messageCount} {chat.messageCount === 1 ? 'msg' : 'msgs'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              {chat.lastMessage?.message ? (
                                <span>
                                  <span className="font-medium hidden sm:inline">Message:</span> {chat.lastMessage.message.substring(0, 30)}
                                  {chat.lastMessage.message.length > 30 ? '...' : ''}
                                </span>
                              ) : (
                                <span>No messages yet</span>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {chat.updatedAt ? formatSafeDate(chat.updatedAt) : 'Unknown time'}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Link href="/dashboard">
                              <Button variant="outline" size="sm" className="text-xs">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Chat</span>
                                <span className="sm:hidden">Msg</span>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message when no bookings or chat messages */}
              {bookings.length === 0 && chatMessages.length === 0 && (
                <div className="text-center py-16">
                  <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No active bookings or messages</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">When customers book your cars or send messages, they'll appear here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Notifications</h2>
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No notifications yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    When users book your cars or contact you, notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        !notification.read
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.type}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          {notification.type && (
                            <Link
                              href={`/admin/bookings`}
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 sm:mt-2 inline-block"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                        <div className="flex flex-col sm:items-end sm:text-right">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatSafeDate(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h2>
                <Link href="/admin/payments">
                  <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
                    View All Payments
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold" id="totalPayments">{paymentStats.total}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Payments</div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold" id="pendingPayments">{paymentStats.pending}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold" id="approvedPayments">{paymentStats.approved}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Approved</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                  <CardContent className="p-2">
                    <div className="text-2xl font-bold" id="rejectedPayments">{paymentStats.rejected}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Rejected</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payment Requests</CardTitle>
                  <CardDescription>
                    Latest payment requests from customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" id="recentPaymentsList">
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="mb-2 sm:mb-0">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                              <span className="mr-2">{payment.car?.title || 'N/A'}</span>
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.user?.username || 'N/A'} • {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.payment_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              payment.payment_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400' :
                              payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                            }`}>
                              {payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status?.slice(1) || 'Unknown'}
                            </span>
                            <p className="font-medium">₹{payment.amount?.toLocaleString() || '0'}</p>
                            <Link href={`/admin/payments/${payment.id}`}>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No recent payment requests
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Select a new status for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </label>
              <Select value={currentStatus} onValueChange={setCurrentStatus}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Booked">Booked</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusConfirm}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Status Updated
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsSuccessModalOpen(false)}>
              OK
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
                // For user upload, we already have the userId set
                sendOtp('upload_user', uploadUserId || undefined);
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
              onClick={() => sendOtp(otpAction as 'upload_general' | 'upload_payment' | 'upload_user', uploadUserId || undefined)}
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