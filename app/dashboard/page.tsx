'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Car, MessageCircle, Eye, TrendingUp, BarChart3, TrendingDown } from 'lucide-react';
import { useUser } from '@/context/user-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MonthlyVisitorsChart from '@/components/charts/MonthlyVisitorsChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';

interface DashboardStats {
  totalUsers: number;
  totalShowrooms: number;
  totalCars: number;
  totalVisits: number;
  monthlyVisits: { month: string; count: number }[];
  userGrowthData?: { month: string; count: number }[];
  carDistributionData?: { brand: string; count: number }[];
}

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchDashboardStats();
    }
  }, [user, loading, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.username}! Here's what's happening with your platform.
          </p>
        </motion.div>

        {/* Stats Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>Up from last month</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Showrooms</CardTitle>
                <Car className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalShowrooms || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>Active showrooms</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cars</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalCars || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>Inventory count</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visits</CardTitle>
                <Eye className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalVisits || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  <span>Platform visitors</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Visits Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Monthly Visitors
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Visitors count by month for the past year
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {stats && stats.monthlyVisits && stats.monthlyVisits.length > 0 ? (
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <MonthlyVisitorsChart
                      data={{
                        labels: stats.monthlyVisits.map(item => item.month),
                        datasets: [
                          {
                            label: 'Visitors',
                            data: stats.monthlyVisits.map(item => item.count),
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.7)',
                              'rgba(147, 51, 234, 0.7)',
                              'rgba(2, 132, 199, 0.7)',
                              'rgba(34, 197, 94, 0.7)',
                              'rgba(245, 158, 11, 0.7)',
                              'rgba(239, 68, 68, 0.7)',
                              'rgba(168, 85, 247, 0.7)',
                              'rgba(6, 182, 212, 0.7)',
                              'rgba(234, 179, 8, 0.7)',
                              'rgba(190, 24, 93, 0.7)',
                              'rgba(107, 114, 142, 0.7)',
                              'rgba(249, 115, 22, 0.7)',
                            ],
                            borderColor: 'rgba(59, 130, 246, 1)', // Using single color for bar charts
                            borderWidth: 1,
                          }
                        ]
                      }}
                      title="Monthly Visitors"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <div className="text-center p-4">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No visitor data available
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Data will appear when visits are recorded
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* User Growth Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  User Growth
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  New users registered by month
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {stats && stats.userGrowthData && stats.userGrowthData.length > 0 ? (
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <LineChart
                      data={{
                        labels: stats.userGrowthData.map(item => item.month),
                        datasets: [
                          {
                            label: 'New Users',
                            data: stats.userGrowthData.map(item => item.count),
                            borderColor: 'rgb(72, 187, 120)',
                            backgroundColor: 'rgba(72, 187, 120, 0.1)',
                            tension: 0.4,
                            fill: true,
                          }
                        ]
                      }}
                      title="User Growth"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <div className="text-center p-4">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No user growth data available
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Data will appear when user data is collected
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Car Distribution Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Car className="h-5 w-5 text-purple-500" />
                  Car Distribution by Brand
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Distribution of cars by brand in your showrooms
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {stats && stats.carDistributionData && stats.carDistributionData.length > 0 ? (
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <PieChart
                      data={{
                        labels: stats.carDistributionData.map(item => item.brand),
                        datasets: [
                          {
                            data: stats.carDistributionData.map(item => item.count),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.8)',
                              'rgba(54, 162, 235, 0.8)',
                              'rgba(255, 206, 86, 0.8)',
                              'rgba(75, 192, 192, 0.8)',
                              'rgba(153, 102, 255, 0.8)',
                              'rgba(255, 159, 64, 0.8)',
                              'rgba(255, 107, 132, 0.8)',
                              'rgba(106, 162, 255, 0.8)',
                            ],
                            borderWidth: 2,
                          }
                        ]
                      }}
                      title="Car Distribution"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center">
                    <div className="text-center p-4">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No car distribution data available
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Data will appear when car data is collected
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                  Performance Metrics
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Avg. Visit Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white">3m 45s</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Bounce Rate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">32.4%</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Conversion Rate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">4.7%</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Page Views</p>
                    <p className="font-semibold text-gray-900 dark:text-white">24.8k</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Performing Pages</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">/cars</span>
                        <span className="font-medium text-gray-900 dark:text-white">32.4%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32.4%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">/rooms</span>
                        <span className="font-medium text-gray-900 dark:text-white">24.1%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '24.1%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">/dashboard</span>
                        <span className="font-medium text-gray-900 dark:text-white">18.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18.7%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Link href="/admin">
              <Button className="w-full h-32 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
                <Car className="h-8 w-8 mb-2" />
                <span className="font-medium">Manage Showroom</span>
              </Button>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/admin/cars">
              <Button className="w-full h-32 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
                <Car className="h-8 w-8 mb-2" />
                <span className="font-medium">Manage Cars</span>
              </Button>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/admin/messages">
              <Button className="w-full h-32 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center">
                <MessageCircle className="h-8 w-8 mb-2" />
                <span className="font-medium">Messages</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}