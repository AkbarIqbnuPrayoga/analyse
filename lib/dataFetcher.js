// Mock data generator for serverless
function generateMockData(days = 30) {
  const data = [];
  let price = 2050;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = price;
    const high = price + Math.random() * 15;
    const low = price - Math.random() * 15;
    price = low + Math.random() * (high - low);
    const close = price;

    data.push({
      timestamp: date.toISOString(),
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000)
    });
  }

  return data;
}

// Get current price
export function getCurrentPrice() {
  const data = generateMockData(1);
  if (data.length < 2) {
    return {
      price: 2050,
      change: 0,
      changePercent: 0,
      timestamp: new Date().toISOString()
    };
  }

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  return {
    price: parseFloat(latest.close),
    change: parseFloat((latest.close - prev.close).toFixed(2)),
    changePercent: parseFloat((((latest.close - prev.close) / prev.close) * 100).toFixed(2)),
    timestamp: latest.timestamp
  };
}

// Get historical data
export function getHistoricalData(days = 30) {
  return generateMockData(days);
}

// Add CORS headers to response
export function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');
}

// Handle OPTIONS requests
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    addCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}
