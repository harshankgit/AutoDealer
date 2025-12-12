'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Home, Car, BarChart3, Settings, Loader2, Trash2, Edit, Eye, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  adminid: {
    username: string;
    email: string;
  } | null;
  createdAt: string;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  ownershipHistory: string;
  images: string[];
  description: string;
  condition: string;
  availability: string;
  specifications: {
    engine?: string;
    power?: string;
    torque?: string;
    acceleration?: string;
    topSpeed?: string;
    features?: string[];
  };
  roomid: {
    id: string;
    name: string;
  };
  adminid: {
    username: string;
    email: string;
  } | null;
  createdAt: string;
}

interface Booking {
  id: string;
  carId: {
    title: string;
    brand: string;
    model: string;
  };
  userId: {
    username: string;
    email: string;
  };
  roomid: {
    name: string;
  };
  bookingDetails: {
    phone: string;
    notes: string;
  };
  status: string;
  createdAt: string;
}

interface Payment {
  id: string;
  bookingId: {
    id: string;
    status: string;
  };
  userId: {
    username: string;
    email: string;
  };
  carId: {
    title: string;
    brand: string;
    model: string;
  };
  roomid: {
    name: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate: string;
  createdAt: string;
}

interface Chat {
  id: string;
  carId: {
    title: string;
    images: string[];
  };
  userId: {
    username: string;
    email: string;
  };
  adminid: {
    username: string;
    email: string;
  };
  lastMessage: {
    message: string;
    timestamp: string;
    senderId: {
      username: string;
    };
  } | null;
  updatedAt: string;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalShowrooms: 0,
    totalCars: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalSuperAdmins: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading } = useUser(); // Use context instead of local state

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'superadmin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchSuperAdminData();
    }
  }, [user, loading, router]);

  const fetchSuperAdminData = async () => {
    try {
      // Fetch all statistics from a single API endpoint - this is more efficient
      const statsResponse = await fetch('/api/superadmin/stats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`, // Use context user token
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();

        // Set the main stats from the single API call
        setStats(statsData.stats);

        // Fetch all detailed lists in parallel for populating the tabs
        const [
          usersResponse,
          roomsResponse,
          carsResponse,
          bookingsResponse,
          paymentsResponse,
          chatsResponse
        ] = await Promise.all([
          fetch('/api/superadmin/users', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch('/api/superadmin/rooms', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch('/api/superadmin/cars', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch('/api/superadmin/bookings', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch('/api/superadmin/payments', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch('/api/superadmin/chats', {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          })
        ]);

        // Process responses in parallel
        const [usersData, roomsData, carsData, bookingsData, paymentsData, chatsData] = await Promise.all([
          usersResponse.json().catch(() => ({ users: [] })),
          roomsResponse.json().catch(() => ({ rooms: [] })),
          carsResponse.json().catch(() => ({ cars: [] })),
          bookingsResponse.json().catch(() => ({ bookings: [] })),
          paymentsResponse.json().catch(() => ({ payments: [] })),
          chatsResponse.json().catch(() => ({ chats: [] }))
        ]);

        setUsers(usersData.users || []);
        setRooms(roomsData.rooms || []);
        setCars(carsData.cars || []);
        setBookings(bookingsData.bookings || []);
        setPayments(paymentsData.payments || []);
        setChats(chatsData.chats || []);
      } else {
        setError('Failed to fetch statistics');
      }
    } catch (error) {
      setError('Failed to fetch super admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`, // Use context user token
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setError('User deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/superadmin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`, // Use context user token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => user.id === userId ? updatedUser : user));
        setError('User role updated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const deleteRoom = async (roomid: string) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/rooms/${roomid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`, // Use context user token
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== roomid));
        setError('Room deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete room');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const deleteCar = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/cars/${carId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`, // Use context user token
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCars(cars.filter(car => car.id !== carId));
        setError('Car deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete car');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  if (loading || isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage all users, showrooms, and system settings.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="showrooms">Showrooms</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Admins</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAdmins}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Dealer accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Showrooms</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalShowrooms}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Active showrooms
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Cars</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalCars}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Total cars listed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Bookings</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Total bookings
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Payments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalPayments}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Total payments
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-200">Super Admins</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalSuperAdmins}</div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    System administrators
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/admin/rooms">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <Home className="h-6 w-6 mb-2" />
                      Manage Showrooms
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button className="w-full h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Users</h2>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No users found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no users in the system yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' :
                              user.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <select
                                value={user.role}
                                onChange={(e) => changeUserRole(user.id, e.target.value)}
                                className="text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                              </select>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                disabled={user.role === 'superadmin' && user.id === (JSON.parse(localStorage.getItem('user') || '{}')).id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

          <TabsContent value="showrooms" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Showrooms</h2>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-16">
                <Home className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No showrooms found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no showrooms in the system yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Card key={room.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg dark:text-white flex justify-between items-start">
                        <span>{room.name}</span>
                        <span className="text-xs font-normal bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          by {room.adminid?.username || 'Unknown'}
                        </span>
                      </CardTitle>
                      <CardDescription className="dark:text-gray-300">
                        {room.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          {room.image ? (
                            <img
                              src={room.image}
                              alt={room.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Home className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{room.description}</p>
                        <div className="flex gap-2 pt-2">
                          <Link href={`/rooms/${room.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/edit-room/${room.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cars" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Cars</h2>
            </div>

            {cars.length === 0 ? (
              <div className="text-center py-16">
                <Car className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No cars found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no cars in the system yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Showroom</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {cars.map((car) => (
                        <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                {car.brand.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{car.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{car.year} {car.model}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{typeof car.roomid === 'object' ? car.roomid.id : car.roomid}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            ₹{car.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              car.availability === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              car.availability === 'Sold' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400'
                            }`}>
                              {car.availability}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link href={`/cars/${car.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/edit-car/${car.id}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </Link>
                              <button
                                onClick={() => deleteCar(car.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Bookings</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No bookings found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no bookings in the system yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Showroom</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.carId.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.carId.brand} {booking.carId.model}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.userId.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{typeof booking.roomid === 'object' ? booking.roomid.name : booking.roomid}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{booking.bookingDetails.phone}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Payments</h2>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No payments found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no payments in the system yet.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Car</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.carId.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{payment.carId.brand} {payment.carId.model}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{payment.userId.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ₹{payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{payment.paymentMethod}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              payment.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                              payment.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' :
                              'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                            }`}>
                              {payment.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">All Chats</h2>
              <Link href="/admin/superadmin/chats">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  Open Chat Panel
                </Button>
              </Link>
            </div>

            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Chat Panel Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Use the chat panel to manage all conversations</p>
              <Link href="/admin/superadmin/chats">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  Go to Chat Panel
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">System Settings</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage system-wide configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium dark:text-white">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                      <p className="font-semibold dark:text-white">{stats.totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total Showrooms</p>
                      <p className="font-semibold dark:text-white">{stats.totalShowrooms}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t dark:border-gray-700">
                    <h3 className="text-lg font-medium dark:text-white">Actions</h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Export User Data
                      </Button>
                      <Button variant="outline" className="bg-red-600 hover:bg-red-700 text-white">
                        System Backup
                      </Button>
                      <Button variant="outline">
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}