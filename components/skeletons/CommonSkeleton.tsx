import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CommonSkeletonProps {
  variant?: 'card' | 'list' | 'grid' | 'page';
  count?: number;
  className?: string;
}

export function CommonSkeleton({ variant = 'card', count = 1, className = '' }: CommonSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={`p-6 ${className}`}>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </Card>
        );
      
      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'grid':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
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
      
      case 'page':
        return (
          <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header Skeleton */}
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-64 mx-auto mb-4 rounded" />
                <Skeleton className="h-5 w-96 mx-auto rounded" />
              </div>

              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48 rounded" />
              </div>

              <CommonSkeleton variant="grid" count={count} />

              {/* Summary Stats Skeleton */}
              <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <Skeleton className="h-6 w-48 mx-auto mb-6 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="text-center">
                      <Skeleton className="h-8 w-24 mx-auto mb-1 rounded" />
                      <Skeleton className="h-4 w-20 mx-auto rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <Skeleton className={className} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}