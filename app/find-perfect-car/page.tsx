// app/find-perfect-car/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Star, Fuel, Gauge, Calendar, MapPin, Users, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import CarRecommendationSystem from '@/components/CarRecommendation/CarRecommendationSystem';
import Link from 'next/link';

export default function FindPerfectCarPage() {
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
                <Sparkles className="h-4 w-4 mr-1" />
                AI-Powered
              </Badge>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Find Your Perfect Car
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Answer a few questions and our AI will recommend the perfect car based on your preferences, budget, and needs.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>Personalized Recommendations</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <Car className="h-5 w-5 text-primary" />
                <span>Smart Matching</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow">
                <Gauge className="h-5 w-5 text-green-500" />
                <span>Best Value</span>
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
                  <Sparkles className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Our AI analyzes your preferences to find the perfect match
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
                    <h3 className="font-semibold">Tell Us Your Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Answer questions about budget, car type, features, and more
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
                    <h3 className="font-semibold">AI Analyzes Options</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our algorithm matches your needs with available cars
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
                    <h3 className="font-semibold">Get Perfect Matches</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive personalized recommendations tailored to you
                    </p>
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="font-semibold mb-2">Why Use This Feature?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Saves time by filtering relevant options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Personalized recommendations based on your needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Find the best value for your budget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 w-5 h-5 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                        ✓
                      </div>
                      <span>Discover cars you might not have considered</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recommendation System */}
          <div className="lg:col-span-2">
            <CarRecommendationSystem />

            {/* Advanced Prediction Section */}
            <div className="mt-8">
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Advanced Price Prediction
                  </CardTitle>
                  <CardDescription>
                    Get an accurate, real-time estimate of your car's market value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Our advanced AI algorithm analyzes multiple factors to predict your car's market value with high accuracy.
                  </p>
                  <Link href="/advanced-car-prediction">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Try Advanced Prediction
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Smart Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>Personalized Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes your preferences and matches them with available cars to find your perfect fit.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Gauge className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <CardTitle>Value Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get insights on which cars offer the best value for your budget based on features and condition.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Car className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle>Smart Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced filtering options to narrow down your search based on specific requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}