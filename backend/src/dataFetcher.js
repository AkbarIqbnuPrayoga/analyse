import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Cache directories and files
const CACHE_DIR = path.join(__dirname, '../cache');
const CACHE_FILE = path.join(CACHE_DIR, 'xauusd_cache.json');
const RATE_LIMIT_FILE = path.join(CACHE_DIR, 'rate_limit.json');

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 5,
  minDelayMs: 300
};

// In-memory rate limit tracking
let requestQueue = [];
let isProcessingQueue = false;
let lastRequestTime = 0;
let requestCount = 0;
let rateLimitResetTime = Date.now() + 60000;

// Initialize cache directory
function initializeCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// Load rate limit state
function loadRateLimitState() {
  try {
    if (fs.existsSync(RATE_LIMIT_FILE)) {
      const state = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf-8'));
      requestCount = state.requestCount || 0;
      rateLimitResetTime = state.resetTime || Date.now() + 60000;

      if (Date.now() > rateLimitResetTime) {
        requestCount = 0;
        rateLimitResetTime = Date.now() + 60000;
      }
    }
  } catch (error) {
    console.error('Error loading rate limit state:', error.message);
  }
}

// Save rate limit state
function saveRateLimitState() {
  try {
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify({ requestCount, resetTime: rateLimitResetTime }));
  } catch (error) {
    console.error('Error saving rate limit state:', error.message);
  }
}

// Rate limited request queue processor
async function rateLimitedRequest(url, config = {}) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ url, config, resolve, reject });
    processQueue();
  });
}

// Process queued requests with rate limiting
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    // Reset counter if minute has passed
    if (Date.now() > rateLimitResetTime) {
      requestCount = 0;
      rateLimitResetTime = Date.now() + 60000;
    }

    // If rate limit exceeded, wait
    if (requestCount >= RATE_LIMIT.requestsPerMinute) {
      const waitTime = Math.max(100, rateLimitResetTime - Date.now());
      console.log(`Rate limit reached (${requestCount}/${RATE_LIMIT.requestsPerMinute}). Waiting ${waitTime}ms.`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    // Enforce minimum delay between requests
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT.minDelayMs) {
      await new Promise(resolve =>
        setTimeout(resolve, RATE_LIMIT.minDelayMs - timeSinceLastRequest)
      );
    }

    const { url, config, resolve, reject } = requestQueue.shift();

    try {
      lastRequestTime = Date.now();
      requestCount++;
      saveRateLimitState();

      const response = await axios.get(url, { ...config, timeout: 8000 });
      resolve(response);
    } catch (error) {
      // Handle rate limit errors with exponential backoff
      if (error.response?.status === 429 || error.message?.includes('API call frequency')) {
        console.log('API rate limit detected. Retrying with backoff...');
        const backoffDelay = Math.pow(2, Math.min(4, Math.floor(Math.random() * 5))) * 1000;
        setTimeout(() => {
          requestQueue.unshift({ url, config, resolve, reject });
          processQueue();
        }, backoffDelay);
      } else {
        reject(error);
      }
    }
  }

  isProcessingQueue = false;
}

// Format API response to OHLCV format
function formatOHLCV(timeSeries) {
  const data = [];

  for (const [date, values] of Object.entries(timeSeries)) {
    data.push({
      timestamp: new Date(date).toISOString(),
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'] || 0)
    });
  }

  // Sort by date ascending
  return data.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Mock data for demonstration
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

// Get cached data
function getCachedData() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const cacheAge = Date.now() - cache.timestamp;

      // Cache valid for 24 hours
      if (cacheAge < 24 * 60 * 60 * 1000) {
        console.log(`Using cached data (${Math.round(cacheAge / 1000)}s old)`);
        return cache.data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error.message);
  }

  return null;
}

// Save data to cache file
function saveDataToCache(data) {
  try {
    const cache = {
      timestamp: Date.now(),
      data
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('Data saved to cache');
  } catch (error) {
    console.error('Error saving cache:', error.message);
  }
}

// Fetch from Alpha Vantage API
async function fetchFromAlphaVantage(symbol = 'XAU/USD', outputSize = 'compact') {
  try {
    console.log(`Fetching ${symbol} data from Alpha Vantage...`);

    const response = await rateLimitedRequest(BASE_URL, {
      params: {
        function: 'FX_DAILY',
        from_symbol: 'XAU',
        to_symbol: 'USD',
        apikey: API_KEY,
        outputsize: outputSize
      }
    });

    if (response.data['Note']) {
      console.warn('API rate limit:', response.data['Note']);
      return null;
    }

    if (response.data['Error Message']) {
      console.warn('API error:', response.data['Error Message']);
      return null;
    }

    if (!response.data['Time Series FX (Daily)']) {
      throw new Error('Invalid API response format');
    }

    return formatOHLCV(response.data['Time Series FX (Daily)']);
  } catch (error) {
    console.error('Error fetching from Alpha Vantage:', error.message);
    return null;
  }
}

// Export: Fetch current XAU/USD price
export async function fetchXAUUSDData() {
  try {
    initializeCacheDir();
    loadRateLimitState();

    const data = await getHistoricalData(1);

    if (data && data.length >= 2) {
      const latest = data[data.length - 1];
      const prev = data[data.length - 2];

      return {
        price: latest.close,
        high: latest.high,
        low: latest.low,
        open: latest.open,
        change: (latest.close - prev.close).toFixed(2),
        changePercent: (((latest.close - prev.close) / prev.close) * 100).toFixed(2),
        timestamp: latest.timestamp,
        volume: latest.volume
      };
    }

    throw new Error('Insufficient data');
  } catch (error) {
    console.error('Error fetching current XAU/USD data:', error.message);
    throw error;
  }
}

// Export: Get historical data with caching and rate limiting
export async function getHistoricalData(days = 30) {
  try {
    initializeCacheDir();
    loadRateLimitState();

    // Try to get cached data first
    const cachedData = getCachedData();
    if (cachedData) {
      return cachedData.slice(Math.max(0, cachedData.length - days));
    }

    // Determine output size based on days requested
    const outputSize = days > 100 ? 'full' : 'compact';

    // Fetch fresh data
    let data = await fetchFromAlphaVantage('XAU/USD', outputSize);

    // Fallback to mock data if API fails
    if (!data) {
      console.warn('Using mock data (API unavailable)');
      data = generateMockData(Math.min(days, 100));
    }

    // Save to cache
    saveDataToCache(data);

    // Return requested days
    return data.slice(Math.max(0, data.length - days));
  } catch (error) {
    console.error('Error fetching historical data:', error.message);

    // Try to return cached data even if expired
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        return cache.data.slice(Math.max(0, cache.data.length - days));
      }
    } catch (e) {
      // Ignore cache read errors
    }

    // Last resort: mock data
    return generateMockData(days);
  }
}

// Export: Cache utility
export function cacheData(data, duration = 24 * 60 * 60 * 1000) {
  return {
    data,
    timestamp: Date.now(),
    duration,
    isExpired() {
      return Date.now() - this.timestamp > duration;
    }
  };
}

// Export: Get cache status
export function getCacheStatus() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const cacheAge = Date.now() - cache.timestamp;

      return {
        hasCachedData: true,
        cacheAge: Math.round(cacheAge / 1000),
        cacheAgeMinutes: Math.round(cacheAge / 60000),
        recordCount: cache.data.length,
        isExpired: cacheAge > 24 * 60 * 60 * 1000
      };
    }

    return {
      hasCachedData: false,
      cacheAge: null,
      recordCount: 0,
      isExpired: true
    };
  } catch (error) {
    console.error('Error checking cache status:', error.message);
    return { error: error.message };
  }
}

// Initialize on module load
initializeCacheDir();
loadRateLimitState();
