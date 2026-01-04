'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Car, Star, Fuel, Gauge, MapPin, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CarImagePlaceholder from './CarImagePlaceholder';
import CarRecommendationSkeleton from './CarRecommendationSkeleton';

interface CarRecommendation {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  seats: number;
  location: string;
  rating: number;
  image: string;
  features: string[];
  matchPercentage: number;
}

interface CarRecommendationRequest {
  budget: number;
  carType?: string;
  fuelType?: string;
  transmission?: string;
  seats?: string;
  location?: string;
}

const CarRecommendationSystem = () => {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState<number[]>([500000]);
  const [carType, setCarType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [seats, setSeats] = useState('');
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  // Mock data for recommendations
  const mockRecommendations: CarRecommendation[] = [
    {
      id: '1',
      name: 'Honda City',
      brand: 'Honda',
      model: 'City',
      year: 2022,
      price: 1200000,
      mileage: 18.5,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      location: 'Mumbai',
      rating: 4.5,
      image: '/placeholder-car.jpg',
      features: ['Power Windows', 'AC', 'Airbags', 'Bluetooth'],
      matchPercentage: 95
    },
    {
      id: '2',
      name: 'Maruti Swift',
      brand: 'Maruti',
      model: 'Swift',
      year: 2021,
      price: 850000,
      mileage: 22.5,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seats: 5,
      location: 'Delhi',
      rating: 4.2,
      image: '/placeholder-car.jpg',
      features: ['Power Steering', 'AC', 'Airbags'],
      matchPercentage: 88
    },
    {
      id: '3',
      name: 'Hyundai Creta',
      brand: 'Hyundai',
      model: 'Creta',
      year: 2023,
      price: 1500000,
      mileage: 16.5,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seats: 5,
      location: 'Bangalore',
      rating: 4.7,
      image: '/placeholder-car.jpg',
      features: ['Sunroof', 'Navigation', 'Climate Control', 'Rear Camera'],
      matchPercentage: 92
    }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGetRecommendations = async () => {
    setError(null);
    setLoading(true);

    try {
      // Check if user is logged in by checking for token in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch('/api/car-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Include token if available
        },
        body: JSON.stringify({
          budget: budget[0],
          carType,
          fuelType,
          transmission,
          seats,
          location: location || 'Any Location' // Ensure location is a string
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Transform the API response to match the expected interface
        const transformedRecommendations = (data.recommendations || []).map((car: any) => ({
          ...car,
          image: car.image_url || car.image || '/placeholder-car.jpg', // Handle both image_url and image fields
          features: car.features || [],
          matchPercentage: car.matchPercentage || 0
        }));
        setRecommendations(transformedRecommendations);
      } else {
        if (response.status === 401) {
          setError('Please log in to get car recommendations');
        } else {
          console.error('Error fetching recommendations:', data.error);
          setError(data.error || 'Failed to fetch recommendations');
        }
        // Fallback to mock data if API fails
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Network error. Please try again.');
      // Fallback to mock data if API fails
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
      setStep(5); // Show results
    }
  };

  const resetForm = () => {
    setStep(1);
    setBudget([500000]);
    setCarType('');
    setFuelType('');
    setTransmission('');
    setSeats('');
    setLocation('');
    setRecommendations([]);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <Star className="h-6 w-6" />
            Find Your Perfect Car
          </CardTitle>
          <CardDescription>
            Answer a few questions and we'll recommend the perfect car for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">What's your budget?</h3>
                <p className="text-sm text-muted-foreground">Select your maximum budget range</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">₹1L</span>
                  <span className="text-sm font-medium">₹50L+</span>
                </div>
                
                <Slider
                  value={budget}
                  onValueChange={setBudget}
                  max={5000000}
                  min={100000}
                  step={50000}
                  className="w-full"
                />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ₹{budget[0].toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <div></div> {/* Empty div for spacing */}
                <Button onClick={handleNext}>Next</Button>
              </div>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">What type of car are you looking for?</h3>
                <p className="text-sm text-muted-foreground">Select your preferred car type</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric', 'Hybrid'].map((type) => (
                  <Button
                    key={type}
                    variant={carType === type ? 'default' : 'outline'}
                    className="h-16 flex flex-col items-center justify-center"
                    onClick={() => setCarType(type)}
                  >
                    <Car className="h-6 w-6 mb-1" />
                    <span>{type}</span>
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext} disabled={!carType}>Next</Button>
              </div>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Fuel and transmission preferences</h3>
                <p className="text-sm text-muted-foreground">Select your preferences</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Transmission</Label>
                  <Select value={transmission} onValueChange={setTransmission}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button onClick={handleNext} disabled={!fuelType || !transmission}>Next</Button>
              </div>
            </motion.div>
          )}
          
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Additional preferences</h3>
                <p className="text-sm text-muted-foreground">Tell us more about your needs</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Number of Seats</Label>
                  <Select value={seats} onValueChange={setSeats}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Seats</SelectItem>
                      <SelectItem value="5">5 Seats</SelectItem>
                      <SelectItem value="6">6-7 Seats</SelectItem>
                      <SelectItem value="8">8+ Seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Location</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city or area"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handlePrevious}>Previous</Button>
                <Button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finding Cars...
                    </>
                  ) : (
                    'Get Recommendations'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Your Perfect Cars</h3>
                <p className="text-sm text-muted-foreground">Based on your preferences</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p>{error}</p>
                  <p className="mt-2 text-sm">Showing sample recommendations instead.</p>
                </div>
              )}

              {loading ? (
                <CarRecommendationSkeleton />
              ) : (
                <>
                  {recommendations.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Found {recommendations.length} cars matching your preferences
                      </div>
                      {recommendations.map((car) => (
                        <Card key={car.id} className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
                          <div className="w-full sm:w-40 h-32 sm:h-auto border-r">
                            <CarImagePlaceholder brand={car.brand} model={car.model} />
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg">{car.name}</h4>
                                <p className="text-sm text-muted-foreground">{car.year} • {car.fuelType} • {car.transmission}</p>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {car.matchPercentage}% Match
                              </Badge>
                            </div>

                            <div className="flex items-center mt-2 gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Gauge className="h-4 w-4" />
                                <span>{car.mileage} kmpl</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{car.seats} Seats</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{car.location}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(car.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="ml-1 text-sm">{car.rating}</span>
                              </div>
                              <div className="text-lg font-bold text-primary">₹{car.price.toLocaleString('en-IN')}</div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {car.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {car.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{car.features.length - 3} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline" className="flex-1">
                                View Details
                              </Button>
                              <Button size="sm" className="flex-1">
                                Contact Dealer
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">No cars match your preferences</h4>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your preferences to see more options
                      </p>
                      <Button variant="outline" onClick={resetForm}>
                        Adjust Preferences
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Start Over
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarRecommendationSystem;