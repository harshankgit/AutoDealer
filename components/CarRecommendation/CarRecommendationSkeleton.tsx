// components/CarRecommendation/CarRecommendationSkeleton.tsx
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CarRecommendationSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="flex flex-col sm:flex-row overflow-hidden">
          <div className="w-full sm:w-40 h-32 sm:h-auto bg-gray-200 dark:bg-gray-700 border-r" />
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            
            <div className="flex items-center mt-2 gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex">
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 flex-1 rounded" />
              <Skeleton className="h-8 flex-1 rounded" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CarRecommendationSkeleton;