import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AddCarSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Skeleton className="h-10 w-40 rounded" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-8 w-64 mx-auto mb-2 rounded" />
          <Skeleton className="h-5 w-96 mx-auto rounded" />
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 p-6">
          <Skeleton className="h-6 w-32 mb-2 rounded" />
          <Skeleton className="h-4 w-64 mb-4 rounded" />
          
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-48 rounded" />
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-32 mb-2 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
              </div>

              <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden">
                    <Skeleton className="w-full h-full rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-32 w-full rounded" />
            </div>

            {/* Specifications Section */}
            <div className="space-y-6">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-48 rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-11 w-full rounded" />
                  </div>
                ))}
              </div>

              {/* Features Section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="space-y-2">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Skeleton className="h-11 flex-1 rounded" />
                      <Skeleton className="h-11 w-11 rounded" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}