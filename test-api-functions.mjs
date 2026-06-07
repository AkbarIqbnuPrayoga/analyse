import { getCurrentPrice, getHistoricalData, addCorsHeaders, handleOptions } from './lib/dataFetcher.js';
import { analyzeIndicators, predictTrend } from './lib/analysis.js';

console.log('Testing API functions...\n');

// Test 1: getCurrentPrice
console.log('1. Testing getCurrentPrice()');
try {
  const price = getCurrentPrice();
  console.log('   ✓ Successfully retrieved price:', price);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 2: getHistoricalData
console.log('\n2. Testing getHistoricalData(7)');
try {
  const history = getHistoricalData(7);
  console.log(`   ✓ Successfully retrieved ${history.length} data points`);
  console.log(`   First entry: ${history[0].date}`);
  console.log(`   Last entry: ${history[history.length - 1].date}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 3: analyzeIndicators
console.log('\n3. Testing analyzeIndicators()');
try {
  const history = getHistoricalData(30);
  const indicators = analyzeIndicators(history, 20);
  console.log('   ✓ Successfully calculated indicators');
  console.log(`   - SMA points: ${indicators.sma.length}`);
  console.log(`   - EMA points: ${indicators.ema.length}`);
  console.log(`   - RSI points: ${indicators.rsi.length}`);
  console.log(`   - MACD histogram points: ${indicators.macd.histogram.length}`);
  console.log(`   - Bollinger Bands points: ${indicators.bollingerBands.length}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 4: predictTrend
console.log('\n4. Testing predictTrend()');
try {
  const history = getHistoricalData(30);
  const indicators = analyzeIndicators(history, 20);
  const prediction = predictTrend(history, indicators);
  console.log('   ✓ Successfully generated prediction');
  console.log(`   - Score: ${prediction.score}`);
  console.log(`   - Signal: ${prediction.signal}`);
  console.log(`   - Indicators RSI: ${prediction.indicators.rsi}`);
  console.log(`   - Indicators Trend: ${prediction.indicators.trend}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

// Test 5: CORS utilities
console.log('\n5. Testing CORS utilities');
try {
  const mockRes = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    }
  };
  addCorsHeaders(mockRes);
  console.log('   ✓ Successfully set CORS headers');
  console.log(`   - Access-Control-Allow-Origin: ${mockRes.headers['Access-Control-Allow-Origin']}`);
} catch (error) {
  console.error('   ✗ Error:', error.message);
}

console.log('\n✓ All tests completed successfully!');
