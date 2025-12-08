'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="flex items-center space-x-1">
      {/* Profile link to navigate to profile page */}
      <Link href="/profile" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
        <User className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">{user.username}</span>
      </Link>
    </div>
  );
}