// lib/car-prediction-service.ts
// Unified car prediction service with dynamic pricing algorithm

// Mock car data for prediction - In a real app, this would come from a database
const mockCarData = [
  { brand: 'Honda', model: 'City', year: 2022, mileage: 15000, price: 1200000, fuelType: 'petrol', transmission: 'automatic', condition: 'excellent' },
  { brand: 'Honda', model: 'City', year: 2021, mileage: 25000, price: 1000000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Honda', model: 'City', year: 2020, mileage: 35000, price: 850000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Honda', model: 'Civic', year: 2022, mileage: 12000, price: 1600000, fuelType: 'petrol', transmission: 'automatic', condition: 'excellent' },
  { brand: 'Honda', model: 'Civic', year: 2021, mileage: 20000, price: 1400000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Maruti', model: 'Swift', year: 2022, mileage: 20000, price: 800000, fuelType: 'petrol', transmission: 'manual', condition: 'excellent' },
  { brand: 'Maruti', model: 'Swift', year: 2021, mileage: 30000, price: 700000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Maruti', model: 'Swift', year: 2020, mileage: 40000, price: 600000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Maruti', model: 'Baleno', year: 2021, mileage: 25000, price: 750000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Hyundai', model: 'Creta', year: 2023, mileage: 10000, price: 1500000, fuelType: 'petrol', transmission: 'automatic', condition: 'excellent' },
  { brand: 'Hyundai', model: 'Creta', year: 2022, mileage: 25000, price: 1300000, fuelType: 'petrol', transmission: 'automatic', condition: 'good' },
  { brand: 'Hyundai', model: 'Creta', year: 2021, mileage: 35000, price: 1100000, fuelType: 'petrol', transmission: 'manual', condition: 'good' },
  { brand: 'Hyundai', model: 'Venue', year: 2022, mileage: 15000, price: 1000000, fuelType: 'petrol', transmission: 'manual', condition: 'excellent' },
  { brand: 'Toyota', model: 'Innova', year: 2021, mileage: 40000, price: 1400000, fuelType: 'diesel', transmission: 'manual', condition: 'good' },
  { brand: 'Toyota', model: 'Fortuner', year: 2020, mileage: 50000, price: 2800000, fuelType: 'diesel', transmission: 'automatic', condition: 'good' },
  { brand: 'Tata', model: 'Nexon', year: 2022, mileage: 18000, price: 900000, fuelType: 'petrol', transmission: 'manual', condition: 'excellent' },
  { brand: 'Kia', model: 'Seltos', year: 2021, mileage: 22000, price: 1200000, fuelType: 'petrol', transmission: 'automatic', condition: 'good' },
  { brand: 'MG', model: 'Hector', year: 2022, mileage: 15000, price: 1600000, fuelType: 'petrol', transmission: 'automatic', condition: 'excellent' },
];

// Function to calculate depreciation based on age
export const calculateDepreciation = (year: number): number => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Depreciation rates: 20% first year, 15% second year, 10% each subsequent year
  if (age <= 0) return 1;
  if (age === 1) return 0.8;
  if (age === 2) return 0.8 * 0.85; // 80% * 85%

  let depreciation = 0.8 * 0.85; // First 2 years
  for (let i = 3; i <= age; i++) {
    depreciation *= 0.9; // 10% depreciation each year after year 2
  }

  return Math.max(depreciation, 0.1); // Minimum 10% of original value
};

// Function to adjust price based on condition
export const conditionMultiplier = (condition: string): number => {
  switch (condition.toLowerCase()) {
    case 'excellent': return 1.0;
    case 'good': return 0.9;
    case 'fair': return 0.75;
    case 'poor': return 0.6;
    default: return 0.85;
  }
};

// Function to adjust price based on mileage
export const mileageAdjustment = (mileage: number): number => {
  if (mileage <= 20000) return 1.0; // Low mileage
  if (mileage <= 50000) return 0.95; // Medium-low
  if (mileage <= 100000) return 0.9; // Medium
  if (mileage <= 150000) return 0.8; // Medium-high
  return 0.7; // High mileage
};

// Function to adjust price based on fuel type
export const fuelTypeMultiplier = (fuelType: string): number => {
  switch (fuelType.toLowerCase()) {
    case 'electric': return 1.2; // Premium for electric
    case 'petrol': return 1.0;
    case 'diesel': return 1.05; // Slightly higher for diesel
    case 'hybrid': return 1.15; // Premium for hybrid
    case 'cng': return 0.95; // Slightly lower for CNG
    default: return 1.0;
  }
};

// Function to adjust price based on transmission
export const transmissionMultiplier = (transmission: string): number => {
  switch (transmission.toLowerCase()) {
    case 'automatic': return 1.1; // Premium for automatic
    case 'manual': return 1.0;
    default: return 1.0;
  }
};

// Function to get base price for a car model
export const getBasePrice = (brand: string, model: string): number => {
  // Calculate base price based on historical data from mock car data
  const matchingCars = mockCarData.filter(car =>
    car.brand === brand && car.model === model
  );

  if (matchingCars.length > 0) {
    // Calculate average price of matching cars as base price
    const totalPrice = matchingCars.reduce((sum, car) => sum + car.price, 0);
    const averagePrice = Math.round(totalPrice / matchingCars.length);

    // Adjust for age (use newest car's year as reference)
    const newestYear = Math.max(...matchingCars.map(car => car.year));
    const currentYear = new Date().getFullYear();
    const age = currentYear - newestYear;

    // Adjust for depreciation from newest model year
    const depreciationFactor = calculateDepreciation(newestYear);
    return Math.round(averagePrice / depreciationFactor);
  } else {
    // Fallback to hardcoded prices if no matching data found
    const basePrices: Record<string, number> = {
      'Honda City': 1000000,
      'Honda Civic': 1500000,
      'Honda CR-V': 2500000,
      'Honda Accord': 2800000,
      'Maruti Swift': 600000,
      'Maruti Baleno': 700000,
      'Maruti Vitara Brezza': 900000,
      'Maruti Wagon R': 500000,
      'Hyundai Creta': 1200000,
      'Hyundai Venue': 800000,
      'Hyundai Verna': 1000000,
      'Hyundai i20': 750000,
      'Toyota Innova': 1500000,
      'Toyota Fortuner': 3000000,
      'Toyota Camry': 3500000,
      'Tata Nexon': 800000,
      'Tata Harrier': 1500000,
      'Tata Safari': 1600000,
      'Kia Seltos': 1100000,
      'Kia Sonet': 900000,
      'MG Hector': 1400000,
      'MG Astor': 1200000,
    };

    const key = `${brand} ${model}`;
    return basePrices[key] || 1000000; // Default to 10L if not found
  }
};

// Main prediction function that can be used by both simple and advanced estimators
export const calculateCarPrediction = (
  brand: string,
  model: string,
  year: number,
  mileage: number,
  fuelType: string,
  transmission: string,
  condition: string,
  location: string,
  bodyType?: string,
  engineSize?: number,
  color?: string,
  features?: string[]
) => {
  // Validate inputs
  const currentYear = new Date().getFullYear();
  if (year < 1990 || year > currentYear + 1) {
    throw new Error(`Year must be between 1990 and ${currentYear + 1}`);
  }

  if (mileage < 0 || mileage > 10000000) {
    throw new Error('Mileage must be between 0 and 10,000,000 km');
  }

  const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
  if (!validFuelTypes.includes(fuelType.toLowerCase())) {
    throw new Error(`Fuel type must be one of: ${validFuelTypes.join(', ')}`);
  }

  const validTransmissionTypes = ['manual', 'automatic'];
  if (!validTransmissionTypes.includes(transmission.toLowerCase())) {
    throw new Error(`Transmission must be one of: ${validTransmissionTypes.join(', ')}`);
  }

  const validConditions = ['excellent', 'good', 'fair', 'poor'];
  if (!validConditions.includes(condition.toLowerCase())) {
    throw new Error(`Condition must be one of: ${validConditions.join(', ')}`);
  }

  if (!brand || !brand.trim()) {
    throw new Error('Brand must be a non-empty string');
  }

  if (!model || !model.trim()) {
    throw new Error('Model must be a non-empty string');
  }

  if (!location || !location.trim()) {
    throw new Error('Location must be a non-empty string');
  }
  try {
    // Get base price for the car model
    const basePrice = getBasePrice(brand, model);

    // Calculate multipliers
    const depreciation = calculateDepreciation(year);
    const conditionMult = conditionMultiplier(condition);
    const mileageMult = mileageAdjustment(mileage);
    const fuelMult = fuelTypeMultiplier(fuelType);
    const transmissionMult = transmissionMultiplier(transmission);

    // Calculate predicted price
    let predictedPrice = basePrice * depreciation * conditionMult * mileageMult * fuelMult * transmissionMult;

    // Additional adjustments based on features
    if (Array.isArray(features)) {
      // Premium for premium features
      const premiumFeatures = ['sunroof', 'navigation', 'leather seats', 'premium sound', 'adaptive cruise control'];
      const premiumFeatureCount = features.filter((f: string) =>
        premiumFeatures.some(pf => f.toLowerCase().includes(pf))
      ).length;

      predictedPrice += premiumFeatureCount * 50000; // ₹50k premium per premium feature
    }

    // Market adjustment based on location (simplified)
    // In a real app, this would use actual market data for each location
    const locationAdjustment = location.toLowerCase().includes('mumbai') ||
                              location.toLowerCase().includes('delhi') ||
                              location.toLowerCase().includes('bangalore') ? 1.05 : 1.0;

    predictedPrice *= locationAdjustment;

    // Add some randomness to simulate market fluctuations (±5%)
    const marketFluctuation = 0.95 + Math.random() * 0.10; // 0.95 to 1.05
    predictedPrice *= marketFluctuation;

    // Calculate min and max prices (±10% from predicted)
    const minPrice = Math.max(Math.round(predictedPrice * 0.9), 100000); // Minimum ₹1L
    const maxPrice = Math.round(predictedPrice * 1.1);
    predictedPrice = Math.round(predictedPrice);

    // Calculate confidence (based on how much data we have for this model)
    const matchingCars = mockCarData.filter(
      car => car.brand === brand && car.model === model
    );
    const confidence = Math.min(95, 60 + (matchingCars.length * 5)); // Base 60% + 5% per matching car

    // Generate factors affecting the price
    const factors = [
      {
        label: 'Age Depreciation',
        value: `${year} (${new Date().getFullYear() - year} years)`,
        impact: 'negative',
        description: `${Math.round((1 - depreciation) * 100)}% value lost due to age`
      },
      {
        label: 'Condition',
        value: condition.charAt(0).toUpperCase() + condition.slice(1),
        impact: condition === 'excellent' ? 'positive' : condition === 'good' ? 'neutral' : 'negative',
        description: `Condition significantly affects resale value`
      },
      {
        label: 'Mileage',
        value: `${mileage.toLocaleString('en-IN')} km`,
        impact: mileage < 25000 ? 'positive' : mileage > 100000 ? 'negative' : 'neutral',
        description: mileage < 25000 ? 'Low mileage increases value' : mileage > 100000 ? 'High mileage decreases value' : 'Average mileage'
      },
      {
        label: 'Fuel Type',
        value: fuelType.charAt(0).toUpperCase() + fuelType.slice(1),
        impact: fuelType === 'electric' || fuelType === 'hybrid' ? 'positive' : 'neutral',
        description: fuelType === 'electric' || fuelType === 'hybrid' ? 'Eco-friendly options command premium' : 'Standard fuel type'
      },
      {
        label: 'Transmission',
        value: transmission.charAt(0).toUpperCase() + transmission.slice(1),
        impact: transmission === 'automatic' ? 'positive' : 'neutral',
        description: 'Automatic transmission typically has higher value'
      }
    ];

    // Get comparable cars
    const comparableCars = mockCarData
      .filter(car => car.brand === brand && car.model === model)
      .sort((a, b) => b.year - a.year) // Sort by year descending
      .slice(0, 3) // Get top 3
      .map(car => ({
        brand: car.brand,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        price: car.price,
        condition: car.condition
      }));

    // Generate recommendations
    const recommendations = [
      'Consider getting an extended warranty to increase value',
      'Add premium features like alloy wheels to boost price',
      'Time your sale during festival season for better prices',
      'Get a professional detailing done before selling',
      'Ensure all service records are available'
    ].slice(0, 3); // Take first 3

    return {
      predictedPrice,
      minPrice,
      maxPrice,
      confidence,
      marketTrend: Math.random() > 0.5 ? 'up' : 'stable', // Random trend for demo
      factors,
      comparableCars,
      recommendations
    };
  } catch (error) {
    console.error('Error in calculateCarPrediction:', error);
    throw error;
  }
};

// Simplified prediction function for basic estimator
export const calculateSimpleCarEstimation = (
  brand: string,
  model: string,
  year: number,
  mileage: number,
  fuelType: string,
  transmission: string,
  condition: string,
  location: string
) => {
  // Validate inputs
  const currentYear = new Date().getFullYear();
  if (year < 1990 || year > currentYear + 1) {
    throw new Error(`Year must be between 1990 and ${currentYear + 1}`);
  }

  if (mileage < 0 || mileage > 10000000) {
    throw new Error('Mileage must be between 0 and 10,000,000 km');
  }

  const validFuelTypes = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
  if (!validFuelTypes.includes(fuelType.toLowerCase())) {
    throw new Error(`Fuel type must be one of: ${validFuelTypes.join(', ')}`);
  }

  const validTransmissionTypes = ['manual', 'automatic'];
  if (!validTransmissionTypes.includes(transmission.toLowerCase())) {
    throw new Error(`Transmission must be one of: ${validTransmissionTypes.join(', ')}`);
  }

  const validConditions = ['excellent', 'good', 'fair', 'poor'];
  if (!validConditions.includes(condition.toLowerCase())) {
    throw new Error(`Condition must be one of: ${validConditions.join(', ')}`);
  }

  if (!brand || !brand.trim()) {
    throw new Error('Brand must be a non-empty string');
  }

  if (!model || !model.trim()) {
    throw new Error('Model must be a non-empty string');
  }

  if (!location || !location.trim()) {
    throw new Error('Location must be a non-empty string');
  }
  try {
    // Calculate base price based on brand and model (simplified algorithm)
    let basePrice = 0;

    // Base prices for different brands (in INR)
    const brandMultipliers: Record<string, number> = {
      'Maruti Suzuki': 0.8,
      'Hyundai': 0.9,
      'Honda': 1.0,
      'Toyota': 1.2,
      'Mahindra': 0.85,
      'Tata': 0.75,
      'Ford': 0.95,
      'Chevrolet': 0.85,
      'Nissan': 0.9,
      'Kia': 1.0,
      'MG': 1.05,
      'Renault': 0.85
    };

    // Base price for a typical car (in INR)
    const baseCarPrice = 800000;
    basePrice = baseCarPrice * (brandMultipliers[brand] || 1.0);

    // Adjust for model (simplified - in a real app, you'd have specific prices for each model)
    if (model.toLowerCase().includes('swift') || model.toLowerCase().includes('city')) {
      basePrice *= 0.9; // Smaller cars
    } else if (model.toLowerCase().includes('creta') || model.toLowerCase().includes('fortuner')) {
      basePrice *= 1.3; // SUVs
    }

    // Adjust for year (depreciation)
    const currentYearSimple = new Date().getFullYear();
    const age = currentYearSimple - year;
    let yearMultiplier = 1.0;

    if (age <= 1) {
      yearMultiplier = 0.9; // Newer cars retain more value
    } else if (age <= 3) {
      yearMultiplier = 0.8;
    } else if (age <= 5) {
      yearMultiplier = 0.7;
    } else if (age <= 7) {
      yearMultiplier = 0.6;
    } else if (age <= 10) {
      yearMultiplier = 0.5;
    } else {
      yearMultiplier = 0.4; // Older cars
    }

    basePrice *= yearMultiplier;

    // Adjust for mileage (simplified)
    let mileageMultiplier = 1.0;
    if (mileage <= 25000) {
      mileageMultiplier = 1.0; // Low mileage
    } else if (mileage <= 50000) {
      mileageMultiplier = 0.95;
    } else if (mileage <= 100000) {
      mileageMultiplier = 0.9;
    } else if (mileage <= 150000) {
      mileageMultiplier = 0.85;
    } else {
      mileageMultiplier = 0.8; // High mileage
    }

    basePrice *= mileageMultiplier;

    // Adjust for fuel type
    const fuelMultipliers: Record<string, number> = {
      'petrol': 1.0,
      'diesel': 1.1, // Diesel cars often retain value better
      'electric': 1.3, // Electric cars have higher value
      'hybrid': 1.2,
      'cng': 0.95
    };

    basePrice *= fuelMultipliers[fuelType] || 1.0;

    // Adjust for transmission
    if (transmission === 'automatic') {
      basePrice *= 1.1; // Automatic transmission adds value
    }

    // Adjust for condition
    const conditionMultipliers: Record<string, number> = {
      'excellent': 1.1,
      'good': 1.0,
      'fair': 0.85,
      'poor': 0.7
    };

    basePrice *= conditionMultipliers[condition] || 1.0;

    // Calculate min and max prices with some variance
    const minPrice = Math.round(basePrice * 0.85); // 15% below
    const maxPrice = Math.round(basePrice * 1.15); // 15% above
    const estimatedPrice = Math.round(basePrice);

    // Determine factors affecting the price
    const factors = [
      { label: 'Brand Reputation', value: brand, impact: brandMultipliers[brand] && brandMultipliers[brand] > 1.0 ? 'positive' : brandMultipliers[brand] && brandMultipliers[brand] < 1.0 ? 'negative' : 'neutral' },
      { label: 'Year', value: `${age} years old`, impact: age <= 3 ? 'positive' : age >= 10 ? 'negative' : 'neutral' },
      { label: 'Mileage', value: `${mileage.toLocaleString('en-IN')} km`, impact: mileage <= 25000 ? 'positive' : mileage >= 150000 ? 'negative' : 'neutral' },
      { label: 'Fuel Type', value: fuelType.charAt(0).toUpperCase() + fuelType.slice(1), impact: fuelMultipliers[fuelType] && fuelMultipliers[fuelType] > 1.0 ? 'positive' : fuelMultipliers[fuelType] && fuelMultipliers[fuelType] < 1.0 ? 'negative' : 'neutral' },
      { label: 'Condition', value: condition.charAt(0).toUpperCase() + condition.slice(1), impact: condition === 'excellent' ? 'positive' : condition === 'poor' ? 'negative' : 'neutral' },
    ];

    return {
      estimatedPrice,
      minPrice,
      maxPrice,
      factors
    };
  } catch (error) {
    console.error('Error in calculateSimpleCarEstimation:', error);
    throw error;
  }
};