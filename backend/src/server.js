import express from 'express';
import cors from 'cors';
import { fetchXAUUSDData, getHistoricalData, cacheData } from './dataFetcher.js';
import { analyzeIndicators, predictTrend } from './analysis.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Cache for data
let dataCache = {
  lastFetch: 0,
  data: null,
  indicators: null
};

const CACHE_DURATION = 60000; // 1 minute

app.get('/api/xauusd/price', async (req, res) => {
  try {
    const data = await fetchXAUUSDData();
    res.json({
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      timestamp: data.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/xauusd/history', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const now = Date.now();

    if (now - dataCache.lastFetch > CACHE_DURATION) {
      const history = await getHistoricalData(parseInt(days));
      dataCache.data = history;
      dataCache.lastFetch = now;
    }

    res.json(dataCache.data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/xauusd/indicators', async (req, res) => {
  try {
    const { period = 20, days = 30 } = req.query;

    const history = await getHistoricalData(parseInt(days));
    const indicators = analyzeIndicators(history, parseInt(period));
    const prediction = predictTrend(history, indicators);

    res.json({
      indicators,
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/xauusd/prediction', async (req, res) => {
  try {
    const history = await getHistoricalData(30);
    const indicators = analyzeIndicators(history, 20);
    const prediction = predictTrend(history, indicators);

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 XAU/USD Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/xauusd/price`);
  console.log(`   GET /api/xauusd/history?days=30`);
  console.log(`   GET /api/xauusd/indicators?period=20&days=30`);
  console.log(`   GET /api/xauusd/prediction`);
});
