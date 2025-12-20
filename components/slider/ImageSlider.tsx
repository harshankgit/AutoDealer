'use client';

import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Loader2 } from 'lucide-react';

interface SliderImage {
  id: string;
  image_url: string;
  alt_text: string;
  order: number;
  created_at: string;
}

interface ImageSliderProps {
  autoSlide?: boolean;
  slideInterval?: number; // in milliseconds
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  autoSlide = true, // Enable auto-slide by default
  slideInterval = 4000
}) => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch images from the backend
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await fetch('/api/slider');

        if (response.ok) {
          const data = await response.json();
          setImages(data.images || []);
        } else {
          setError('Failed to load slider images');
        }
      } catch (err) {
        setError('Error loading slider images');
        console.error('Error fetching slider images:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // Calculate plugins for carousel - enabling auto-slide by default
  const plugins = autoSlide ? [Autoplay({ delay: slideInterval })] : [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700">
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Image Slider */}
      {images.length > 0 && (
        <div className="mt-8 relative group">
          <Carousel
            className="w-full rounded-xl overflow-hidden shadow-xl"
            opts={{
              align: "start",
              loop: true, // Enable looping
            }}
            plugins={plugins}
          >
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="p-0 relative">
                    <Card className="overflow-hidden border-0 shadow-none relative">
                      <CardContent className="p-0 relative">
                        <div className="relative w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px]">
                          <Image
                            src={image.image_url}
                            alt={image.alt_text || `Slider image ${image.id}`}
                            fill
                            className="object-cover transition-opacity duration-1000 ease-in-out"
                            priority={false}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {/* Gradient overlay for better text readability if needed */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 rounded-full size-10" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 rounded-full size-10" />
              </>
            )}
          </Carousel>

          {/* Indicators for smaller screens */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  className="w-2.5 h-2.5 rounded-full bg-white/80 hover:bg-white transition-all duration-300"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no images */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-700 shadow-sm">
          <div className="h-64 sm:h-80 md:h-[400px] lg:h-[500px] flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="mx-auto bg-gray-200 dark:bg-gray-600 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-300">No images available in the slider</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;