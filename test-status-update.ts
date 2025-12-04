import fetch from 'node-fetch';

async function testStatusUpdate() {
  const response = await fetch('http://localhost:3000/api/admin/bookings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMzAwMjRkYy0wZjNlLTQ4NTUtYTkyZC1mOGYyNjE0OTgxMWMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjQ3ODExNzYsImV4cCI6MTc2NTM4NTk3Nn0.o_IKICC8NMjc8zlmKSPV2U6pfT-aR66OZ0oGUEzf9Ok',
      'Accept': '*/*'
    },
    body: JSON.stringify({
      bookingId: 'be6fe861-064a-4c12-ab00-2fbe943cf3ab',
      status: 'Confirmed'
    })
  });

  const data = await response.json();
  console.log('Status update response:', response.status);
  console.log('Response data:', JSON.stringify(data, null, 2));
}

testStatusUpdate().catch(console.error);