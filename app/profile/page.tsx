'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Camera, 
  Upload, 
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Car,
  Heart,
  FileText
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { toast } from 'sonner';

interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  totalRevenue?: number;
}

interface Booking {
  id: string;
  car_id: string;
  car_title: string;
  room_name: string;
  customer_name?: string; // Only for admin bookings
  booking_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserData();
    if (user?.role === 'admin') {
      fetchAdminStats();
    } else {
      fetchBookingStats();
      fetchBookings();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user;

        setName(userData.username || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setLocation(userData.location || '');
        setPreviewImage(userData.profile_image || null);
      } else {
        const errorData = await response.json();
        console.error('Error fetching user data:', errorData.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAdminStats = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch admin dashboard stats from API
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const stats = statsData.stats || {};

        // Map the API response fields to our BookingStats interface
        // For admins: totalCars, availableCars, soldCars, totalRevenue
        setBookingStats({
          total: stats.totalCars || 0,           // Total cars for admin
          upcoming: stats.pendingBookings || 0, // Pending bookings for admin's cars
          completed: stats.confirmedBookings || 0, // Confirmed bookings for admin's cars
          cancelled: (stats.totalBookings || 0) - (stats.confirmedBookings || 0) - (stats.pendingBookings || 0) // Calculate cancelled bookings
        });
      }

      // Fetch admin bookings from API
      const bookingsResponse = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        // Transform the booking data to match our interface based on actual API response
        const transformedBookings = bookingsData.bookings?.map((booking: any) => ({
          id: booking.id,
          car_id: booking.carid || booking.car?.id,
          car_title: booking.car?.title || 'Unknown Car',
          room_name: booking.car?.roomid || booking.room?.name || 'Unknown Room',
          customer_name: booking.user?.username || booking.user?.name || 'Unknown Customer',
          booking_date: booking.start_date || booking.created_at || booking.createdAt,
          status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
          total_amount: booking.total_price || booking.totalPrice || 0
        })) || [];

        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user's bookings from API to calculate stats
      const response = await fetch('/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const bookings = data.bookings || [];

        // Calculate stats from bookings
        const total = bookings.length;
        const upcoming = bookings.filter((b: any) => b.status === 'pending').length;
        const completed = bookings.filter((b: any) => b.status === 'completed').length;
        const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;

        setBookingStats({
          total,
          upcoming,
          completed,
          cancelled
        });
      } else {
        // If the API call fails, set default values
        setBookingStats({
          total: 0,
          upcoming: 0,
          completed: 0,
          cancelled: 0
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      // On error, set default values
      setBookingStats({
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0
      });
    }
  };

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user's bookings from API
      const response = await fetch('/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the booking data to match our interface based on actual API response
        const transformedBookings = data.bookings?.map((booking: any) => ({
          id: booking.id,
          car_id: booking.carId?.id || booking.carid,
          car_title: booking.carId?.title || booking.cars?.title || 'Unknown Car',
          room_name: booking.roomId?.name || booking.cars?.rooms?.name || 'Unknown Room',
          booking_date: booking.createdAt || booking.start_date || booking.bookingDetails?.startDate,
          status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
          total_amount: booking.total_price || 0
        })) || [];

        setBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage || !user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', profileImage);

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile image');
      }

      const data = await response.json();
      const updatedUser = data.user;

      // Update user context with new data
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast.success('Profile image updated successfully');
      setProfileImage(null); // Reset the profile image state
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile image');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: name,
          phone: phone,
          location: location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedUser = data.user;

      // Update user context with new data
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      // Call the password update API
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Check if user is superadmin
      if (user?.role === 'superadmin') {
        toast.error('Super admins cannot change passwords');
        return;
      }

      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Loading skeleton for the main content */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Card Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-24 w-24 mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                  </div>
                </div>
              </div>

              {/* Stats Card Skeleton */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings Skeleton */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">User Profile</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="w-max grid grid-flow-col grid-cols-4 gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="lg:col-span-1">
                <CardHeader className="items-center">
                  <div className="relative">
                    {loading ? (
                      <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    ) : (
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={previewImage || `https://api.dicebear.com/6.x/initials/svg?seed=${name}`}
                          alt={name}
                        />
                        <AvatarFallback>
                          {name
                            .split(' ')
                            .map(word => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {loading ? (
                      <div className="mt-4 w-full h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </>
                    )}
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h2 className="text-xl font-bold">{name}</h2>
                      <p className="text-gray-500 dark:text-gray-400">{email}</p>
                      <Badge variant="secondary" className="mt-2">
                        {user.role}
                      </Badge>
                    </div>
                  )}

                  {profileImage && !loading && (
                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={handleImageUpload}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  )}
                </CardHeader>
              </Card>

              {/* Stats Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  {user?.role === 'admin' ? (
                    <>
                      <CardTitle>Admin Statistics</CardTitle>
                      <CardDescription>
                        Your admin activity and business metrics
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <CardTitle>Booking Statistics</CardTitle>
                      <CardDescription>
                        Your booking activity and history
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  {loading || !bookingStats ? (
                    // Loading skeleton for stats
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : user?.role === 'admin' ? (
                    // Admin-specific stats
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.total}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Cars</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.upcoming}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Available</div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.completed}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Sold</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">₹{bookingStats.totalRevenue?.toLocaleString() || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.total}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.upcoming}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Upcoming</div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.completed}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                        <div className="text-2xl font-bold">{bookingStats.cancelled}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Cancelled</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings or Admin Activity */}
            <Card>
              <CardHeader>
                {user?.role === 'admin' ? (
                  <>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Recent inquiries and bookings for your cars
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>
                      Your most recent car bookings
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  // Loading skeleton for recent activity/bookings
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
                      >
                        <div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : user?.role === 'admin' ? (
                  // Admin activity content
                  bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div>
                            <h4 className="font-semibold">{activity.car_title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customer: {activity.customer_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(activity.booking_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={
                                activity.status === 'completed' ? 'default' :
                                activity.status === 'pending' ? 'secondary' :
                                activity.status === 'confirmed' ? 'outline' :
                                'destructive'
                              }
                            >
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </Badge>
                            <p className="font-semibold">₹{activity.total_amount?.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent activity</p>
                  )
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div>
                          <h4 className="font-semibold">{booking.car_title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{booking.room_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'confirmed' ? 'outline' :
                              'destructive'
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <p className="font-semibold">₹{booking.total_amount?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent bookings</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  // Loading skeleton for profile form
                  <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="relative">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="pl-10 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="join-date">Join Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="join-date"
                            value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                            disabled
                            className="pl-10 bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              // Reset to original values
                              if (user) {
                                setName(user.username || '');
                                setEmail(user.email || '');
                                setPhone(user.phone || '');
                                setLocation(user.location || '');
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Save Changes
                          </Button>
                        </>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                {user?.role === 'admin' ? (
                  <>
                    <CardTitle>Your Cars Activity</CardTitle>
                    <CardDescription>
                      View all bookings for your cars
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle>Your Bookings</CardTitle>
                    <CardDescription>
                      View and manage all your car bookings
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  // Loading skeleton for bookings tab
                  <div className="space-y-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="mb-2 sm:mb-0">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : user?.role === 'admin' ? (
                  // Admin bookings for their cars
                  bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((carBooking: any) => (
                        <div
                          key={carBooking.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="mb-2 sm:mb-0">
                            <h4 className="font-semibold flex items-center">
                              <Car className="h-4 w-4 mr-2 text-blue-500" />
                              {carBooking.car_title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {carBooking.customer_name} • {new Date(carBooking.booking_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={
                                carBooking.status === 'completed' ? 'default' :
                                carBooking.status === 'pending' ? 'secondary' :
                                carBooking.status === 'confirmed' ? 'outline' :
                                'destructive'
                              }
                            >
                              {carBooking.status.charAt(0).toUpperCase() + carBooking.status.slice(1)}
                            </Badge>
                            <p className="font-semibold">₹{carBooking.total_amount?.toLocaleString()}</p>
                            <Button variant="outline" size="sm" onClick={() => {
                              const carId = carBooking.carId?.id || carBooking.car?.id || carBooking.car_id;
                              router.push(`/chat/${carId}`);
                            }}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No car bookings yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        No customers have booked your cars yet.
                      </p>
                      <Button className="mt-4" onClick={() => router.push('/admin')}>
                        Manage Cars
                      </Button>
                    </div>
                  )
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="mb-2 sm:mb-0">
                          <h4 className="font-semibold flex items-center">
                            <Car className="h-4 w-4 mr-2 text-blue-500" />
                            {booking.car_title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.room_name} • {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge
                            variant={
                              booking.status === 'completed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' :
                              booking.status === 'confirmed' ? 'outline' :
                              'destructive'
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <p className="font-semibold">₹{booking.total_amount?.toLocaleString()}</p>
                          <Button variant="outline" size="sm" onClick={() => {
                            const carId = booking.car_id;
                            router.push(`/chat/${carId}`);
                          }}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No bookings yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      You haven't booked any cars yet. Start browsing to make your first booking!
                    </p>
                    <Button className="mt-4" onClick={() => router.push('/rooms')}>
                      Browse Cars
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            {user?.role !== 'superadmin' ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Change your password and manage account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      // Loading skeleton for security form
                      <div className="space-y-6 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="relative">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="relative">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          <div className="relative">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              id="current-password"
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              id="new-password"
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Input
                              id="confirm-password"
                              type={showPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit">
                            <Lock className="h-4 w-4 mr-2" />
                            Update Password
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Additional details about your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      // Loading skeleton for account information
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h4>
                          <p className="flex items-center mt-1">
                            <Shield className="h-4 w-4 mr-2 text-gray-500" />
                            {user.role}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</h4>
                          <p className="flex items-center mt-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                            Active
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h4>
                          <p className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</h4>
                          <p className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {user.last_login && user.last_login !== 'N/A'
                              ? new Date(user.last_login as string).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Additional details about your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    // Loading skeleton for account information
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</h4>
                        <p className="flex items-center mt-1">
                          <Shield className="h-4 w-4 mr-2 text-gray-500" />
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</h4>
                        <p className="flex items-center mt-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</h4>
                        <p className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</h4>
                        <p className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {user.last_login && user.last_login !== 'N/A'
                            ? new Date(user.last_login as string).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}