import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Car, User } from 'lucide-react';

export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Car Info Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-2 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>
              
              <Skeleton className="h-32 w-full rounded-lg mb-4" />
              
              <Skeleton className="h-5 w-3/4 mb-2 rounded" />
              <Skeleton className="h-4 w-full mb-1 rounded" />
              <Skeleton className="h-6 w-1/2 mb-4 rounded" />
              
              <Skeleton className="h-4 w-full mb-2 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </Card>
          </div>

          {/* Chat Area Skeleton */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <div className="border-b p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Skeleton className="h-5 w-5 mr-2 rounded" />
                    <Skeleton className="h-6 w-48 rounded" />
                  </div>
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`${index % 2 === 0 ? 'text-right' : ''} flex`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${index % 2 === 0 ? 'bg-blue-100 dark:bg-blue-900 ml-auto' : 'bg-gray-100 dark:bg-gray-700 mr-auto'}`}>
                      <Skeleton className="h-4 w-full mb-1 rounded" />
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area Skeleton */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}