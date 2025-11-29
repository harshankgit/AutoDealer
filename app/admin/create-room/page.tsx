'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';

export default function CreateRoomPage() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading } = useUser(); // Use context instead of local state
  const [imagePreview, setImagePreview] = useState<string | null>(null); // New state for image preview
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`, // Use context user token
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Failed to create room');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('contactInfo.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string })); // Populate image URL with preview
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image: '' })); // Clear image URL if no file selected
    }
  };

  if (loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Showroom</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Set up your virtual showroom where customers can browse and purchase your cars. 
            This will be your dedicated space on the platform.
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Showroom Details</CardTitle>
            <CardDescription>
              Provide information about your showroom to attract customers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Showroom Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Premium Auto Gallery"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., New York, NY"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your showroom, specialties, and what makes you unique..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Showroom Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/showroom-image.jpg"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="h-11"
                />
                <p className="text-sm text-gray-500 mb-2">
                  Optional: Add a URL to an image that represents your showroom.
                </p>
                
                <Label htmlFor="imageUpload">Upload Image</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="h-11"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Image Preview (client-side only):</p>
                    <img src={imagePreview} alt="Image Preview" className="mt-2 max-w-full h-auto rounded-md" />
                    <p className="text-xs text-red-500 mt-1">Note: This is a client-side preview. For permanent storage, a backend file upload service is required.</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-600">
                  Optional: Provide contact details for customers to reach you directly
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contactInfo.phone}
                      onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@yourshowroom.com"
                      value={formData.contactInfo.email}
                      onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, City, State 12345"
                    value={formData.contactInfo.address}
                    onChange={(e) => handleInputChange('contactInfo.address', e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Link href="/admin" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-11">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Showroom'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}