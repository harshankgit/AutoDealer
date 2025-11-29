'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, Phone, Mail, MapPin, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';

interface Booking {
  id: string;
  carId: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  };
  roomId: {
    id: string;
    name: string;
    location: string;
  };
  bookingDetails: {
    phone: string;
    notes?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'user') {
      router.push('/');
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, loading, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error: any) {
      console.error('Fetch bookings error:', error);
      setError(error.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Button onClick={fetchBookings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Bookings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track the status of your car bookings
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Bookings Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">When you book a car, it will appear here.</p>
            <Link href="/rooms">
              <Button>Browse Cars</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg dark:text-white">
                        {booking.carId ? (
                          <>
                            {booking.carId.year} {booking.carId.brand} {booking.carId.model}
                          </>
                        ) : (
                          'Car details not available'
                        )}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {booking.carId?.title || 'No title available'}
                      </p>
                    </div>
                    <Badge 
                      className={`${
                        booking.status === 'Confirmed' ? 'bg-green-500' :
                        booking.status === 'Pending' ? 'bg-yellow-500' :
                        booking.status === 'Completed' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Car className="h-4 w-4 mr-2" />
                      <span className="font-medium">
                        {booking.carId?.price ? formatPrice(booking.carId.price) : 'Price not available'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {booking.roomId?.name || 'Showroom not specified'}
                        {booking.roomId?.location && `, ${booking.roomId.location}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{booking.bookingDetails.phone}</span>
                    </div>
                    
                    {booking.bookingDetails.notes && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Notes:</span> {booking.bookingDetails.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      <Link href={booking.carId?.id ? `/chat/${booking.carId.id}` : '#'}>
                        {!booking.carId?.id && (
                          <span className="sr-only">Chat not available</span>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat with dealer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}