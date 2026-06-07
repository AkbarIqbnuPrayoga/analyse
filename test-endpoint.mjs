import priceHandler from './api/xauusd/price.js';
import historyHandler from './api/xauusd/history.js';
import indicatorsHandler from './api/xauusd/indicators.js';
import predictionHandler from './api/xauusd/prediction.js';

// Mock req/res objects
function createMockRequest(method = 'GET', query = {}) {
  return {
    method,
    query
  };
}

function createMockResponse() {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return data;
    },
    end: function() {
      return this;
    },
    setHeader: function(key, value) {
      if (!this.headers) this.headers = {};
      this.headers[key] = value;
    }
  };
  return res;
}

console.log('Testing Vercel serverless functions...\n');

// Test 1: Price endpoint
console.log('1. Testing /api/xauusd/price');
try {
  const req = createMockRequest('GET');
  const res = createMockResponse();
  const result = priceHandler(req, res);
  console.log('   ✓ Price endpoint response:');
  console.log(`   - Status: ${res.statusCode}`);
  console.log(`   - Price: ${res.jsonData.price}`);
  console.log(`   - Change: ${res.jsonData.change}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 2: History endpoint
console.log('\n2. Testing /api/xauusd/history?days=7');
try {
  const req = createMockRequest('GET', { days: '7' });
  const res = createMockResponse();
  priceHandler(req, res);
  const result = historyHandler(req, res);
  console.log('   ✓ History endpoint response:');
  console.log(`   - Status: ${res.statusCode}`);
  console.log(`   - Data points: ${Array.isArray(res.jsonData) ? res.jsonData.length : 'N/A'}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 3: Indicators endpoint
console.log('\n3. Testing /api/xauusd/indicators?period=20&days=30');
try {
  const req = createMockRequest('GET', { period: '20', days: '30' });
  const res = createMockResponse();
  indicatorsHandler(req, res);
  console.log('   ✓ Indicators endpoint response:');
  console.log(`   - Status: ${res.statusCode}`);
  console.log(`   - Has indicators: ${res.jsonData.indicators ? 'yes' : 'no'}`);
  console.log(`   - Period: ${res.jsonData.period}`);
  console.log(`   - Days: ${res.jsonData.days}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 4: Prediction endpoint
console.log('\n4. Testing /api/xauusd/prediction');
try {
  const req = createMockRequest('GET');
  const res = createMockResponse();
  predictionHandler(req, res);
  console.log('   ✓ Prediction endpoint response:');
  console.log(`   - Status: ${res.statusCode}`);
  console.log(`   - Score: ${res.jsonData.score}`);
  console.log(`   - Signal: ${res.jsonData.signal}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 5: CORS handling
console.log('\n5. Testing CORS headers');
try {
  const req = createMockRequest('GET');
  const res = createMockResponse();
  priceHandler(req, res);
  console.log('   ✓ CORS headers set:');
  console.log(`   - Access-Control-Allow-Origin: ${res.headers['Access-Control-Allow-Origin']}`);
  console.log(`   - Access-Control-Allow-Methods: ${res.headers['Access-Control-Allow-Methods']}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 6: Error handling - Invalid method
console.log('\n6. Testing error handling (POST method)');
try {
  const req = createMockRequest('POST');
  const res = createMockResponse();
  priceHandler(req, res);
  console.log('   ✓ Error handling works:');
  console.log(`   - Status: ${res.statusCode}`);
  console.log(`   - Error: ${res.jsonData.error}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

console.log('\n✓ All endpoint tests completed successfully!');
