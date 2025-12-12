import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RoomCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="relative h-48 overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <Skeleton className="h-6 w-32 mb-1 rounded" />
          <div className="flex items-center">
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-3/4 mb-4 rounded" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-1 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded" />
      </div>
    </Card>
  );
}