# Express Backend to Vercel Serverless Functions Refactor

## Project Structure

```
xauusd-analyzer/
├── api/
│   └── xauusd/
│       ├── price.js          (GET /api/xauusd/price)
│       ├── history.js        (GET /api/xauusd/history)
│       ├── indicators.js     (GET /api/xauusd/indicators)
│       └── prediction.js     (GET /api/xauusd/prediction)
├── lib/
│   ├── analysis.js           (Technical analysis functions)
│   └── dataFetcher.js        (Data fetching & CORS utilities)
├── backend/src/              (Legacy Express server - can be deprecated)
│   ├── server.js
│   ├── analysis.js
│   └── dataFetcher.js
├── frontend/                 (Frontend application)
└── vercel.json              (Vercel configuration)
```

## API Endpoints

All endpoints are now serverless Vercel functions:

### 1. GET /api/xauusd/price
- **File**: `api/xauusd/price.js`
- **Description**: Get current XAU/USD price with change metrics
- **Response**: 
  ```json
  {
    "price": 2050.25,
    "change": 5.50,
    "changePercent": 0.27,
    "timestamp": "2026-06-07T09:12:36.611Z"
  }
  ```

### 2. GET /api/xauusd/history
- **File**: `api/xauusd/history.js`
- **Query Parameters**: 
  - `days` (optional, default: 30)
- **Description**: Get historical OHLCV data
- **Response**: Array of historical price data

### 3. GET /api/xauusd/indicators
- **File**: `api/xauusd/indicators.js`
- **Query Parameters**:
  - `period` (optional, default: 20)
  - `days` (optional, default: 30)
- **Description**: Calculate technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- **Response**: Indicators object with all calculated values

### 4. GET /api/xauusd/prediction
- **File**: `api/xauusd/prediction.js`
- **Description**: Generate prediction score and trading signal
- **Response**:
  ```json
  {
    "score": 45,
    "signal": "BUY",
    "indicators": {...},
    "timestamp": "2026-06-07T09:12:36.611Z"
  }
  ```

## Key Features

### CORS Headers
All endpoints include CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,OPTIONS,PATCH,DELETE,POST,PUT`
- `Access-Control-Allow-Headers: X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version`

### Shared Libraries (lib/)

#### `lib/dataFetcher.js`
- `getCurrentPrice()` - Get current price data
- `getHistoricalData(days)` - Get historical data with caching
- `addCorsHeaders(res)` - Add CORS headers to response
- `handleOptions(req, res)` - Handle OPTIONS requests

#### `lib/analysis.js`
Technical analysis functions:
- `calculateSMA(prices, period)` - Simple Moving Average
- `calculateEMA(prices, period)` - Exponential Moving Average
- `calculateRSI(prices, period)` - Relative Strength Index
- `calculateMACD(prices, ...)` - MACD indicator
- `calculateBollingerBands(prices, ...)` - Bollinger Bands
- `analyzeTrend(prices, ...)` - Trend analysis
- `generatePredictionScore(prices)` - Trading signal generation
- `analyzeIndicators(historyData, period)` - All indicators calculation
- `predictTrend(historyData, indicators)` - Trend prediction

### Error Handling
Each function includes:
- Method validation (GET only)
- Query parameter validation with type checking
- Try-catch error handling
- Consistent error response format

## Vercel Configuration

The `vercel.json` file is configured to:
- Set Node.js 18.x runtime for all API functions
- Route `/api/*` requests to corresponding `.js` files
- Serve frontend static assets from `/frontend/dist/`
- Support environment variables (e.g., ALPHA_VANTAGE_KEY)

## Migration Notes

- Backend Express server in `backend/src/` can be deprecated
- All functionality migrated to serverless functions
- Mock data is used for development (can be replaced with real API calls)
- File-based routing automatically creates the endpoints
- Each function is isolated and can scale independently

## Deployment

To deploy to Vercel:
```bash
vercel deploy
```

The serverless functions will be automatically created and routed based on the file structure.
