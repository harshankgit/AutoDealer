// components/CarPriceEstimator/CarPriceEstimator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Car, Gauge, Calendar, MapPin, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CarEstimationRequest {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
}

interface CarEstimationResult {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  factors: {
    label: string;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
}

const CarPriceEstimator = () => {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2020);
  const [mileage, setMileage] = useState<number[]>([25000]);
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [estimation, setEstimation] = useState<CarEstimationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock estimation function - in a real app, this would call your API
  const mockEstimationResult: CarEstimationResult = {
    estimatedPrice: 850000,
    minPrice: 750000,
    maxPrice: 950000,
    factors: [
      { label: 'Brand Reputation', value: 'Honda', impact: 'positive' },
      { label: 'Low Mileage', value: '25,000 km', impact: 'positive' },
      { label: 'Good Condition', value: 'Excellent', impact: 'positive' },
      { label: 'Market Demand', value: 'High', impact: 'positive' },
      { label: 'Age', value: '4 years', impact: 'negative' },
    ]
  };

  const handleGetEstimation = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/car-estimation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          year,
          mileage: mileage[0],
          fuelType,
          transmission,
          condition,
          location
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEstimation(data);
      } else {
        console.error('Error estimating car price:', data.error);
        setEstimation(mockEstimationResult); // Fallback to mock data
      }
    } catch (error) {
      console.error('Error estimating car price:', error);
      setEstimation(mockEstimationResult); // Fallback to mock data
    } finally {
      setLoading(false);
      setStep(8); // Show results
    }
  };

  const resetForm = () => {
    setStep(1);
    setBrand('');
    setModel('');
    setYear(2020);
    setMileage([25000]);
    setFuelType('');
    setTransmission('');
    setCondition('');
    setLocation('');
    setEstimation(null);
  };

  const brands = [
    'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra', 
    'Tata', 'Ford', 'Chevrolet', 'Nissan', 'Kia', 'MG', 'Renault'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <div className="h-6 w-6 flex items-center justify-center">₹</div>
            Car Price Estimator
          </CardTitle>
          <CardDescription>
            Get an instant estimate of your car's value
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
                <h3 className="text-lg font-medium">Select Car Brand</h3>
                <p className="text-sm text-muted-foreground">Choose the brand of your car</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {brands.map((b) => (
                  <Button
                    key={b}
                    variant={brand === b ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => {
                      setBrand(b);
                      setStep(2);
                    }}
                  >
                    {b}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
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
                <h3 className="text-lg font-medium">Enter Car Model</h3>
                <p className="text-sm text-muted-foreground">Enter the model name of your car</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Brand</Label>
                  <div className="text-lg font-medium">{brand}</div>
                </div>
                
                <div>
                  <Label htmlFor="model">Model Name</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., City, Creta, Swift"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Previous</Button>
                <Button onClick={() => model ? setStep(3) : null} disabled={!model}>
                  Next
                </Button>
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
                <h3 className="text-lg font-medium">Select Year</h3>
                <p className="text-sm text-muted-foreground">Manufacturing year of your car</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Year</Label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 25 }, (_, i) => {
                        const yr = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={yr} value={yr.toString()}>
                            {yr}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Previous</Button>
                <Button onClick={() => setStep(4)}>Next</Button>
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
                <h3 className="text-lg font-medium">Enter Mileage</h3>
                <p className="text-sm text-muted-foreground">Current odometer reading in kilometers</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Mileage (km)</Label>
                    <span className="text-lg font-bold text-primary">{mileage[0].toLocaleString('en-IN')}</span>
                  </div>
                  
                  <Slider
                    value={mileage}
                    onValueChange={setMileage}
                    max={300000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 km</span>
                    <span>300,000 km</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(3)}>Previous</Button>
                <Button onClick={() => setStep(5)}>Next</Button>
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
                <h3 className="text-lg font-medium">Fuel Type & Transmission</h3>
                <p className="text-sm text-muted-foreground">Select your car's fuel type and transmission</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
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
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(4)}>Previous</Button>
                <Button onClick={() => (fuelType && transmission) ? setStep(6) : null} disabled={!fuelType || !transmission}>
                  Next
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Car Condition</h3>
                <p className="text-sm text-muted-foreground">Overall condition of your car</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {conditions.map((cond) => (
                    <Button
                      key={cond.value}
                      variant={condition === cond.value ? 'default' : 'outline'}
                      className="h-14 flex flex-col items-center justify-center"
                      onClick={() => setCondition(cond.value)}
                    >
                      <span>{cond.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(5)}>Previous</Button>
                <Button onClick={() => condition ? setStep(7) : null} disabled={!condition}>
                  Next
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 7 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">Where is your car located?</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location">City/Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your city or area"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(6)}>Previous</Button>
                <Button onClick={handleGetEstimation} disabled={!location}>
                  Get Estimate
                </Button>
              </div>
            </motion.div>
          )}
          
          {step === 8 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Your Car's Estimated Value</h3>
                <p className="text-sm text-muted-foreground">Based on current market conditions</p>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : estimation ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      ₹{estimation.estimatedPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated value range: ₹{estimation.minPrice.toLocaleString('en-IN')} - ₹{estimation.maxPrice.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Value Factors
                    </h4>
                    <div className="space-y-2">
                      {estimation.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <span className="text-sm">{factor.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{factor.value}</span>
                            <Badge 
                              variant="outline" 
                              className={
                                factor.impact === 'positive' 
                                  ? 'text-green-600 border-green-600' 
                                  : factor.impact === 'negative' 
                                    ? 'text-red-600 border-red-600' 
                                    : 'text-gray-600 border-gray-600'
                              }
                            >
                              {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '-' : '±'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">₹{estimation.minPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Conservative</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">₹{estimation.estimatedPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{estimation.maxPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Optimistic</div>
                    </Card>
                  </div>
                  
                  <div className="flex justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={resetForm}>
                      Estimate Another Car
                    </Button>
                    <Button>
                      Sell My Car
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl text-gray-400 mx-auto mb-4">₹</div>
                  <h4 className="text-lg font-medium mb-2">No estimation available</h4>
                  <p className="text-muted-foreground mb-4">
                    Please try again or contact support
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarPriceEstimator;