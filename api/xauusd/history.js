import { getHistoricalData, addCorsHeaders, handleOptions } from '../../lib/dataFetcher.js';

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

    const { days = 30 } = req.query;
    const daysInt = parseInt(days, 10);

    if (isNaN(daysInt) || daysInt < 1) {
      return res.status(400).json({ error: 'Invalid days parameter' });
    }

    const history = getHistoricalData(daysInt);

    return res.status(200).json(history);
  } catch (error) {
    addCorsHeaders(res);
    console.error('Error in /api/history:', error);
    return res.status(500).json({ error: error.message });
  }
}
