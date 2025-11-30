'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Loader2, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';

export default function EditRoomPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    image: '',
    contactInfo: {
      phone: '',
      email: '',
      address: '',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const p = params ?? {};
  const roomid = typeof (p as any).id === 'string' ? (p as any).id : Array.isArray((p as any).id) ? (p as any).id[0] : undefined;
  const { user, loading } = useUser(); // Use context instead of local state

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }

    if (user && roomid) {
      // Fetch room data
      const fetchRoom = async () => {
        try {
          const response = await fetch(`/api/rooms/${roomid}`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`, // Use context user token
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch room data');
          }
          const data = await response.json();
          const roomData = data.room;

          if (!roomData) {
            throw new Error('No room data found in the response');
          }

          // Set form data with the fetched room data
          setFormData({
            name: roomData.name || '',
            description: roomData.description || '',
            location: roomData.location || '',
            image: roomData.image || '',
            contactInfo: roomData.contactInfo || {
              phone: '',
              email: '',
              address: '',
            },
          });
        } catch (error) {
          console.error('Error fetching room:', error);
          setError('Failed to load room data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchRoom();
    }
  }, [user, loading, roomid, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use superadmin API if user is superadmin, otherwise use regular API
      const endpoint = user?.role === 'superadmin' 
        ? `/api/superadmin/rooms/${roomid}` 
        : `/api/rooms/${roomid}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`, // Use context user token
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update room');
      }

      router.push('/admin');
    } catch (error: any) {
      console.error('Error updating room:', error);
      setError(error.message || 'Failed to update room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Showroom</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Update the details of this showroom</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Basic Information</CardTitle>
                <CardDescription className="dark:text-gray-300">Enter the basic details of the showroom.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-gray-200">Showroom Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Premium Auto Sales"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="dark:text-gray-200">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., New York, USA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="dark:text-gray-200">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/showroom-image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="dark:text-gray-200">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the showroom..."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Contact Information</CardTitle>
                <CardDescription className="dark:text-gray-300">How customers can contact the showroom.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactInfo.phone" className="dark:text-gray-200">Phone Number</Label>
                  <Input
                    id="contactInfo.phone"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo.email" className="dark:text-gray-200">Email</Label>
                  <Input
                    id="contactInfo.email"
                    name="contactInfo.email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={handleChange}
                    placeholder="e.g., contact@showroom.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo.address" className="dark:text-gray-200">Address</Label>
                  <Textarea
                    id="contactInfo.address"
                    name="contactInfo.address"
                    value={formData.contactInfo.address}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street, City, State, ZIP"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link href="/admin">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Showroom'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}