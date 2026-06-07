import { getCurrentPrice, addCorsHeaders, handleOptions } from '../../lib/dataFetcher.js';

export default function handler(req, res) {
  // Handle CORS preflight
  if (handleOptions(req, res)) {
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    addCorsHeaders(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    addCorsHeaders(res);

    const data = getCurrentPrice();

    return res.status(200).json({
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      timestamp: data.timestamp
    });
  } catch (error) {
    addCorsHeaders(res);
    console.error('Error in /api/price:', error);
    return res.status(500).json({ error: error.message });
  }
}
