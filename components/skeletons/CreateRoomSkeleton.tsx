import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CreateRoomSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Skeleton className="h-10 w-40 rounded" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-8 w-72 mx-auto mb-2 rounded" />
          <Skeleton className="h-5 w-96 mx-auto rounded" />
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 p-6">
          <Skeleton className="h-6 w-40 mb-2 rounded" />
          <Skeleton className="h-4 w-64 mb-4 rounded" />
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-20 w-full rounded" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-11 w-full rounded" />
              <Skeleton className="h-4 w-64 rounded" />
              <Skeleton className="h-11 w-full rounded" />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-80 rounded" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded" />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Skeleton className="h-11 flex-1 rounded" />
              <Skeleton className="h-11 flex-1 rounded" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}