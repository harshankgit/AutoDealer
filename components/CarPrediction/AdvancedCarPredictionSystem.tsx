'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Car, Star, Fuel, Gauge, MapPin, Users, Loader2, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface CarPredictionRequest {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
  bodyType?: string;
  engineSize?: number;
  color?: string;
  features?: string[];
}

interface CarPredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: {
    label: string;
    value: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  marketTrend: 'up' | 'down' | 'stable';
  comparableCars: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    condition: string;
  }[];
  recommendations: string[];
}

const AdvancedCarPredictionSystem = () => {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [mileage, setMileage] = useState<number[]>([25000]);
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [engineSize, setEngineSize] = useState<number>(1.5);
  const [color, setColor] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [currentFeature, setCurrentFeature] = useState('');
  const [prediction, setPrediction] = useState<CarPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock prediction function - in a real app, this would call your API
  const mockPredictionResult: CarPredictionResult = {
    predictedPrice: 850000,
    minPrice: 750000,
    maxPrice: 950000,
    confidence: 87,
    marketTrend: 'up',
    factors: [
      { label: 'Brand Reputation', value: 'Honda', impact: 'positive', description: 'Honda has strong brand value retention' },
      { label: 'Low Mileage', value: '25,000 km', impact: 'positive', description: 'Below average mileage increases value' },
      { label: 'Good Condition', value: 'Excellent', impact: 'positive', description: 'Well-maintained vehicle commands premium' },
      { label: 'Market Demand', value: 'High', impact: 'positive', description: 'High demand for this model in your area' },
      { label: 'Age', value: '4 years', impact: 'negative', description: 'Depreciation due to age' },
    ],
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

  const handleGetPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your API
      const response = await fetch('/api/car-prediction', {
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
          location,
          bodyType,
          engineSize,
          color,
          features
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data);
        toast.success('Car price prediction completed successfully!');
      } else {
        console.error('Error predicting car price:', data.error);
        setError(data.error || 'Failed to predict car price. Please try again.');
        setPrediction(mockPredictionResult); // Fallback to mock data
        toast.error(data.error || 'Failed to predict car price. Using sample data.');
      }
    } catch (error) {
      console.error('Error predicting car price:', error);
      setError('Failed to predict car price. Please try again.');
      setPrediction(mockPredictionResult); // Fallback to mock data
      toast.error('Failed to predict car price. Using sample data.');
    } finally {
      setLoading(false);
      setStep(9); // Show results
    }
  };

  const resetForm = () => {
    setStep(1);
    setBrand('');
    setModel('');
    setYear(new Date().getFullYear());
    setMileage([25000]);
    setFuelType('');
    setTransmission('');
    setCondition('');
    setLocation('');
    setBodyType('');
    setEngineSize(1.5);
    setColor('');
    setFeatures([]);
    setCurrentFeature('');
    setPrediction(null);
    setError(null);
  };

  const addFeature = () => {
    if (currentFeature.trim() && !features.includes(currentFeature.trim())) {
      setFeatures([...features, currentFeature.trim()]);
      setCurrentFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  const brands = [
    'Maruti Suzuki', 'Hyundai', 'Honda', 'Toyota', 'Mahindra',
    'Tata', 'Ford', 'Chevrolet', 'Nissan', 'Kia', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Audi', 'BMW', 'Mercedes-Benz'
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

  const bodyTypes = [
    'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Minivan', 'Pickup'
  ];

  const colors = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Yellow', 'Orange', 'Purple', 'Pink'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <Zap className="h-6 w-6" />
            Advanced Car Price Prediction
          </CardTitle>
          <CardDescription>
            Get an accurate, real-time estimate of your car's market value using AI
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
                <Button
                  onClick={() => model ? setStep(3) : null}
                  disabled={!model || !isValidBrand(brand)}
                  className={!model || !isValidBrand(brand) ? 'opacity-50 cursor-not-allowed' : ''}
                >
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
                    max={500000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 km</span>
                    <span>500,000 km</span>
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
                <Button
                  onClick={() => (fuelType && transmission) ? setStep(6) : null}
                  disabled={!fuelType || !transmission || !isValidBrand(brand) || !model}
                  className={(!fuelType || !transmission || !isValidBrand(brand) || !model) ? 'opacity-50 cursor-not-allowed' : ''}
                >
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
                <Button
                  onClick={() => condition ? setStep(7) : null}
                  disabled={!condition || !isValidBrand(brand) || !model || !fuelType || !transmission}
                  className={(!condition || !isValidBrand(brand) || !model || !fuelType || !transmission) ? 'opacity-50 cursor-not-allowed' : ''}
                >
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
                <h3 className="text-lg font-medium">Location & Body Type</h3>
                <p className="text-sm text-muted-foreground">Where is your car located and what's the body type?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">City/Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your city or area"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select value={bodyType} onValueChange={setBodyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(6)}>Previous</Button>
                <Button
                  onClick={() => (location && bodyType) ? setStep(8) : null}
                  disabled={!location || !bodyType || !isValidBrand(brand) || !model || !fuelType || !transmission || !condition}
                  className={(!location || !bodyType || !isValidBrand(brand) || !model || !fuelType || !transmission || !condition) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Next
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
                <h3 className="text-lg font-medium">Additional Details</h3>
                <p className="text-sm text-muted-foreground">Provide more details for accurate prediction</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Engine Size (L)</Label>
                    <Slider
                      value={[engineSize]}
                      onValueChange={(value) => setEngineSize(value[0])}
                      max={5.0}
                      min={0.8}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-bold text-primary">{engineSize}L</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color} value={color.toLowerCase()}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      placeholder="Add a feature"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button type="button" onClick={addFeature} variant="outline">Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <button 
                          type="button" 
                          onClick={() => removeFeature(feature)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(7)}>Previous</Button>
                <Button
                  onClick={handleGetPrediction}
                  disabled={loading || !isValidBrand(brand) || !model || !year || !mileage || !fuelType || !transmission || !condition || !location || !bodyType}
                  className={(!isValidBrand(brand) || !model || !year || !mileage || !fuelType || !transmission || !condition || !location || !bodyType) ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Predicting...
                    </>
                  ) : (
                    'Get Prediction'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Your Car's Predicted Value</h3>
                <p className="text-sm text-muted-foreground">Based on real-time market data and AI analysis</p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  <p>{error}</p>
                </div>
              ) : prediction ? (
                <div className="space-y-6">
                  {/* Main Prediction */}
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-center md:text-left">
                        <div className="text-4xl font-bold text-primary mb-1">
                          ₹{prediction.predictedPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Predicted value range: ₹{prediction.minPrice.toLocaleString('en-IN')} - ₹{prediction.maxPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-sm">
                            <Award className="h-4 w-4 mr-1" />
                            {prediction.confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`h-4 w-4 ${prediction.marketTrend === 'up' ? 'text-green-500' : prediction.marketTrend === 'down' ? 'text-red-500' : 'text-yellow-500'}`} />
                          <span className={`text-sm ${prediction.marketTrend === 'up' ? 'text-green-600' : prediction.marketTrend === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {prediction.marketTrend === 'up' ? 'Market Rising' : prediction.marketTrend === 'down' ? 'Market Declining' : 'Market Stable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Value Factors */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Value Factors
                    </h4>
                    <div className="space-y-3">
                      {prediction.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div className="flex-1">
                            <div className="font-medium">{factor.label}</div>
                            <div className="text-sm text-muted-foreground">{factor.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{factor.value}</span>
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

                  {/* Price Range */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">₹{prediction.minPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Conservative</div>
                    </Card>
                    <Card className="p-4 text-center border-2 border-primary">
                      <div className="text-2xl font-bold text-primary">₹{prediction.predictedPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Predicted</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{prediction.maxPrice.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-muted-foreground">Optimistic</div>
                    </Card>
                  </div>

                  {/* Comparable Cars */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4 text-blue-500" />
                      Comparable Cars in Market
                    </h4>
                    <div className="space-y-3">
                      {prediction.comparableCars.map((car, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <div>
                            <div className="font-medium">{car.brand} {car.model}</div>
                            <div className="text-sm text-muted-foreground">{car.year} • {car.mileage.toLocaleString('en-IN')} km • {car.condition}</div>
                          </div>
                          <div className="text-lg font-bold text-primary">₹{car.price.toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recommendations */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                    <Button variant="outline" onClick={resetForm}>
                      Predict Another Car
                    </Button>
                    <Button>
                      Sell My Car
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl text-gray-400 mx-auto mb-4">₹</div>
                  <h4 className="text-lg font-medium mb-2">No prediction available</h4>
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

export default AdvancedCarPredictionSystem;