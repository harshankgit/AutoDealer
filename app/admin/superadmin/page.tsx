'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Home, Car, BarChart3, Settings, Loader2, Trash2, Edit, Eye, MessageCircle, Bot } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';
import SuperAdminImageUpload from '@/components/slider/SuperAdminImageUpload';
import ApiLogs from '@/components/slider/ApiLogs';
import { toast } from 'sonner';

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
  const [loggingEnabled, setLoggingEnabled] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
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

  const fetchLoggingSettings = async () => {
    try {
      const token = user?.token;
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/api-logging-toggle', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoggingEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error fetching logging settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleLogging = async (enabled: boolean) => {
    try {
      const token = user?.token;
      if (!token) {
        return;
      }

      const response = await fetch('/api/admin/api-logging-toggle', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enabled
        })
      });

      if (response.ok) {
        setLoggingEnabled(enabled);
      }
    } catch (error) {
      console.error('Error toggling logging:', error);
    }
  };

  const saveRetentionSettings = async () => {
    try {
      const token = user?.token;
      if (!token) {
        return;
      }

      const retentionInput = document.getElementById('retention-days') as HTMLInputElement;
      const retentionDays = parseInt(retentionInput?.value) || 30;

      // Update the API logging retention setting
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settingKey: 'api_log_retention_days',
          settingValue: retentionDays.toString()
        })
      });

      if (response.ok) {
        // Show success message
       toast.success(`Retention period updated to ${retentionDays} days`);
      } else {
        throw new Error('Failed to update retention settings');
      }
    } catch (error) {
      console.error('Error saving retention settings:', error);
      alert('Failed to save retention settings');
    }
  };

  // Fetch logging settings when component mounts
  useEffect(() => {
    if (user && user.role === 'superadmin') {
      fetchLoggingSettings();
    }
  }, [user]);

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
          <div className="w-full overflow-x-auto">
            <TabsList className="flex flex-wrap justify-start w-max min-w-full sm:w-auto sm:min-w-0 sm:justify-between sm:grid sm:grid-cols-11">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="showrooms" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Showrooms</TabsTrigger>
              <TabsTrigger value="cars" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Cars</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Bookings</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Payments</TabsTrigger>
              <TabsTrigger value="chats" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Chats</TabsTrigger>
              <TabsTrigger value="chatbot" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Chatbot</TabsTrigger>
              {user?.role === 'superadmin' && (
                <TabsTrigger value="slider" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Slider</TabsTrigger>
              )}
              {user?.role === 'superadmin' && (
                <TabsTrigger value="logs" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Logs</TabsTrigger>
              )}
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>
          </div>

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      View Dashboard
                    </Button>
                  </Link>
                  {user?.role === 'superadmin' && (
                    <Link href="/admin/api-logs">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center"
                      >
                        <BarChart3 className="h-6 w-6 mb-2" />
                        API Logs
                      </Button>
                    </Link>
                  )}
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
                              booking.status === 'Sold' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' :
                              booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400' :
                              booking.status === 'Booked' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' :
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

          <TabsContent value="slider" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white">Slider Management</h2>
            </div>

            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Manage Homepage Slider</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Upload and manage images for the homepage slider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <SuperAdminImageUpload />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user?.role === 'superadmin' && (
            <TabsContent value="logs" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">API Logs</h2>
              </div>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Monitor API Activity</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    View all API requests, errors, and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full">
                    <ApiLogs />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">System Settings</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* API Logging Section */}
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium dark:text-white mb-2">API Logging</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure API request logging and retention settings
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-medium dark:text-white">API Logging Status</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Toggle to enable or disable logging of all API requests
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                            {settingsLoading ? 'Loading...' : (loggingEnabled ? 'Enabled' : 'Disabled')}
                          </span>
                          <Switch
                            checked={loggingEnabled}
                            onCheckedChange={toggleLogging}
                            disabled={settingsLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Log Retention Section */}
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium dark:text-white mb-2">API Log Retention</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure how long API logs are retained before automatic deletion
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="retention-days" className="text-sm font-medium dark:text-gray-300 block mb-2">
                          Retention Period (Days)
                        </Label>
                        <Input
                          id="retention-days"
                          type="number"
                          defaultValue="30"
                          min="1"
                          max="365"
                          className="mt-1"
                          placeholder="Days to retain logs"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={saveRetentionSettings}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Cleanup Section */}
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium dark:text-white mb-2">Scheduled Cleanup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      API logs are automatically cleaned up daily based on the retention period
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium dark:text-white">Automatic Cleanup</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Runs daily at midnight server time</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  {/* System Information Section */}
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium dark:text-white mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                          <p className="font-semibold text-lg dark:text-white">{stats.totalUsers}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                          <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Showrooms</p>
                          <p className="font-semibold text-lg dark:text-white">{stats.totalShowrooms}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Actions Section */}
                  <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium dark:text-white mb-4">Other Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button variant="outline" className="justify-start bg-blue-600 hover:bg-blue-700 text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export User Data
                      </Button>
                      <Button variant="outline" className="justify-start bg-red-600 hover:bg-red-700 text-white">
                        <Settings className="h-4 w-4 mr-2" />
                        System Backup
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Loader2 className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="chatbot" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Bot className="h-5 w-5" />
                  Chatbot Management
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Manage chatbot questions, answers, and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Link href="/admin/chatbot">
                    <Card className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-500">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Bot className="h-10 w-10 mb-3 text-blue-500" />
                        <h3 className="font-semibold text-lg dark:text-white">Manage Questions & Answers</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add, edit, and organize chatbot Q&A pairs
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg dark:text-white mb-2">Quick Stats</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li className="flex justify-between">
                        <span>Total Questions:</span>
                        <span className="font-medium">0</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Active Questions:</span>
                        <span className="font-medium">0</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Response Rate:</span>
                        <span className="font-medium">0%</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg dark:text-white mb-2">Languages</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li className="flex justify-between">
                        <span>English:</span>
                        <span className="font-medium">✓</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Hindi:</span>
                        <span className="font-medium">✓</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Other:</span>
                        <span className="font-medium">-</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Chatbot Management</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                    Use this section to manage all chatbot questions and answers. You can create bilingual Q&A pairs,
                    organize them by category, and set their priority levels.
                  </p>
                  <Link href="/admin/chatbot">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                      Manage Chatbot Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}