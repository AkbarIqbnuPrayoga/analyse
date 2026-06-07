import { getHistoricalData, addCorsHeaders, handleOptions } from '../../lib/dataFetcher.js';
import { analyzeIndicators, predictTrend } from '../../lib/analysis.js';

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

    const history = getHistoricalData(30);
    const indicators = analyzeIndicators(history, 20);
    const prediction = predictTrend(history, indicators);

    return res.status(200).json(prediction);
  } catch (error) {
    addCorsHeaders(res);
    console.error('Error in /api/prediction:', error);
    return res.status(500).json({ error: error.message });
  }
}
