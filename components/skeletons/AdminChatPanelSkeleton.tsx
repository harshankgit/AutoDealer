import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminChatPanelSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Skeleton - Desktop */}
      <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:translate-x-0 md:flex md:flex-col hidden md:block">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center px-4 py-2 rounded-md">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64 flex flex-col flex-1">
        {/* Top navigation bar skeleton */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 md:hidden mr-2 rounded" />
                <Skeleton className="h-8 w-8 rounded mr-3" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </div>
          </div>
        </header>

        {/* Main chat area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat list sidebar */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-10 w-full rounded" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat conversation area */}
          <div className="flex-1 flex flex-col hidden md:flex">
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                <Skeleton className="h-6 w-64 mx-auto mt-4 rounded" />
                <Skeleton className="h-4 w-96 mx-auto mt-2 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}