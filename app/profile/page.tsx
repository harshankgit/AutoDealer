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
}

interface Booking {
  id: string;
  car_id: string;
  car_title: string;
  room_name: string;
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
    if (user) {
      setName(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setPreviewImage(user.profile_image || null);
    }
    fetchBookingStats();
    fetchBookings();
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // In a real app, you would fetch user details from your API
      // For now, we're using the user context data which is already dynamic
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchBookingStats = async () => {
    if (!user) return;
    
    try {
      // In a real app, fetch booking stats from API
      // For now, mock data
      setBookingStats({
        total: 12,
        upcoming: 3,
        completed: 8,
        cancelled: 1
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      // In a real app, fetch user bookings from API
      // For now, mock data
      setBookings([
        {
          id: '1',
          car_id: 'car1',
          car_title: 'Toyota Camry',
          room_name: 'Premium Motors',
          booking_date: '2023-12-15',
          status: 'completed',
          total_amount: 25000
        },
        {
          id: '2',
          car_id: 'car2',
          car_title: 'Honda Civic',
          room_name: 'Auto World',
          booking_date: '2024-01-10',
          status: 'pending',
          total_amount: 22000
        },
        {
          id: '3',
          car_id: 'car3',
          car_title: 'Ford Mustang',
          room_name: 'Luxury Cars',
          booking_date: '2024-02-05',
          status: 'pending',
          total_amount: 35000
        }
      ]);
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
      // In a real app, upload the image to the server
      const formData = new FormData();
      formData.append('image', profileImage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context with new image
      if (updateUser) {
        updateUser({ ...user, profile_image: previewImage || undefined });
      }
      
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile image');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // In a real app, update user profile via API
      const updatedUser = {
        ...user,
        username: name,
        email,
        phone,
        location
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      <div className="flex justify-center items-center h-64">
        <p>Please log in to view your profile</p>
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
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user.role}
                    </Badge>
                  </div>
                  
                  {profileImage && (
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
                  <CardTitle>Booking Statistics</CardTitle>
                  <CardDescription>
                    Your booking activity and history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingStats ? (
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
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Your most recent car bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
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
                          <p className="font-semibold">₹{booking.total_amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No recent bookings
                  </p>
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
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  View and manage all your car bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
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
                          <p className="font-semibold">₹{booking.total_amount.toLocaleString()}</p>
                          <Button variant="outline" size="sm">
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
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Change your password and manage account security
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}