// components/CarPriceEstimator/SimpleCarPriceEstimator.tsx
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Car, Gauge, Calendar, MapPin, Users, Star, Sparkles, Loader2 } from 'lucide-react';
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
    description?: string; // Optional for backward compatibility
  }[];
  confidence?: number; // Optional for backward compatibility
  marketTrend?: string; // Optional for backward compatibility
  comparableCars?: any[]; // Optional for backward compatibility
  recommendations?: string[]; // Optional for backward compatibility
}

const SimpleCarPriceEstimator = ({ compact = false }: { compact?: boolean }) => {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2020);
  const [mileage, setMileage] = useState<string>('25000');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [estimation, setEstimation] = useState<CarEstimationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock estimation function - in a real app, this would call your API
  const mockEstimationResult: CarEstimationResult = {
    estimatedPrice: 850000,
    minPrice: 750000,
    maxPrice: 950000,
    factors: [
      { label: 'Brand Reputation', value: 'Honda', impact: 'positive', description: 'Honda has strong brand value retention' },
      { label: 'Low Mileage', value: '25,000 km', impact: 'positive', description: 'Below average mileage increases value' },
      { label: 'Good Condition', value: 'Excellent', impact: 'positive', description: 'Well-maintained vehicle commands premium' },
      { label: 'Market Demand', value: 'High', impact: 'positive', description: 'High demand for this model in your area' },
      { label: 'Age', value: '4 years', impact: 'negative', description: 'Depreciation due to age' },
    ],
    confidence: 87,
    marketTrend: 'up',
    comparableCars: [
      { brand: 'Honda', model: 'City', year: 2021, mileage: 22000, price: 820000, condition: 'Good' },
      { brand: 'Honda', model: 'City', year: 2020, mileage: 30000, price: 780000, condition: 'Good' },
      { brand: 'Honda', model: 'City', year: 2022, mileage: 15000, price: 900000, condition: 'Excellent' },
    ],
    recommendations: [
      'Consider getting an extended warranty to increase value',
      'Add premium features like alloy wheels to boost price',
      'Time your sale during festival season for better prices'
    ]
  };

  const handleGetEstimation = useCallback(async () => {
    setError(null);
    setLoading(true);

    // Validate inputs
    if (!brand || !model || !year || !mileage || !fuelType || !transmission || !condition || !location) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Additional validation
    if (!isValidBrand(brand)) {
      setError('Please select a valid brand');
      setLoading(false);
      return;
    }

    if (!model.trim()) {
      setError('Please enter a valid model name');
      setLoading(false);
      return;
    }

    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear + 1) {
      setError(`Year must be between 1990 and ${currentYear + 1}`);
      setLoading(false);
      return;
    }

    const mileageNum = parseInt(mileage);
    if (isNaN(mileageNum) || mileageNum < 0 || mileageNum > 1000000) {
      setError('Please enter a valid mileage (0-1,000,000 km)');
      setLoading(false);
      return;
    }

    if (!['petrol', 'diesel', 'electric', 'hybrid', 'cng'].includes(fuelType.toLowerCase())) {
      setError('Please select a valid fuel type');
      setLoading(false);
      return;
    }

    if (!['manual', 'automatic'].includes(transmission.toLowerCase())) {
      setError('Please select a valid transmission type');
      setLoading(false);
      return;
    }

    if (!['excellent', 'good', 'fair', 'poor'].includes(condition.toLowerCase())) {
      setError('Please select a valid condition');
      setLoading(false);
      return;
    }

    if (!location.trim()) {
      setError('Please enter a valid location');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/car-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          year,
          mileage: mileageNum,
          fuelType,
          transmission,
          condition,
          location,
          bodyType: '', // Default empty for simple estimator
          engineSize: 1.5, // Default value
          color: '', // Default empty for simple estimator
          features: [] // Default empty array for simple estimator
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEstimation(data);
      } else {
        console.error('Error estimating car price:', data.error);
        setError(data.error || 'Failed to estimate car price');
        setEstimation(mockEstimationResult); // Fallback to mock data
      }
    } catch (error) {
      console.error('Error estimating car price:', error);
      setError('Network error. Please try again.');
      setEstimation(mockEstimationResult); // Fallback to mock data
    } finally {
      setLoading(false);
      setStep(2); // Show results
    }
  }, [brand, model, year, mileage, fuelType, transmission, condition, location]);

  const resetForm = useCallback(() => {
    setStep(1);
    setBrand('');
    setModel('');
    setYear(2020);
    setMileage('25000');
    setFuelType('');
    setTransmission('');
    setCondition('');
    setLocation('');
    setEstimation(null);
    setError(null);
  }, []);

  const brands = [
    'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra',
    'Tata', 'Ford', 'Chevrolet', 'Nissan', 'Kia', 'MG', 'Renault'
  ];

  // Validate brand selection
  const isValidBrand = (selectedBrand: string): boolean => {
    return brands.includes(selectedBrand);
  };

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  // Calculate current year for year selection
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  return (
    <div className={compact ? "w-full" : "w-full max-w-4xl mx-auto p-4"}>
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl text-primary">
            <Sparkles className="h-5 w-5" />
            AI Car Price Estimator
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
                <h3 className="text-lg font-medium">Enter Car Details</h3>
                <p className="text-sm text-muted-foreground">Fill in your car's information</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g., City, Creta, Swift"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((yr) => (
                          <SelectItem key={yr} value={yr.toString()}>
                            {yr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="e.g., 25000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
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

                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((cond) => (
                          <SelectItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City/Location"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  onClick={handleGetEstimation}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Estimating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Estimate
                    </>
                  )}
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
                <h3 className="text-lg font-medium">Your Car's Estimated Value</h3>
                <p className="text-sm text-muted-foreground">Based on current market conditions</p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-5xl text-red-400 mx-auto mb-4">₹</div>
                  <h4 className="text-lg font-medium mb-2">Error Estimating Price</h4>
                  <p className="text-muted-foreground mb-4">
                    {error}
                  </p>
                  <Button onClick={resetForm}>Try Again</Button>
                </div>
              ) : estimation ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
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
                      <div className="text-xl font-bold text-green-600">₹{estimation.minPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Conservative</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold text-blue-600">₹{estimation.estimatedPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-xl font-bold text-purple-600">₹{estimation.maxPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Optimistic</div>
                    </Card>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={resetForm} className="flex-1">
                      Estimate Another Car
                    </Button>
                    <Link href="/estimate-car-value" className="w-full sm:w-auto">
                      <Button className="w-full flex-1">
                        Detailed Estimation
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl text-gray-400 mx-auto mb-4">₹</div>
                  <h4 className="text-lg font-medium mb-2">No estimation available</h4>
                  <p className="text-muted-foreground mb-4">
                    Please try again or contact support
                  </p>
                  <Button onClick={resetForm}>Try Again</Button>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCarPriceEstimator;