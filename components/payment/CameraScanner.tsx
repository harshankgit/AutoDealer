'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, RefreshCw } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (imageData: string) => void;
  label?: string;
}

export default function CameraScanner({ onCapture, label = 'Payment Receipt' }: CameraScannerProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (navigator.mediaDevices && window.MediaStream) {
      startCamera();
    } else {
      setError('Camera API not supported in this browser');
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
      });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        onCapture(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can also upload an existing image instead.
            </p>
          </div>
        ) : !hasPermission ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : capturedImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="max-w-full h-auto rounded border max-h-64 object-contain"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button type="button" variant="outline" onClick={retakePhoto}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-30 rounded-full p-4">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                    <div className="bg-gray-200 border-4 border-dashed rounded-xl w-16 h-16" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button type="button" onClick={captureImage}>
                <Camera className="h-4 w-4 mr-2" />
                Capture Image
              </Button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}