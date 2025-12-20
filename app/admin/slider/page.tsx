'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SuperAdminImageUpload from '@/components/slider/SuperAdminImageUpload';
import { Button } from '@/components/ui/button';
import { Upload, Save, ArrowLeft } from 'lucide-react';

export default function SliderManagementPage() {
  const [sliderImages, setSliderImages] = useState<string[]>([]);

  const handleImagesChange = (images: string[]) => {
    setSliderImages(images);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Slider Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage images for the homepage slider
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Manage Slider Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SuperAdminImageUpload onImagesChange={handleImagesChange} />
              
              <div className="mt-6 flex justify-end">
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        {sliderImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-medium mb-4">Current Slider Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {sliderImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Slider preview ${index + 1}`} 
                          className="w-full h-32 object-cover rounded border"
                        />
                        <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}