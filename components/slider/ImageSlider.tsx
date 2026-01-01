'use client';

import React, { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Loader2, Play, Pause } from 'lucide-react';

interface SliderImage {
  id: string;
  image_url: string;
  alt_text: string;
  order_position: number;
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
  const [isPlaying, setIsPlaying] = useState(autoSlide);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching slider images:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // Calculate plugins for carousel - enabling auto-slide based on state
  const plugins = isPlaying ? [Autoplay({ delay: slideInterval, stopOnInteraction: false, stopOnMouseEnter: true })] : [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg">
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Image Slider */}
      {images.length > 0 && (
        <div className="mt-6 relative group">
          <Carousel
            className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={plugins}
            setApi={(api) => {
              if (api) {
                api.on("select", () => {
                  setCurrentIndex(api.selectedScrollSnap());
                });
              }
            }}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="p-0 relative">
                    <Card className="overflow-hidden border-0 shadow-none relative h-[400px] sm:h-[500px] md:h-[600px]">
                      <CardContent className="p-0 relative w-full h-full">
                        <div className="relative w-full h-full">
                          <Image
                            src={image.image_url}
                            alt={image.alt_text || `Slider image ${image.id}`}
                            fill
                            className="object-cover object-center transition-opacity duration-1000 ease-in-out"
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                            style={{
                              objectFit: 'cover' // Ensures the image covers the container while maintaining aspect ratio
                            }}
                          />
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                          {/* Optional: Add image caption or title */}
                          {image.alt_text && (
                            <div className="absolute bottom-6 left-6 right-6 max-w-3xl">
                              <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                                {image.alt_text}
                              </h3>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 rounded-full size-10 z-20 border border-gray-300 dark:border-gray-600" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 rounded-full size-10 z-20 border border-gray-300 dark:border-gray-600" />
              </>
            )}
          </Carousel>

          {/* Custom indicators and controls */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
              {/* Slide indicators */}
              <div className="flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // This would require carousel API to navigate to specific slide
                      // For now, we'll just track the current index
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white w-6'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Play/Pause button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors"
                aria-label={isPlaying ? "Pause slider" : "Play slider"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                ) : (
                  <Play className="h-4 w-4 text-gray-800 dark:text-gray-200 ml-0.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no images */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg">
          <div className="h-64 sm:h-80 md:h-[400px] lg:h-[500px] flex items-center justify-center rounded-xl">
            <div className="text-center p-8">
              <div className="mx-auto bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Images Available</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                There are currently no images in the slider. Please add some images through the admin panel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;