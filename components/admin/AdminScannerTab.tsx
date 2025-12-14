'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/context/user-context';
import { Camera, Download, Upload } from 'lucide-react';

interface AdminScannerTabProps {
  user: User | null;
  scannerImage: File | null;
  previewScannerImage: string | null;
  handleScannerImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleScannerImageUpload: () => void;
}

export default function AdminScannerTab({ 
  user, 
  scannerImage, 
  previewScannerImage, 
  handleScannerImageChange, 
  handleScannerImageUpload 
}: AdminScannerTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Admin Scanner Images</CardTitle>
        <CardDescription className="dark:text-gray-300">
          Upload and manage scanner images for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="scanner-image">Upload Scanner Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="scanner-image"
                type="file"
                accept="image/*"
                onChange={handleScannerImageChange}
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => document.getElementById('scanner-image')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>

            {scannerImage && (
              <div className="space-y-2">
                <Label>Preview:</Label>
                <div className="border rounded-lg p-2 flex justify-center">
                  <img
                    src={previewScannerImage || ''}
                    alt="Scanner preview"
                    className="h-32 w-auto object-contain rounded"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleScannerImageUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Scanner
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Current Scanner Image</Label>
            {previewScannerImage ? (
              <div className="space-y-2">
                <div className="border rounded-lg p-2 flex justify-center">
                  <img
                    src={previewScannerImage}
                    alt="Current scanner"
                    className="max-w-full h-auto rounded"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Create a download link for the scanner image
                    const link = document.createElement('a');
                    link.href = previewScannerImage;
                    link.download = `admin-scanner-${user?.id}.jpg`;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Current
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Camera className="h-12 w-12 mx-auto mb-2" />
                <p>No scanner image uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}