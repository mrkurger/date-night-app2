// API Integration Test for client_angular2
// This script tests the connection between client_angular2 and the backend API

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testApiEndpoint(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`Testing ${method} ${API_BASE_URL}${endpoint}...`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log('Response:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      }
      return true;
    } else {
      console.error('Error:', response.status, response.statusText);
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not parse error response');
      }
      return false;
    }
  } catch (error) {
    console.error(`Failed to test ${endpoint}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== API INTEGRATION TESTS ===');
  console.log('Testing connection between client_angular2 and backend API');

  // Test API health endpoint
  await testApiEndpoint('/health');

  // Test direct server health endpoint
  await testApiEndpoint('', 'GET');
  console.log('\nTesting direct server health endpoint at http://localhost:3001/health');
  await testApiEndpoint('/../../health', 'GET');

  // Test some auth endpoints (without actual credentials)
  console.log('\n--- Auth API Tests ---');
  // We expect 400/401 errors since we're not providing valid credentials
  await testApiEndpoint('/auth/login', 'POST', { email: 'test@example.com', password: 'password' });

  // Test other API endpoints
  console.log('\n--- Other API Tests ---');
  await testApiEndpoint('/ads'); // Should return public ads

  console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runTests();
