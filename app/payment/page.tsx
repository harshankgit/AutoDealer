"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { Loader2, CreditCard, Calendar } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Payment Information
        </h1>

        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white text-center">
              <CreditCard className="h-10 w-10 mx-auto text-blue-600 mb-3" />
              Make Payment for Your Car Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              To make a payment for your car booking, please follow these steps:
            </p>

            <div className="space-y-4 mb-6 text-left">
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  1
                </div>
                <p className="text-gray-700 dark:text-gray-300">Go to your <strong>Bookings</strong> page</p>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  2
                </div>
                <p className="text-gray-700 dark:text-gray-300">Find your active booking for the car</p>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  3
                </div>
                <p className="text-gray-700 dark:text-gray-300">Click on the <strong>"Make Payment"</strong> button</p>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0">
                  4
                </div>
                <p className="text-gray-700 dark:text-gray-300">Complete the payment form with amount and receipt</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 dark:bg-yellow-900/20 dark:border-yellow-800 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Important Information</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Coordinate with Dealer:</strong> Please contact the dealer directly to discuss and confirm the exact payment amount before making the payment.
                After making the payment, upload the receipt and submit the payment details for verification.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/bookings")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View My Bookings
              </Button>

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="dark:text-white"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}