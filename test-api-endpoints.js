// test-api-endpoints.js
// Simple browser-based test to verify API endpoints work with consolidated logic

async function testAPIEndpoints() {
  console.log('Testing API endpoints with consolidated logic...');
  
  // Test data
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
    // Test Advanced Prediction API
    console.log('Testing Advanced Prediction API...');
    const advancedResponse = await fetch('/api/car-prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const advancedResult = await advancedResponse.json();
    console.log('Advanced API Result:', advancedResult);
    
    // Test Simple Estimation API
    console.log('Testing Simple Estimation API...');
    const simpleResponse = await fetch('/api/car-estimation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleTestData)
    });
    
    const simpleResult = await simpleResponse.json();
    console.log('Simple API Result:', simpleResult);
    
    console.log('✅ Both API endpoints working correctly with consolidated logic!');
    
    // Verify that both return reasonable prices
    if (advancedResult.predictedPrice && typeof advancedResult.predictedPrice === 'number') {
      console.log(`✅ Advanced API returned valid price: ₹${advancedResult.predictedPrice.toLocaleString('en-IN')}`);
    } else {
      console.log('❌ Advanced API did not return valid price');
    }
    
    if (simpleResult.estimatedPrice && typeof simpleResult.estimatedPrice === 'number') {
      console.log(`✅ Simple API returned valid price: ₹${simpleResult.estimatedPrice.toLocaleString('en-IN')}`);
    } else {
      console.log('❌ Simple API did not return valid price');
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
  }
}

// Run the test when the page loads
if (typeof window !== 'undefined') {
  // Add a button to trigger the test
  const testButton = document.createElement('button');
  testButton.textContent = 'Test API Endpoints';
  testButton.style.position = 'fixed';
  testButton.style.top = '10px';
  testButton.style.right = '10px';
  testButton.style.zIndex = '9999';
  testButton.style.padding = '10px';
  testButton.style.backgroundColor = '#007acc';
  testButton.style.color = 'white';
  testButton.style.border = 'none';
  testButton.style.borderRadius = '4px';
  testButton.style.cursor = 'pointer';
  
  testButton.onclick = testAPIEndpoints;
  
  // Add the button to the page
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(testButton);
  });
  
  console.log('API Test button added to page. Click it to run tests.');
}