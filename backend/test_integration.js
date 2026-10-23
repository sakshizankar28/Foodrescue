// test_integration.js
// Automated End-to-End Verification Test for FoodRescue Full-Stack Integration

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, options);
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return { status: response.status, data, contentType };
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 Starting FoodRescue Full-Stack Integration Verification');
  console.log('========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data?.status === 'ok', 'Health Check API (/api/health) returns 200 OK');

    // 2. Frontend root URL serving
    const rootPage = await makeRequest('/');
    assert(
      rootPage.status === 200 && typeof rootPage.data === 'string' && (rootPage.data.includes('FoodRescue') || rootPage.data.includes('<!doctype html>')),
      'Frontend Root URL (http://localhost:3000/) serves index.html'
    );

    // 3. React Router SPA client-side fallback
    const donorPage = await makeRequest('/donor-dashboard');
    assert(
      donorPage.status === 200 && typeof donorPage.data === 'string' && donorPage.data.includes('<!doctype html>'),
      'Client-side routing fallback (/donor-dashboard) serves index.html without 404'
    );

    const ngoPage = await makeRequest('/ngo-dashboard');
    assert(
      ngoPage.status === 200 && typeof ngoPage.data === 'string' && ngoPage.data.includes('<!doctype html>'),
      'Client-side routing fallback (/ngo-dashboard) serves index.html without 404'
    );

    // 4. Fetch available food listings from MySQL
    const foods = await makeRequest('/api/food');
    assert(foods.status === 200 && Array.isArray(foods.data), `Fetch food listings (/api/food) returned ${foods.data?.length} records from MySQL`);

    // 5. Donor Login with MySQL credentials
    const donorLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@example.com', password: 'Password123' }),
    });
    assert(donorLogin.status === 200 && donorLogin.data?.token, 'Donor login succeeds and returns JWT token');
    const donorToken = donorLogin.data?.token;

    // 6. NGO Login with MySQL credentials
    const ngoLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ngo@example.com', password: 'Password123' }),
    });
    assert(ngoLogin.status === 200 && ngoLogin.data?.token, 'NGO login succeeds and returns JWT token');
    const ngoToken = ngoLogin.data?.token;

    // 7. Security: Unauthenticated request to protected route
    const unauthTest = await makeRequest('/api/food/mine');
    assert(unauthTest.status === 401, 'Unauthorized request to /api/food/mine rejected with 401');

    // 8. Security: NGO trying to access donor-only route
    const roleMismatch = await makeRequest('/api/food/mine', {
      headers: { Authorization: `Bearer ${ngoToken}` },
    });
    assert(roleMismatch.status === 403, 'Role-based access control enforces donor-only permission (403)');

    // 9. Fetch donor listings
    const donorListings = await makeRequest('/api/food/mine', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert(donorListings.status === 200 && Array.isArray(donorListings.data), 'Donor fetches their own food listings from MySQL');

    // 10. Add new food listing to MySQL
    const uniqueBatch = `Verification Meal Batch ${Date.now()}`;
    const addFoodRes = await makeRequest('/api/food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        title: uniqueBatch,
        food_name: uniqueBatch,
        description: 'Automated integration test food batch',
        quantity: '30 servings',
        food_type: 'veg',
        storage_details: 'Refrigerated steel vessels',
        preparation_time: 'Just now',
        pickup_address: 'Gate 3 Main Kitchen',
        available_until: '2026-12-31',
      }),
    });
    assert(addFoodRes.status === 201 && addFoodRes.data?.id, 'Add food listing creates record in MySQL food_listings');
    const createdFoodId = addFoodRes.data?.id;

    // 11. Submit NGO request for the created food listing
    let createdReqId = null;
    if (createdFoodId) {
      const createReqRes = await makeRequest('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ngoToken}`,
        },
        body: JSON.stringify({
          food_id: createdFoodId,
          requested_quantity: '15 servings',
          message: 'Pickup requested for test validation',
        }),
      });
      assert(createReqRes.status === 201 && createReqRes.data?.requestId, 'NGO request saves to MySQL food_requests');
      createdReqId = createReqRes.data?.requestId;
    }

    // 12. Donor views incoming requests
    if (createdReqId) {
      const incomingRes = await makeRequest('/api/requests/incoming', {
        headers: { Authorization: `Bearer ${donorToken}` },
      });
      const found = incomingRes.data?.some((r) => r.id === createdReqId);
      assert(incomingRes.status === 200 && found, 'Incoming request appears on donor dashboard');

      // 13. Donor approves request (MySQL transaction with quantity reservation)
      const approveRes = await makeRequest(`/api/requests/${createdReqId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${donorToken}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      assert(approveRes.status === 200, 'Donor approves request and status updates to accepted');

      // 14. Check food available quantity decreased
      const foodDetail = await makeRequest(`/api/food/${createdFoodId}`);
      assert(
        foodDetail.status === 200 && foodDetail.data?.available_quantity === 15,
        'Food available quantity atomically reduced in MySQL from 30 to 15'
      );

      // 15. NGO views their request status
      const ngoRequests = await makeRequest('/api/requests/mine', {
        headers: { Authorization: `Bearer ${ngoToken}` },
      });
      const myReq = ngoRequests.data?.find((r) => r.id === createdReqId);
      assert(ngoRequests.status === 200 && myReq?.status === 'accepted', 'NGO sees request marked as accepted');

      // Cleanup test records
      await makeRequest(`/api/food/${createdFoodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${donorToken}` },
      });
      console.log('🧹 Cleaned up test food listing and associated request.');
    }

    // 16. Profile endpoint
    const profileRes = await makeRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert(profileRes.status === 200 && profileRes.data?.email === 'donor@example.com', 'Get logged-in user profile returns valid MySQL user record');

    console.log('========================================================');
    console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
    console.log('========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test execution error:', err);
    process.exit(1);
  }
}

runTests();
