'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Car, Users, Shield, MessageCircle, Search, Star, TrendingUp, BarChart3 } from 'lucide-react';
import TypingEffect from '@/components/typing/TypingEffect';
import AnimatedCounter from '@/components/ui/animated-counter';
import { motion } from 'framer-motion';
import MonthlyVisitorsChart from '@/components/charts/MonthlyVisitorsChart';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';

interface HomePageStats {
  totalUsers: number;
  totalShowrooms: number;
  totalCars: number;
  totalVisits: number;
  monthlyVisits: { month: string; count: number }[];
  userGrowthData: { month: string; count: number }[];
  carDistributionData: { brand: string; count: number }[];
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<HomePageStats>({
    totalUsers: 0,
    totalShowrooms: 0,
    totalCars: 0,
    totalVisits: 0,
    monthlyVisits: [],
    userGrowthData: [],
    carDistributionData: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [visits, setVisits] = useState<number>(0);
  const defaultCenterOwner = 'Harshank Kanungo';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    // Fetch basic platform stats
    fetch('/api/stats')
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
    fetch('/api/visits', { method: 'POST' })
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

    // Fetch detailed stats for charts
    fetch('/api/homepage/stats')
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
            carDistributionData: data.carDistributionData || prev.carDistributionData
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching homepage stats:', error);
      })
      .finally(() => {
        setChartsLoading(false);
        setStatsLoading(false);
      });
  }, []);

  return (
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
                    <AnimatedCounter value={stats.totalVisits || 0} duration={1400} className="text-3xl font-bold text-foreground" />
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
                  <Link href="/rooms" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:opacity-95">Browse Showrooms</Button>
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/admin" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full">
                          Manage Your Showroom
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-primary text-primary-foreground hover:opacity-95">Get Started</Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline">Sign In</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Platform Analytics</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Real-time insights and analytics about user activity, car inventory, and platform performance.
            </p>
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
                  <div className="w-full h-64 sm:h-72">
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
                  <div className="w-full h-64 sm:h-72">
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
                  <div className="w-full h-64 sm:h-72">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
        </motion.div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose AutoDealer?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Our unique room-based system provides a personalized car buying experience with direct dealer interaction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="dark:text-white">Multiple Showrooms</CardTitle>
              <CardDescription className="dark:text-gray-400">Browse cars from different dealers in their dedicated virtual showrooms.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="dark:text-white">Direct Chat</CardTitle>
              <CardDescription className="dark:text-gray-400">Chat directly with car dealers about specific vehicles you're interested in.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="dark:text-white">Secure Platform</CardTitle>
              <CardDescription className="dark:text-gray-400">Safe and secure platform with verified dealers and protected user data.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="dark:text-white">Advanced Search</CardTitle>
              <CardDescription className="dark:text-gray-400">Filter cars by brand, price, fuel type, and more to find exactly what you need.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="dark:text-white">Favorites List</CardTitle>
              <CardDescription className="dark:text-gray-400">Save your favorite cars and come back to them later for easy comparison.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="dark:text-white">Detailed Listings</CardTitle>
              <CardDescription className="dark:text-gray-400">Comprehensive car details including specifications, history, and high-quality images.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Find Your Next Car?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers who found their perfect car through AutoDealer.</p>
          <div className="w-full max-w-xs mx-auto">
            <Link href={user ? '/rooms' : '/register'}>
              <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-700 dark:hover:bg-gray-200">
                {user ? 'Browse Cars Now' : 'Start Your Journey'}
              </Button>
            </Link>
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
              <Link href="/contact" className="hover:underline">Contact</Link>
              <Link href="/rooms" className="hover:underline">Showrooms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}