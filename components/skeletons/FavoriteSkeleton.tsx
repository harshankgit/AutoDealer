import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FavoriteSkeletonProps {
  count?: number;
}

export function FavoriteSkeleton({ count = 6 }: FavoriteSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <Skeleton className="w-full h-full" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            <div className="absolute top-4 left-4 p-2 bg-white/90 rounded-full">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>

          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2 rounded" />
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              {index % 2 === 0 && <Skeleton className="h-4 w-1/3 rounded" />}
            </div>

            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              <Skeleton className="h-7 w-1/2 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-1 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <div className="flex-1">
                <Skeleton className="h-10 w-full rounded" />
              </div>
              <div>
                <Skeleton className="h-10 w-10 rounded" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}