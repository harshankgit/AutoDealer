import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-6 w-64 mb-1 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>


        {/* No Room Created Skeleton */}
        <div className="text-center py-16">
          <Skeleton className="h-16 w-16 mx-auto mb-4 rounded" />
          <Skeleton className="h-8 w-72 mx-auto mb-4 rounded" />
          <Skeleton className="h-5 w-96 mx-auto mb-8 rounded" />
          <Skeleton className="h-12 w-56 mx-auto rounded" />
        </div>

        {/* Tabs Skeleton - when room exists */}
        <div className="w-full overflow-x-auto -mx-4 px-4 mb-6">
          <div className="flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-5 sm:mx-0 sm:px-0">
            <Skeleton className="h-10 w-24 m-1 rounded" />
            <Skeleton className="h-10 w-24 m-1 rounded" />
            <Skeleton className="h-10 w-24 m-1 rounded" />
            <Skeleton className="h-10 w-24 m-1 rounded" />
            <Skeleton className="h-10 w-24 m-1 rounded" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 p-4">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-3 w-32 mt-2 rounded" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-2 rounded" />
            <Skeleton className="h-4 w-48 mb-4 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full rounded" />
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Cars Skeleton */}
        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4 rounded" />
            <Skeleton className="h-4 w-48 mb-4 rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border dark:border-gray-600 rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-32 mb-1 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <div className="text-right sm:text-right">
                    <Skeleton className="h-5 w-20 mb-1 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Charts Section Skeleton */}
        <div className="mt-8">
          <Card className="bg-white dark:bg-gray-800">
            <div className="p-6">
              <Skeleton className="h-5 w-40 mb-2 rounded" />
              <Skeleton className="h-4 w-64 mb-4 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Skeleton className="h-6 w-32 mb-4 rounded" />
                  <Skeleton className="h-64 w-full rounded" />
                </div>
                <div>
                  <Skeleton className="h-6 w-32 mb-4 rounded" />
                  <Skeleton className="h-64 w-full rounded" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}