'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Settings, Car, Heart, FileText, Bell, Upload } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BookingStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export default function ProfileDropdown() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    // In a real app, you would make an API call here
    console.log('Changing password for user:', user?.id);
    // Reset form and close dialog
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsChangePasswordOpen(false);
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

  const handleImageUpload = useCallback(() => {
    if (!profileImage) return;

    // In a real app, you would upload the image to the server
    console.log('Uploading image:', profileImage);
    setProfileImage(null);
    // Reset preview after upload simulation
    setTimeout(() => {
      if (user) {
        // You might want to refresh user data after upload
      }
    }, 1000);
  }, [profileImage, user]);

  const fetchBookingStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // In a real app, fetch booking stats from API
      // For now, we'll simulate with mock data
      setBookingStats({
        total: 12,
        upcoming: 3,
        completed: 8,
        cancelled: 1
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setBookingStats]);

  useEffect(() => {
    if (user) {
      fetchBookingStats();
    }
  }, [user, fetchBookingStats]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={previewImage || user.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                alt={user.username}
              />
              <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0 bg-white dark:bg-gray-800" align="end">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={previewImage || user.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-200 truncate">
                  {user.email}
                </p>
                <Badge variant="outline" className="mt-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-2 bg-white dark:bg-gray-800">
            <DropdownMenuItem asChild>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer text-blue-700 dark:text-blue-200">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Profile</span>
              </div>
            </DropdownMenuItem>

            {user.role === 'user' && (
              <>
                <DropdownMenuItem asChild>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer text-blue-700 dark:text-blue-200">
                    <Car className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">My Bookings</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer text-blue-700 dark:text-blue-200">
                    <Heart className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Favorites</span>
                  </div>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem asChild>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer text-blue-700 dark:text-blue-200">
                <Bell className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Notifications</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer text-blue-700 dark:text-blue-200">
                <Settings className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Settings</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer w-full text-blue-700 dark:text-blue-200">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Change Password</span>
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Update your account password for better security
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  <Button type="submit" className="w-full">
                    Update Password
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <DropdownMenuSeparator />
            
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50">
              <Label className="text-xs text-blue-700 dark:text-blue-300 mb-2 block">Profile Image</Label>
              <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={previewImage || user.profile_image || `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                    alt={user.username}
                  />
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm"
                  />
                  {profileImage && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleImageUpload}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2 bg-gray-50 dark:bg-gray-700/50">
              <Card className="mb-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="p-3 bg-blue-50 dark:bg-blue-950/20">
                  <CardTitle className="text-sm text-blue-800 dark:text-blue-200">Booking Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  ) : bookingStats ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-300">Total</p>
                        <p className="font-bold text-blue-800 dark:text-blue-100">{bookingStats.total}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-300">Upcoming</p>
                        <p className="font-bold text-blue-800 dark:text-blue-100">{bookingStats.upcoming}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-300">Completed</p>
                        <p className="font-bold text-blue-800 dark:text-blue-100">{bookingStats.completed}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-600 dark:text-blue-300">Cancelled</p>
                        <p className="font-bold text-blue-800 dark:text-blue-100">{bookingStats.cancelled}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-blue-600 dark:text-blue-400 py-2">No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}