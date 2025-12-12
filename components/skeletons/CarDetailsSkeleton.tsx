import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-40 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
              <Skeleton className="w-full h-full" />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="relative h-20 rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Car Details Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2 rounded" />
              <Skeleton className="h-6 w-1/2 rounded" />
              <div className="mt-4">
                <Skeleton className="h-8 w-1/3 rounded" />
              </div>
            </div>

            {/* Key Specs Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4 rounded" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                ))}
              </div>

              <div className="my-4">
                <Skeleton className="h-0.5 w-full rounded" />
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            </Card>

            {/* Actions Skeleton */}
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32 rounded" />
            </div>

            {/* Dealer Info Skeleton */}
            <Card className="p-6">
              <Skeleton className="h-6 w-40 mb-4 rounded" />
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-5 w-48 rounded" />
                  <Skeleton className="h-4 w-36 mt-1 rounded" />
                </div>
                <div>
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Description and Specifications Skeleton */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
          </Card>

          {/* Detailed Specifications Skeleton */}
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4 rounded" />
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-4 w-1/4 rounded" />
                </div>
              ))}
              <div className="my-4">
                <Skeleton className="h-0.5 w-full rounded" />
              </div>
              <div>
                <Skeleton className="h-5 w-24 mb-3 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, index) => (
                    <Skeleton key={index} className="h-6 w-20 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}