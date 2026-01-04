'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Car, Plus, X, Loader2, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { AddCarSkeleton } from '@/components/skeletons/AddCarSkeleton';

interface CarFormData {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  ownershipHistory: string;
  images: string[];
  description: string;
  condition: string;
  specifications: {
    engine: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    features: string[];
  };
}

export default function AddCarPage() {
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    ownershipHistory: '',
    images: [],
    description: '',
    condition: '',
    specifications: {
      engine: '',
      power: '',
      torque: '',
      acceleration: '',
      topSpeed: '',
      features: [''],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading } = useUser(); // Use context instead of local state
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files); // Debug log
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Function to manually trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput && !isUploading) {
      fileInput.click();
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();

      // Add all files to form data
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files');
          continue;
        }

        formData.append('files', file);
      }

      const response = await fetch('/api/upload-car-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to upload files');
      }

      // Use the image URLs returned from the upload API
      const newImageUrls = result.fileUrls || result.fileIds.map((id: string) => `/api/files/${id}`);

      // Add new images to the existing ones
      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(url => url !== ''), ...newImageUrls]
      }));
      console.log('Uploaded images:', newImageUrls); // Debug log

    } catch (err: any) {
      console.error('Error uploading files:', err);
      if (err.message && err.message.includes('Bucket not found')) {
        setError('File upload is not configured properly. Please add image URLs manually below.');
      } else {
        setError(err.message || 'Failed to upload files. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

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
      // Filter out empty images and features
      const cleanedData = {
        ...formData,
        price: parseInt(formData.price),
        mileage: parseInt(formData.mileage),
        images: formData.images.filter(img => img.trim() !== ''),
        specifications: {
          ...formData.specifications,
          features: formData.specifications.features.filter(feature => feature.trim() !== ''),
        },
      };

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`, // Use context user token
        },
        body: JSON.stringify(cleanedData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin');
      } else {
        setError(data.error || 'Failed to add car');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('specifications.')) {
      const specField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.specifications.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: newFeatures,
      },
    }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: [...prev.specifications.features, ''],
      },
    }));
  };

  const removeFeatureField = (index: number) => {
    if (formData.specifications.features.length > 1) {
      const newFeatures = formData.specifications.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          features: newFeatures,
        },
      }));
    }
  };

  if (loading) {
    return <AddCarSkeleton />;
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
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Car</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add a new car to your showroom with detailed information and specifications.
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Car Details</CardTitle>
            <CardDescription>
              Provide comprehensive information about the car
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Car Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., 2023 BMW X5 xDrive40i - Premium Package"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      type="text"
                      placeholder="e.g., BMW"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      type="text"
                      placeholder="e.g., X5"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="e.g., 45000"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      min="0"
                      placeholder="e.g., 25000"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange('mileage', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownershipHistory">Ownership *</Label>
                    <Select value={formData.ownershipHistory} onValueChange={(value) => handleInputChange('ownershipHistory', value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select ownership" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Owner">1st Owner</SelectItem>
                        <SelectItem value="2nd Owner">2nd Owner</SelectItem>
                        <SelectItem value="3rd Owner">3rd Owner</SelectItem>
                        <SelectItem value="4th+ Owner">4th+ Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Very Good">Very Good</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Car Images</h3>
                  <p className="text-sm text-gray-600">Upload high-quality images of your car (up to 10 images)</p>
                </div>

                {/* Drag and drop area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={(e) => {
                    handleDrag(e);
                    e.preventDefault(); // Important: prevent default to allow drop
                  }}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <div className="flex flex-col sm:flex-row text-sm text-gray-600 items-center justify-center gap-2">
                      <div
                        onClick={triggerFileInput}
                        className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span className="px-2 py-1 border border-blue-500 rounded hover:bg-blue-50 transition-colors">
                          {isUploading ? 'Uploading...' : 'Select Files'}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={isUploading}
                        />
                      </div>
                      <span className="hidden sm:block">or</span>
                      <span>drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* Alternative upload button for better accessibility */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="w-full mt-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Select Images'}
                </Button>

                {/* Error message display */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    <p>{error}</p>
                    <p className="mt-1">Note: Make sure Supabase storage is configured properly.</p>
                  </div>
                )}

                {/* Image preview grid */}
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'} selected
                    </p>
                  </div>
                )}

                {/* Individual image URL inputs */}
                {formData.images.map((url, index) => (
                  <div key={`url-${index}`} className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/car-image.jpg"
                      value={url}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="h-11"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="h-11 w-11"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add more image fields button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, '']
                  }))}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Image URL
                </Button>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the car, its history, maintenance, and any special features..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Specifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                <p className="text-sm text-gray-600">Optional: Add detailed technical specifications</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="engine">Engine</Label>
                    <Input
                      id="engine"
                      type="text"
                      placeholder="e.g., 3.0L Twin-Turbo V6"
                      value={formData.specifications.engine}
                      onChange={(e) => handleInputChange('specifications.engine', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="power">Power</Label>
                    <Input
                      id="power"
                      type="text"
                      placeholder="e.g., 335 HP"
                      value={formData.specifications.power}
                      onChange={(e) => handleInputChange('specifications.power', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="torque">Torque</Label>
                    <Input
                      id="torque"
                      type="text"
                      placeholder="e.g., 330 lb-ft"
                      value={formData.specifications.torque}
                      onChange={(e) => handleInputChange('specifications.torque', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acceleration">0-60 mph</Label>
                    <Input
                      id="acceleration"
                      type="text"
                      placeholder="e.g., 5.3 seconds"
                      value={formData.specifications.acceleration}
                      onChange={(e) => handleInputChange('specifications.acceleration', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topSpeed">Top Speed</Label>
                    <Input
                      id="topSpeed"
                      type="text"
                      placeholder="e.g., 155 mph"
                      value={formData.specifications.topSpeed}
                      onChange={(e) => handleInputChange('specifications.topSpeed', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <Label>Features</Label>
                  {formData.specifications.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., Leather Seats, Navigation System, etc."
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="h-11"
                      />
                      {formData.specifications.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFeatureField(index)}
                          className="h-11 w-11"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeatureField}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
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
                      Adding Car...
                    </>
                  ) : (
                    'Add Car'
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