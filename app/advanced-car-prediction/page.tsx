// app/advanced-car-prediction/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Star, Fuel, Gauge, Calendar, MapPin, Users, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AdvancedCarPredictionSystem from '@/components/CarPrediction/AdvancedCarPredictionSystem';

export default function AdvancedCarPredictionPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                <Zap className="h-4 w-4 mr-1" />
                AI-Powered Prediction
              </Badge>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Advanced Car Price Prediction
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get an accurate, real-time estimate of your car's market value using our advanced AI algorithm.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <Award className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>Accurate Predictions</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Real-time Market Data</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <Zap className="h-5 w-5 text-purple-500" />
                <span>Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Section */}
          <div className="lg:col-span-1">
            <Card className="h-full sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Our AI analyzes multiple factors to predict your car's market value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center">
                      1
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold">Enter Car Details</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Provide comprehensive information about your car
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center">
                      2
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our algorithm analyzes market trends and comparable sales
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Get Prediction</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive accurate market value with detailed insights
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="font-semibold mb-2">Key Factors Analyzed</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Brand and model reputation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Year, mileage, and condition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Fuel type and transmission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Location-based market trends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Additional features and specifications</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prediction System */}
          <div className="lg:col-span-2">
            <AdvancedCarPredictionSystem />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Advanced Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>Accurate Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI algorithm analyzes thousands of data points to provide the most accurate price predictions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <CardTitle>Real-time Market Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Predictions are based on current market trends and recent sales data in your area.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle>Detailed Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get comprehensive analysis of factors affecting your car's value with actionable recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}