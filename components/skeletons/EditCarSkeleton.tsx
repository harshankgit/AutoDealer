import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EditCarSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-10 w-32 rounded" />
        </div>

        {/* Basic Information Card */}
        <Card className="p-6 mb-8">
          <Skeleton className="h-6 w-32 mb-2 rounded" />
          <Skeleton className="h-4 w-64 mb-4 rounded" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-32 w-full rounded" />
            </div>
          </div>
        </Card>

        {/* Images Card */}
        <Card className="p-6 mb-8">
          <Skeleton className="h-6 w-32 mb-2 rounded" />
          <Skeleton className="h-4 w-64 mb-4 rounded" />
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
            
            <div className="mt-4">
              <Skeleton className="h-5 w-40 mb-2 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
                    <Skeleton className="w-full h-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Specifications Card */}
        <Card className="p-6 mb-8">
          <Skeleton className="h-6 w-32 mb-2 rounded" />
          <Skeleton className="h-4 w-64 mb-4 rounded" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-9 w-24 rounded" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Skeleton className="h-11 flex-1 rounded" />
                    <Skeleton className="h-11 w-11 rounded" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-32 rounded" />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Skeleton className="h-12 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}