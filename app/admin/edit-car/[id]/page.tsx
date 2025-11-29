'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditCarPage() {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    ownershipHistory: '',
    images: [] as string[],
    description: '',
    condition: '',
    availability: 'Available',
    specifications: {
      engine: '',
      power: '',
      torque: '',
      acceleration: '',
      topSpeed: '',
      features: [''] as string[],
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading } = useUser();
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const params = useParams();
  const p = params ?? {};
  const carId = typeof (p as any).id === 'string' ? (p as any).id : Array.isArray((p as any).id) ? (p as any).id[0] : undefined;

  useEffect(() => {
    // Fetch car data
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch car data');
        }
        const responseData = await response.json();
        const carData = responseData.car; // Extract the car object from the response
        
        if (!carData) {
          throw new Error('No car data found in the response');
        }
        
        // Set form data with the fetched car data
        setFormData({
          title: carData.title || '',
          brand: carData.brand || '',
          model: carData.model || '',
          year: carData.year || new Date().getFullYear(),
          price: carData.price?.toString() || '',
          mileage: carData.mileage?.toString() || '',
          fuelType: carData.fuelType || '',
          transmission: carData.transmission || '',
          ownershipHistory: carData.ownershipHistory || '',
          images: carData.images || [],
          description: carData.description || '',
          condition: carData.condition || '',
          availability: carData.availability || 'Available',
          specifications: {
            engine: carData.specifications?.engine || '',
            power: carData.specifications?.power || '',
            torque: carData.specifications?.torque || '',
            acceleration: carData.specifications?.acceleration || '',
            topSpeed: carData.specifications?.topSpeed || '',
            features: carData.specifications?.features?.length ? carData.specifications.features : [''],
          },
        });
      } catch (error) {
        console.error('Error fetching car:', error);
        setError('Failed to load car data');
      } finally {
        setIsLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.specifications.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: newFeatures
      }
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: [...prev.specifications.features, '']
      }
    }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.specifications.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        features: newFeatures.length ? newFeatures : ['']
      }
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();

      // Add all files to form data
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files');
          continue;
        }

        formDataUpload.append('files', file);
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('/api/upload-car-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload files');
      }

      // Convert file IDs to URLs that can access the images
      const newImageUrls = result.fileIds.map((id: string) => `/api/files/${id}`);

      // Add new images to the existing ones
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));

    } catch (error: any) {
      console.error('Error handling images:', error);
      setError(error.message || 'Error processing images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          mileage: parseFloat(formData.mileage),
          year: parseInt(formData.year.toString()),
          specifications: {
            ...formData.specifications,
            features: formData.specifications.features.filter(feature => feature.trim() !== '')
          },
          images: formData.images.filter(img => img.trim() !== '')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update car');
      }

      router.push('/admin');
    } catch (error: any) {
      console.error('Error updating car:', error);
      setError(error.message || 'Failed to update car. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  if (isLoading && !formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Car</h1>
            <p className="mt-1 text-sm text-gray-500">Update the details of this car listing</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of the car.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., 2022 Toyota Camry XLE"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g., Toyota"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g., Camry"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g., 2500000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km) *</Label>
                    <Input
                      id="mileage"
                      name="mileage"
                      type="number"
                      min="0"
                      value={formData.mileage}
                      onChange={handleChange}
                      placeholder="e.g., 15000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
                    <Select
                      value={formData.fuelType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                        <SelectItem value="LPG">LPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission *</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                        <SelectItem value="CVT">CVT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability *</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ownershipHistory">Ownership History</Label>
                  <Textarea
                    id="ownershipHistory"
                    name="ownershipHistory"
                    value={formData.ownershipHistory}
                    onChange={handleChange}
                    placeholder="e.g., First owner, well-maintained with complete service history"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide a detailed description of the car..."
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Car Images</CardTitle>
                <CardDescription>Upload high-quality images of the car.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        <Upload className="h-full w-full" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Uploading images...</span>
                    </div>
                  )}

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                              <img
                                src={image}
                                alt={`Car image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
                <CardDescription>Technical details about the car.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specifications.engine">Engine</Label>
                    <Input
                      id="specifications.engine"
                      name="specifications.engine"
                      value={formData.specifications.engine}
                      onChange={handleChange}
                      placeholder="e.g., 2.5L 4-cylinder"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specifications.power">Power</Label>
                    <Input
                      id="specifications.power"
                      name="specifications.power"
                      value={formData.specifications.power}
                      onChange={handleChange}
                      placeholder="e.g., 203 HP @ 6600 RPM"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specifications.torque">Torque</Label>
                    <Input
                      id="specifications.torque"
                      name="specifications.torque"
                      value={formData.specifications.torque}
                      onChange={handleChange}
                      placeholder="e.g., 184 lb-ft @ 5000 RPM"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specifications.acceleration">0-100 km/h</Label>
                    <Input
                      id="specifications.acceleration"
                      name="specifications.acceleration"
                      value={formData.specifications.acceleration}
                      onChange={handleChange}
                      placeholder="e.g., 7.9 seconds"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specifications.topSpeed">Top Speed</Label>
                    <Input
                      id="specifications.topSpeed"
                      name="specifications.topSpeed"
                      value={formData.specifications.topSpeed}
                      onChange={handleChange}
                      placeholder="e.g., 210 km/h"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addFeature}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Feature
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.specifications.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="e.g., Sunroof, Navigation, Leather Seats"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFeature(index)}
                          disabled={formData.specifications.features.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Car'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
