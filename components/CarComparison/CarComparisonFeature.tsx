// components/CarComparison/CarComparisonFeature.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Gauge, Calendar, MapPin, Users, Star, GitCompare, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CarDetails {
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
  features: string[];
}

const CarComparisonFeature = () => {
  const [selectedCars, setSelectedCars] = useState<CarDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data for available cars
  const availableCars: CarDetails[] = [
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
      features: ['Power Windows', 'AC', 'Airbags', 'Bluetooth', 'Sunroof']
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
      features: ['Power Steering', 'AC', 'Airbags', 'Bluetooth']
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
      features: ['Sunroof', 'Navigation', 'Climate Control', 'Rear Camera', 'Leather Seats']
    },
    {
      id: '4',
      name: 'Toyota Innova',
      brand: 'Toyota',
      model: 'Innova',
      year: 2020,
      price: 1300000,
      mileage: 12.0,
      fuelType: 'Diesel',
      transmission: 'Manual',
      seats: 7,
      location: 'Chennai',
      rating: 4.4,
      features: ['7 Seater', 'AC', 'Airbags', 'Bluetooth', 'DVD Player']
    }
  ];

  const filteredCars = availableCars.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToComparison = (car: CarDetails) => {
    if (selectedCars.length < 3 && !selectedCars.some(c => c.id === car.id)) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeFromComparison = (id: string) => {
    setSelectedCars(selectedCars.filter(car => car.id !== id));
  };

  const clearComparison = () => {
    setSelectedCars([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <GitCompare className="h-6 w-6" />
            Car Comparison
          </CardTitle>
          <CardDescription>
            Compare up to 3 cars side by side to make the best decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Add Cars Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search cars to compare..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline">
                  Search
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCars
                  .filter(car => !selectedCars.some(c => c.id === car.id))
                  .map(car => (
                    <Card key={car.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{car.name}</h4>
                          <p className="text-sm text-muted-foreground">{car.year} • {car.fuelType} • {car.transmission}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => addToComparison(car)}
                          disabled={selectedCars.length >= 3}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">₹{car.price.toLocaleString('en-IN')}</div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(car.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-1 text-sm">{car.rating}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Comparison Table */}
            {selectedCars.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-x-auto"
              >
                <div className="flex gap-4 mb-4">
                  <h3 className="text-lg font-medium">Comparing {selectedCars.length} car(s):</h3>
                  <Button variant="outline" size="sm" onClick={clearComparison}>
                    Clear All
                  </Button>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 text-left">Feature</th>
                      {selectedCars.map(car => (
                        <th key={car.id} className="border p-3 text-center">
                          <div className="flex flex-col items-center">
                            <h4 className="font-bold">{car.name}</h4>
                            <p className="text-sm text-muted-foreground">{car.year}</p>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="mt-2"
                              onClick={() => removeFromComparison(car.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Price</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center font-bold text-primary">
                          ₹{car.price.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Year</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.year}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Mileage</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.mileage} kmpl
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Fuel Type</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.fuelType}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Transmission</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.transmission}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Seats</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.seats}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Rating</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          <div className="flex items-center justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(car.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-1">{car.rating}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Location</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3 text-center">
                          {car.location}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Features</td>
                      {selectedCars.map(car => (
                        <td key={car.id} className="border p-3">
                          <div className="flex flex-wrap gap-1 justify-center">
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
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}

            {selectedCars.length === 0 && (
              <div className="text-center py-8">
                <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No cars selected for comparison</h4>
                <p className="text-muted-foreground mb-4">
                  Add up to 3 cars to start comparing
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarComparisonFeature;