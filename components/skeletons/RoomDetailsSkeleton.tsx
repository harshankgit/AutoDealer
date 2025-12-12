import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RoomDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      <div className="mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 max-w-7xl">
        {/* Room Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
          <div className="relative h-48 sm:h-64 md:h-80">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <Skeleton className="h-8 w-64 mb-2" />
              <div className="flex items-center text-base sm:text-lg opacity-90 mb-1 sm:mb-2">
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center text-xs sm:text-sm opacity-80">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <Skeleton className="h-4 w-full mb-3 sm:mb-4" />
            <Skeleton className="h-4 w-5/6 mb-3 sm:mb-4" />
            <Skeleton className="h-4 w-4/6 mb-2 sm:mb-3" />

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Cars Grid Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800 rounded-xl">
              <div className="relative h-48 overflow-hidden">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-48 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>

                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-10" />
                  <Skeleton className="h-8 w-10" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}