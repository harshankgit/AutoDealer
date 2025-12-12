import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatDashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header Skeleton */}
      <div className="lg:hidden p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar Skeleton */}
        <div className="md:flex flex-col md:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <Skeleton className="h-10 w-full rounded" />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-24 mb-1 rounded" />
                          <Skeleton className="h-5 w-5 rounded-full ml-2" />
                        </div>
                        <Skeleton className="h-3 w-32 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Info Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2 bg-gray-100 dark:bg-gray-800">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-20 mb-1 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>

        {/* Chat Window Placeholder */}
        <div className="hidden flex-1 flex-col bg-white dark:bg-gray-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs sm:max-w-md">
                <Skeleton className="w-8 h-8 rounded-full mt-1" />
                <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-16 mt-1 rounded" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex items-start space-x-2 max-w-xs sm:max-w-md">
                <div className="bg-blue-600 rounded-2xl rounded-br-none px-4 py-3 text-white">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-12 mt-1 rounded" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full mt-1" />
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <Skeleton className="flex-1 h-12 rounded" />
              <Skeleton className="h-12 w-12 rounded" />
            </div>
          </div>
        </div>

        {/* Show when no chat is selected */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center p-8">
            <Skeleton className="h-16 w-16 mx-auto mb-4 rounded" />
            <Skeleton className="h-6 w-64 mx-auto mb-2 rounded" />
            <Skeleton className="h-4 w-80 mx-auto rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}