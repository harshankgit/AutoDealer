'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car, Users, Shield, MessageCircle, Search, Star, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import TypingEffect from '@/components/typing/TypingEffect';
import AnimatedCounter from '@/components/ui/animated-counter';
import { motion } from 'framer-motion';
import MonthlyVisitorsChart from '@/components/charts/MonthlyVisitorsChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import BookingChart from '@/components/charts/BookingChart';
import dynamic from 'next/dynamic';
import { LoadingLink } from '@/components/ui/LoadingLink';
import ChatbotComponent from '@/components/chatbot/ChatbotComponent';
import SimpleCarPriceEstimator from '@/components/CarPriceEstimator/SimpleCarPriceEstimator';

interface HomePageStats {
  totalUsers: number;
  totalShowrooms: number;
  totalCars: number;
  totalVisits: number;
  monthlyVisits: { month: string; count: number }[];
  userGrowthData: { month: string; count: number }[];
  carDistributionData: { brand: string; count: number }[];
  monthlyBookings: { month: string; count: number; revenue: number; pending: number; confirmed: number; completed: number }[];
  performanceMetrics?: {
    avgVisitDuration: string;
    bounceRate: string;
    conversionRate: string;
    pageViews: number;
    topPerformingPages: { path: string; percentage: string }[];
  };
}

// Dynamically import the FirstVisitAnimation component to avoid SSR issues
const FirstVisitAnimation = dynamic(() => import('@/components/animations/FirstVisitAnimation'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />
});

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<HomePageStats>({
    totalUsers: 0,
    totalShowrooms: 0,
    totalCars: 0,
    totalVisits: 0,
    monthlyVisits: [],
    userGrowthData: [],
    carDistributionData: [],
    monthlyBookings: [],
    performanceMetrics: {
      avgVisitDuration: '3m 45s',
      bounceRate: '32.4%',
      conversionRate: '4.7%',
      pageViews: 24800,
      topPerformingPages: [
        { path: '/cars', percentage: '32.4%' },
        { path: '/rooms', percentage: '24.1%' },
        { path: '/dashboard', percentage: '18.7%' }
      ]
    }
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [visits, setVisits] = useState<number>(0);
  const defaultCenterOwner = 'Harshank Kanungo';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    // Fetch basic platform stats with no-cache
    fetch('/api/stats', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(prev => ({
            ...prev,
            totalUsers: Number(data.totalUsers) || prev.totalUsers,
            totalShowrooms: Number(data.totalShowrooms) || prev.totalShowrooms
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching basic stats:', error);
      });

    // Fetch visits data with no-cache
    fetch('/api/visits', { method: 'POST', cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && typeof data.count === 'number') {
          setVisits(data.count);
          // Update the totalVisits in stats as well
          setStats(prev => ({
            ...prev,
            totalVisits: data.count
          }));
        } else {
          setVisits(prev => prev);
        }
      })
      .catch((error) => {
        console.error('Error fetching visits:', error);
        setVisits(prev => prev);
      });

    // Fetch detailed stats for charts with no-cache
    fetch('/api/homepage/stats', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(prev => ({
            ...prev,
            totalUsers: data.totalUsers || prev.totalUsers,
            totalShowrooms: data.totalShowrooms || prev.totalShowrooms,
            totalCars: data.totalCars || prev.totalCars,
            totalVisits: data.totalVisits || prev.totalVisits,
            monthlyVisits: data.monthlyVisits || prev.monthlyVisits,
            userGrowthData: data.userGrowthData || prev.userGrowthData,
            carDistributionData: data.carDistributionData || prev.carDistributionData,
            performanceMetrics: data.performanceMetrics || prev.performanceMetrics
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching homepage stats:', error);
      })
      .finally(() => {
        // Fetch monthly booking data after homepage stats are loaded
        fetch('/api/monthly-bookings', { cache: 'no-store' })
          .then((res) => res.json())
          .then((bookingData) => {
            // Update monthlyBookings even if there's an error (it will be empty array)
            setStats(prev => ({
              ...prev,
              monthlyBookings: bookingData.monthlyBookings || prev.monthlyBookings || []
            }));
          })
          .catch((error) => {
            console.error('Error fetching monthly booking data:', error);
            // Set empty array in case of error
            setStats(prev => ({
              ...prev,
              monthlyBookings: []
            }));
          })
          .finally(() => {
            setChartsLoading(false);
            setStatsLoading(false);
          });
      });
  }, []);

  const content = (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Find Your Perfect Car</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Browse through multiple car selling centers, connect directly with dealers, and find your dream car with our room-based platform.
            </p>

            <TypingEffect text="Hi! Is the car still available?" speed={45} loop erase pause={1200} />

            <div className="mt-8">
              <TypingEffect text="Car Selling Centers" speed={120} loop erase pause={1600} className="w-full text-center text-3xl sm:text-4xl md:text-6xl font-extrabold text-primary" />
            </div>

            <div className="mt-6">
              <TypingEffect
                text={`${defaultCenterOwner}'s Showroom — Trusted Dealer`}
                speed={50}
                loop
                erase
                pause={2200}
                className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg sm:text-xl md:text-2xl font-semibold"
              />
            </div>

            {!chartsLoading && stats ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl mx-auto my-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <AnimatedCounter value={stats.totalUsers || 0} duration={1400} className="text-3xl font-bold text-foreground" />
                    <div className="text-xs text-muted-foreground mt-1">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <AnimatedCounter value={stats.totalShowrooms || 0} duration={1400} className="text-3xl font-bold text-foreground" />
                    <div className="text-xs text-muted-foreground mt-1">Showrooms</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <AnimatedCounter value={stats.totalVisits || 0} duration={1400} className="text-2xl font-bold text-foreground" />
                    <div className="text-xs text-muted-foreground mt-1">Total Visits</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-4xl mx-auto my-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
              {user ? (
                <>
                  <LoadingLink href="/rooms" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:opacity-95">Browse Showrooms</Button>
                  </LoadingLink>
                  {user.role === 'admin' && (
                    <>
                      <LoadingLink href="/dashboard" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full">
                          Chat System
                        </Button>
                      </LoadingLink>
                      <LoadingLink href="/admin" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full">
                          Manage Your Showroom
                        </Button>
                      </LoadingLink>
                    </>
                  )}
                </>
              ) : (
                <>
                  <LoadingLink href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:opacity-95">Get Started</Button>
                  </LoadingLink>
                  <LoadingLink href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline">Sign In</Button>
                  </LoadingLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Car Price Estimator Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            AI-Powered Car Price Estimator
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get an instant, accurate estimate of your car's market value with our AI technology
          </p>
        </div>

        <div className="flex justify-center">
          <SimpleCarPriceEstimator compact={true} />
        </div>
      </div>

      {/* Charts Section */}
      {!chartsLoading && stats ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Platform Analytics</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
                  Real-time insights and analytics about user activity, car inventory, and platform performance.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatsLoading(true);
                  setChartsLoading(true);
                  // Refetch all stats with no-cache headers
                  fetch('/api/stats', { cache: 'no-store' })
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.error) {
                        setStats(prev => ({
                          ...prev,
                          totalUsers: Number(data.totalUsers) || prev.totalUsers,
                          totalShowrooms: Number(data.totalShowrooms) || prev.totalShowrooms
                        }));
                      }
                    })
                    .catch((error) => {
                      console.error('Error fetching basic stats:', error);
                    });

                  // Fetch visits data
                  fetch('/api/visits', { method: 'POST', cache: 'no-store' })
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.error && typeof data.count === 'number') {
                        setVisits(data.count);
                        setStats(prev => ({
                          ...prev,
                          totalVisits: data.count
                        }));
                      } else {
                        setVisits(prev => prev);
                      }
                    })
                    .catch((error) => {
                      console.error('Error fetching visits:', error);
                      setVisits(prev => prev);
                    });

                  // Fetch detailed stats for charts with no-cache headers
                  fetch('/api/homepage/stats', { cache: 'no-store' })
                    .then((res) => res.json())
                    .then((data) => {
                      if (!data.error) {
                        setStats(prev => ({
                          ...prev,
                          totalUsers: data.totalUsers || prev.totalUsers,
                          totalShowrooms: data.totalShowrooms || prev.totalShowrooms,
                          totalCars: data.totalCars || prev.totalCars,
                          totalVisits: data.totalVisits || prev.totalVisits,
                          monthlyVisits: data.monthlyVisits || prev.monthlyVisits,
                          userGrowthData: data.userGrowthData || prev.userGrowthData,
                          carDistributionData: data.carDistributionData || prev.carDistributionData,
                          performanceMetrics: data.performanceMetrics || prev.performanceMetrics
                        }));
                      }
                    })
                    .catch((error) => {
                      console.error('Error fetching homepage stats:', error);
                    })
                    .finally(() => {
                      // Fetch monthly booking data after homepage stats are loaded
                      fetch('/api/monthly-bookings', { cache: 'no-store' })
                        .then((res) => res.json())
                        .then((bookingData) => {
                          // Update monthlyBookings even if there's an error (it will be empty array)
                          setStats(prev => ({
                            ...prev,
                            monthlyBookings: bookingData.monthlyBookings || prev.monthlyBookings || []
                          }));
                        })
                        .catch((error) => {
                          console.error('Error fetching monthly booking data:', error);
                          // Set empty array in case of error
                          setStats(prev => ({
                            ...prev,
                            monthlyBookings: []
                          }));
                        })
                        .finally(() => {
                          setChartsLoading(false);
                          setStatsLoading(false);
                        });
                    });
                }}
                disabled={statsLoading || chartsLoading}
                className="flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${statsLoading || chartsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Monthly Visits Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
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
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <MonthlyVisitorsChart
                      data={{
                        labels: stats.monthlyVisits.map(item => item.month),
                        datasets: [
                          {
                            label: 'Visitors',
                            data: stats.monthlyVisits.map(item => item.count),
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',    // Blue
                              'rgba(147, 51, 234, 0.8)',    // Purple
                              'rgba(2, 132, 199, 0.8)',     // Light Blue
                              'rgba(34, 197, 94, 0.8)',     // Green
                              'rgba(245, 158, 11, 0.8)',    // Yellow
                              'rgba(239, 68, 68, 0.8)',     // Red
                              'rgba(168, 85, 247, 0.8)',    // Indigo
                              'rgba(6, 182, 212, 0.8)',     // Teal
                              'rgba(234, 179, 8, 0.8)',     // Amber
                              'rgba(190, 24, 93, 0.8)',     // Pink
                              'rgba(107, 114, 142, 0.8)',   // Gray
                              'rgba(249, 115, 22, 0.8)',    // Orange
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',      // Blue
                              'rgba(147, 51, 234, 1)',      // Purple
                              'rgba(2, 132, 199, 1)',       // Light Blue
                              'rgba(34, 197, 94, 1)',       // Green
                              'rgba(245, 158, 11, 1)',      // Yellow
                              'rgba(239, 68, 68, 1)',       // Red
                              'rgba(168, 85, 247, 1)',      // Indigo
                              'rgba(6, 182, 212, 1)',       // Teal
                              'rgba(234, 179, 8, 1)',       // Amber
                              'rgba(190, 24, 93, 1)',       // Pink
                              'rgba(107, 114, 142, 1)',     // Gray
                              'rgba(249, 115, 22, 1)',      // Orange
                            ],
                            borderWidth: 1,
                          }
                        ]
                      }}
                      title="Monthly Visitors"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
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
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <LineChart
                      data={{
                        labels: stats.userGrowthData.map(item => item.month),
                        datasets: [
                          {
                            label: 'New Users',
                            data: stats.userGrowthData.map(item => item.count),
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true,
                          }
                        ]
                      }}
                      title="User Growth"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Car Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
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
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <PieChart
                      data={{
                        labels: stats.carDistributionData.map(item => item.brand),
                        datasets: [
                          {
                            data: stats.carDistributionData.map(item => item.count),
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',    // Blue
                              'rgba(147, 51, 234, 0.8)',    // Purple
                              'rgba(2, 132, 199, 0.8)',     // Light Blue
                              'rgba(34, 197, 94, 0.8)',     // Green
                              'rgba(245, 158, 11, 0.8)',    // Yellow
                              'rgba(239, 68, 68, 0.8)',     // Red
                              'rgba(168, 85, 247, 0.8)',    // Indigo
                              'rgba(6, 182, 212, 0.8)',     // Teal
                            ],
                            borderWidth: 2,
                          }
                        ]
                      }}
                      title="Car Distribution"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Bookings Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Monthly Bookings
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">
                    Booking trends by month for the past year
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="w-full h-64 sm:h-72 md:h-80">
                    <BookingChart
                      data={{
                        labels: stats.monthlyBookings.map(item => item.month),
                        datasets: [
                          {
                            label: 'Bookings',
                            data: stats.monthlyBookings.map(item => item.count),
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true,
                          }
                        ]
                      }}
                      title="Monthly Bookings"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

   

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Find Your Next Car?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who found their perfect car through AutoDealer.</p>
          <div className="w-full max-w-xs mx-auto space-y-3">
            <LoadingLink href={user ? '/rooms' : '/register'}>
              <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200">
                {user ? 'Browse Cars Now' : 'Start Your Journey'}
              </Button>
            </LoadingLink>
            <LoadingLink href="/find-perfect-car">
              <Button size="lg" variant="outline" className="w-full">
                Find My Perfect Car
              </Button>
            </LoadingLink>
            <LoadingLink href="/estimate-car-value">
              <Button size="lg" variant="outline" className="w-full">
                Estimate Car Value
              </Button>
            </LoadingLink>
          </div>
        </div>
      </div>

      {/* Bottom animated totals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 shadow text-center">
            <div className="text-sm text-muted-foreground">Total Users</div>
            <AnimatedCounter value={Number(stats?.totalUsers || 0)} duration={1400} className="text-2xl sm:text-3xl font-bold text-foreground" />
          </div>

          <div className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 shadow text-center">
            <div className="text-sm text-muted-foreground">Total Visits</div>
            <AnimatedCounter value={Number(stats?.totalVisits || 0)} duration={1400} className="text-2xl sm:text-3xl font-bold text-foreground" />
          </div>
        </div>

        {/* Footer with owner details */}
        <footer className="border-t mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center text-center sm:text-left sm:items-start gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} CarSelling — Built by Harshank Kanungo</div>
            <div className="flex items-center gap-4">
              <LoadingLink href="/contact" className="hover:underline">Contact</LoadingLink>
              <LoadingLink href="/rooms" className="hover:underline">Showrooms</LoadingLink>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );

  return (
    <>
      <FirstVisitAnimation>{content}</FirstVisitAnimation>
      <ChatbotComponent />
    </>
  );
}