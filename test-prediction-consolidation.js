// test-prediction-consolidation.js
// Test script to verify that the consolidated prediction functionality works correctly

const testData = {
  brand: 'Honda',
  model: 'City',
  year: 2021,
  mileage: 25000,
  fuelType: 'petrol',
  transmission: 'manual',
  condition: 'good',
  location: 'Mumbai',
  bodyType: 'sedan',
  engineSize: 1.5,
  color: 'white',
  features: ['alloy wheels', 'power windows']
};

async function testAdvancedPrediction() {
  console.log('Testing Advanced Car Prediction API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/car-prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Advanced Prediction API Test PASSED');
      console.log('Predicted Price:', result.predictedPrice);
      console.log('Confidence:', result.confidence);
      console.log('Factors:', result.factors.length, 'factors returned');
      console.log('Comparable Cars:', result.comparableCars.length, 'cars returned');
      console.log('Recommendations:', result.recommendations.length, 'recommendations returned');
    } else {
      console.log('❌ Advanced Prediction API Test FAILED:', result.error);
    }
  } catch (error) {
    console.log('❌ Advanced Prediction API Test ERROR:', error.message);
  }
}

async function testSimpleEstimation() {
  console.log('\nTesting Simple Car Estimation API...');
  
  // Test data for simple estimator (without extra fields)
  const simpleTestData = {
    brand: 'Honda',
    model: 'City',
    year: 2021,
    mileage: 25000,
    fuelType: 'petrol',
    transmission: 'manual',
    condition: 'good',
    location: 'Mumbai'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/car-estimation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleTestData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Simple Estimation API Test PASSED');
      console.log('Estimated Price:', result.estimatedPrice);
      console.log('Factors:', result.factors.length, 'factors returned');
    } else {
      console.log('❌ Simple Estimation API Test FAILED:', result.error);
    }
  } catch (error) {
    console.log('❌ Simple Estimation API Test ERROR:', error.message);
  }
}

async function testSharedService() {
  console.log('\nTesting shared car prediction service functions...');
  
  try {
    // Dynamically import the service functions
    const { calculateDepreciation, conditionMultiplier, mileageAdjustment, fuelTypeMultiplier, transmissionMultiplier, getBasePrice, calculateCarPrediction, calculateSimpleCarEstimation } = await import('./lib/car-prediction-service.ts');
    
    console.log('✅ All service functions imported successfully');
    
    // Test individual functions
    console.log('Depreciation for 2020 car:', calculateDepreciation(2020));
    console.log('Condition multiplier for "good":', conditionMultiplier('good'));
    console.log('Mileage adjustment for 25000km:', mileageAdjustment(25000));
    console.log('Fuel type multiplier for "petrol":', fuelTypeMultiplier('petrol'));
    console.log('Transmission multiplier for "manual":', transmissionMultiplier('manual'));
    console.log('Base price for Honda City:', getBasePrice('Honda', 'City'));
    
    // Test full prediction
    const prediction = calculateCarPrediction(
      'Honda', 'City', 2021, 25000, 'petrol', 'manual', 'good', 'Mumbai',
      'sedan', 1.5, 'white', ['alloy wheels']
    );
    
    console.log('Full prediction test - Price:', prediction.predictedPrice);
    console.log('Full prediction test - Confidence:', prediction.confidence);
    
    // Test simple estimation
    const estimation = calculateSimpleCarEstimation(
      'Honda', 'City', 2021, 25000, 'petrol', 'manual', 'good', 'Mumbai'
    );
    
    console.log('Simple estimation test - Price:', estimation.estimatedPrice);
    
  } catch (error) {
    console.log('❌ Service functions test ERROR:', error.message);
  }
}

async function runAllTests() {
  console.log('Starting car prediction consolidation tests...\n');
  
  await testAdvancedPrediction();
  await testSimpleEstimation();
  await testSharedService();
  
  console.log('\nAll tests completed!');
}

// Run the tests
runAllTests().catch(console.error);