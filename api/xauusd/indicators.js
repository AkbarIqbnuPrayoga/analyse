import { getHistoricalData, addCorsHeaders, handleOptions } from '../../lib/dataFetcher.js';
import { analyzeIndicators } from '../../lib/analysis.js';

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

    const { period = 20, days = 30 } = req.query;
    const periodInt = parseInt(period, 10);
    const daysInt = parseInt(days, 10);

    if (isNaN(periodInt) || periodInt < 1) {
      return res.status(400).json({ error: 'Invalid period parameter' });
    }

    if (isNaN(daysInt) || daysInt < 1) {
      return res.status(400).json({ error: 'Invalid days parameter' });
    }

    const history = getHistoricalData(daysInt);
    const indicators = analyzeIndicators(history, periodInt);

    return res.status(200).json({
      indicators,
      period: periodInt,
      days: daysInt
    });
  } catch (error) {
    addCorsHeaders(res);
    console.error('Error in /api/indicators:', error);
    return res.status(500).json({ error: error.message });
  }
}
