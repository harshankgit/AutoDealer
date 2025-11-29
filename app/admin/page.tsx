'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Car, Home, BarChart3, MessageCircle, Settings, Loader2, Trash2, Bell, Calendar, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications';
import NotificationBadge, { NotificationItem } from '@/components/ui/notification-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  availability: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [room, setRoom] = useState<Room | null>(null);
  interface Booking {
    id: string;
    carId: {
      id: string;
      title: string;
      brand: string;
      model: string;
      year: number;
    } | string; // Could be string if not populated
    userId: {
      id: string;
      username: string;
      email: string;
    } | string; // Could be string if not populated
    roomId: string;
    status: string;
    bookingDetails: {
      phone: string;
      notes?: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    soldCars: 0,
    totalViews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser(); // Use context instead of local state
  const { notifications, unreadCount, addNotification } = useRealtimeNotifications();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Super admins should go to the superadmin dashboard
    if (user && user.role === 'superadmin') {
      router.push('/admin/superadmin');
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      // Fetch admin's room
      const roomResponse = await fetch('/api/admin/room', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (roomResponse.ok) {
        const roomData = await roomResponse.json();
        setRoom(roomData.room);

        // Fetch cars if room exists
        if (roomData.room) {
          // Fetch cars and bookings in parallel
          const [carsResponse, bookingsResponse] = await Promise.all([
            fetch(`/api/cars?roomId=${roomData.room.id}`, {
              headers: { 'Authorization': `Bearer ${user?.token}` },
            }),
            fetch('/api/admin/bookings', {
              headers: { 'Authorization': `Bearer ${user?.token}` },
            })
          ]);

          if (carsResponse.ok) {
            const carsData = await carsResponse.json();
            setCars(carsData.cars);

            // Calculate stats
            const totalCars = carsData.cars.length;
            const availableCars = carsData.cars.filter((car: Car) => car.availability === 'Available').length;
            const soldCars = carsData.cars.filter((car: Car) => car.availability === 'Sold').length;

            setStats({
              totalCars,
              availableCars,
              soldCars,
              totalViews: totalCars * 15, // Mock data
            });
          }
          
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            setBookings(bookingsData.bookings || []);
          }
        }
      }
    } catch (error) {
      setError('Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { // Changed locale to en-IN
      style: 'currency',
      currency: 'INR', // Changed currency to INR
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteRoom = async () => {
    if (!room || !window.confirm('Are you sure you want to delete this showroom? All associated cars will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete showroom');
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (error: any) {
      console.error('Error deleting room:', error);
      setError(error.message || 'Failed to delete showroom. Please try again.');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          bookingId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const data = await response.json();

      // Update the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, updatedAt: data.booking.updatedAt }
            : booking
        )
      );

      // Show success message (you can use a toast library if you have one)
      alert('Booking status updated successfully!');
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      alert(error.message || 'Failed to update booking status');
    }
  };

  const handleStatusConfirm = () => {
    if (currentBookingId) {
      handleStatusChange(currentBookingId, currentStatus);
      setIsStatusModalOpen(false);
      setCurrentBookingId('');
      setCurrentStatus('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your showroom and car listings from your admin dashboard.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBadge
              notifications={notifications.map(n => ({
                ...n,
                timestamp: n.timestamp || new Date(),
                type: n.type || 'notification'
              }))}
              unreadCount={unreadCount}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onNotificationClick={() => {}}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {!room ? (
          /* No Room Created */
          <div className="text-center py-16">
            <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
              Create Your Showroom
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              You haven't created a showroom yet. Create your virtual showroom to start 
              adding and managing your car listings.
            </p>
            <Link href="/admin/create-room">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                <Plus className="h-5 w-5 mr-2" />
                Create Showroom
              </Button>
            </Link>
          </div>
        ) : (
          /* Dashboard with Room */
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cars">Cars</TabsTrigger>
              <TabsTrigger value="room">Showroom</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Total Cars</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">{stats.totalCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      All cars in your showroom
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Available</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.availableCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Ready for sale
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Sold</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.soldCars}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Successfully sold
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium dark:text-gray-200">Total Views</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold dark:text-white">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      Car page views
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Common tasks to manage your showroom
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/add-car">
                      <Button className="w-full h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                        <Plus className="h-6 w-6 mb-2" />
                        Add New Car
                      </Button>
                    </Link>
                    <Link href={`/rooms/${room.id}`}>
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <Home className="h-6 w-6 mb-2" />
                        View Showroom
                      </Button>
                    </Link>
                    <Link href="/admin/chats">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <MessageCircle className="h-6 w-6 mb-2" />
                        View Messages
                      </Button>
                    </Link>
                    <Link href="/admin/bookings">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                        <Calendar className="h-6 w-6 mb-2" />
                        View Bookings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Cars */}
              {cars.length > 0 && (
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Recent Cars</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Your latest car listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cars.slice(0, 5).map((car) => (
                        <div key={car.id} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg">
                          <div>
                            <h4 className="font-medium dark:text-white">{car.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {car.year} {car.brand} {car.model}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 dark:text-blue-400">{formatPrice(car.price)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{car.availability}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="cars" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Your Cars</h2>
                <Link href="/admin/add-car">
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Car
                  </Button>
                </Link>
              </div>

              {cars.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No cars yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first car to start selling.</p>
                  <Link href="/admin/add-car">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Car
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <Card key={car.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-lg dark:text-white">{car.title}</CardTitle>
                        <CardDescription className="dark:text-gray-300">
                          {car.year} {car.brand} {car.model}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-blue-600">
                              {formatPrice(car.price)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              car.availability === 'Available' 
                                ? 'bg-green-100 text-green-800'
                                : car.availability === 'Sold'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {car.availability}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Link href={`/cars/${car.id}`} className="flex-1 min-w-[70px]">
                              <Button variant="outline" size="sm" className="w-full">
                                <span className="hidden sm:inline">View</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden">
                                  <path d="M2 12s3-7.5 10-7.5 10 7.5 10 7.5-3 7.5-10 7.5S2 12 2 12z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </Button>
                            </Link>
                            <Link href={`/admin/edit-car/${car.id}`} className="flex-1 min-w-[70px]">
                              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <span className="hidden sm:inline">Edit</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                </svg>
                              </Button>
                            </Link>
                            {car.availability === 'Booked' && (
                              <Link href={`/admin/chats?carId=${car.id}`} className="flex-1 min-w-[70px]">
                                <Button size="sm" variant="outline" className="w-full bg-green-100 hover:bg-green-50 text-green-700 border-green-200">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Chat</span>
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="room" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold dark:text-white">Showroom Settings</h2>
                <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                  <Link href={`/admin/edit-room/${room.id}`}>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Showroom
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRoom}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Showroom
                  </Button>
                </div>
              </div>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">{room.name}</CardTitle>
                  <CardDescription className="dark:text-gray-300">{room.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      {room.image ? (
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Home className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{room.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        room.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">Car Bookings & Messages</h2>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No active bookings or messages</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">When customers book your cars or send messages, they'll appear here.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {typeof booking.carId === 'object' && booking.carId ? booking.carId.title : 'Car not found'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {typeof booking.carId === 'object' && booking.carId ? `${booking.carId.year} ${booking.carId.brand} ${booking.carId.model}` : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {typeof booking.userId === 'object' && booking.userId ? booking.userId.username : 'Customer'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-300">
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {booking.bookingDetails?.phone || 'N/A'}
                                </div>
                                {typeof booking.userId === 'object' && booking.userId?.email && (
                                  <div className="flex items-center mt-1">
                                    <Mail className="w-4 h-4 mr-1" />
                                    {booking.userId.email}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                                booking.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' :
                                'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex flex-col sm:flex-row gap-2">
                                {typeof booking.carId === 'object' && typeof booking.userId === 'object' && booking.carId?.id && booking.userId?.id && (
                                  <Link href={`/admin/chats?carId=${booking.carId.id}&userId=${booking.userId.id}`}>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Chat
                                    </Button>
                                  </Link>
                                )}
                                {typeof booking.carId === 'object' && booking.carId?.id && (
                                  <Link href={`/cars/${booking.carId.id}`}>
                                    <Button variant="outline">
                                      View Car
                                    </Button>
                                  </Link>
                                )}
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 text-xs rounded border ${
                                    booking.status === 'Pending' ? 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300' :
                                    booking.status === 'Confirmed' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300' :
                                    booking.status === 'Completed' ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300' :
                                    'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                                  }`}>
                                    {booking.status}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentBookingId(booking.id);
                                      setCurrentStatus(booking.status);
                                      setIsStatusModalOpen(true);
                                    }}
                                    className="text-xs"
                                  >
                                    Change
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Select a new status for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </label>
              <Select value={currentStatus} onValueChange={setCurrentStatus}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusConfirm}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}