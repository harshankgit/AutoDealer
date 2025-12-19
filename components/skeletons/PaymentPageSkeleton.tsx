import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, Calendar, Upload, CreditCard, AlertCircle } from 'lucide-react';

export function PaymentPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Skeleton className="h-10 w-24 rounded-md mr-4" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-3/4 mx-auto rounded" />
          <Skeleton className="h-4 w-1/2 mx-auto rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Info Skeleton */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="space-y-6">
              {/* Card Header */}
              <Skeleton className="h-6 w-1/2 rounded" />
              
              {/* Car Details */}
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-16 mb-2 rounded" />
                  <Skeleton className="h-5 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-3 w-20 mb-2 rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-20 mb-2 rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                  </div>
                </div>

                <div>
                  <Skeleton className="h-3 w-12 mb-2 rounded" />
                  <Skeleton className="h-5 w-1/2 rounded" />
                </div>

                {/* Admin Scanner Section */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full mt-3 rounded" />
                  <Skeleton className="h-2 w-4/5 mt-1 rounded" />
                  <div className="mt-4 flex justify-center">
                    <Skeleton className="w-full h-32 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Form Skeleton */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 p-6">
            <div className="space-y-6">
              {/* Card Header */}
              <div className="space-y-2">
                <Skeleton className="h-7 w-1/3 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>

              {/* Important Note */}
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <Skeleton className="h-3 w-1/4 rounded" />
                </div>
                <Skeleton className="h-2 w-full mt-2 rounded" />
                <Skeleton className="h-2 w-4/5 mt-1 rounded" />
              </div>

              {/* Payment Amount */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-3 w-24 mb-2 rounded" />
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Skeleton className="h-10 w-full pl-10 rounded" />
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-3 w-24 mb-2 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <Skeleton className="h-3 w-32 mb-2 rounded" />
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Skeleton className="h-10 w-full pl-10 rounded" />
                  </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center mb-3">
                      <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <Skeleton className="h-4 w-1/4 rounded" />
                    </div>
                    <Skeleton className="h-2 w-1/3 mb-3 rounded" />
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <Skeleton className="h-3 w-24 mx-auto rounded" />
                        <Skeleton className="h-2 w-1/4 mx-auto rounded" />
                        <Skeleton className="h-2 w-1/2 mx-auto rounded mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}