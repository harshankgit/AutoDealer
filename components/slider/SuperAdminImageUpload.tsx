'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/context/user-context';

interface SliderImage {
  id: string;
  image_url: string;
  alt_text: string;
  order: number;
  created_at: string;
}

interface SuperAdminImageUploadProps {
  onImagesChange?: (images: string[]) => void;
}

const SuperAdminImageUpload: React.FC<SuperAdminImageUploadProps> = ({ onImagesChange }) => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Track which image is being deleted
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useUser(); // Get the current user from context

  // Check if user has superadmin role
  useEffect(() => {
    if (user && user.role === 'superadmin') {
      setHasPermission(true);
    } else {
      setHasPermission(false);
    }
  }, [user]);

  // Load existing slider images from the backend
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await fetch('/api/admin/slider', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);

          // Notify parent component of the change
          if (onImagesChange) {
            onImagesChange(data.images.map((img: SliderImage) => img.image_url));
          }
        } else {
          console.error('Failed to fetch slider images:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching slider images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSliderImages();
    }
  }, [user, onImagesChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }, []);

  const handleUpload = useCallback(async () => {
    if (previewUrls.length === 0) return;

    setIsUploading(true);

    try {
      // Get the actual files from file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (!fileInput?.files) return;

      const files = Array.from(fileInput.files);

      // For each file, we'll upload directly to the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Create form data to send the actual file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt_text', file.name || `Slider image ${images.length + i + 1}`);
        formData.append('order', (images.length + i).toString());

        const response = await fetch('/api/admin/slider', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
          body: formData, // Send the actual file, not a blob URL
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to upload image: ${response.statusText}`);
        }
      }

      // Refresh the images list after upload
      const response = await fetch('/api/admin/slider', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);

        // Notify parent component of the change
        if (onImagesChange) {
          onImagesChange(data.images.map((img: SliderImage) => img.image_url));
        }
      }

      setPreviewUrls([]);
      // Reset file input
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error instanceof Error ? error.message : 'An error occurred while uploading images');
    } finally {
      setIsUploading(false);
    }
  }, [previewUrls, user, images.length, onImagesChange]);

  const removeImage = async (id: string) => {
    setIsDeleting(id);

    try {
      const response = await fetch(`/api/admin/slider?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);

        // Notify parent component of the change
        if (onImagesChange) {
          onImagesChange(updatedImages.map(img => img.image_url));
        }
      } else {
        console.error('Failed to delete image:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const removePreview = useCallback((index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Manage Slider Images</h3>

          {/* Loading skeleton for upload section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
            </div>
          </div>

          {/* Loading skeleton for image grid */}
          <div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="w-full">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Manage Slider Images</h3>
          <div className="text-center py-10">
            <div className="mx-auto bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Access Denied</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have permission to access this feature.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Only super administrators can manage slider images.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Manage Slider Images</h3>

        {/* Image Upload Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Upload New Images</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Select Images
            </Button>
          </div>

          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Preview of selected images */}
          {previewUrls.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-3 mb-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      width={120}
                      height={80}
                      className="object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading || previewUrls.length === 0}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${previewUrls.length} Image(s)`
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Uploaded Images List */}
        {images.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Current Slider Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `Slider image ${image.id}`}
                    width={200}
                    height={150}
                    className="object-cover rounded-lg border border-gray-200 w-full h-32"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    disabled={isDeleting === image.id}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                  >
                    {isDeleting === image.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no images */}
        {images.length === 0 && previewUrls.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h4>
            <p className="text-gray-500 mb-4">Upload images to create your slider</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SuperAdminImageUpload;