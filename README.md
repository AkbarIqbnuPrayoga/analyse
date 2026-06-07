# XAU/USD Analyzer 📊

A full-stack web application for analyzing XAU/USD (gold/US dollar) price charts with real-time data, technical indicators, and AI-powered trend prediction.

## Features

### 📈 Chart Analysis
- **Candlestick Charts** — Interactive price visualization with lightweight-charts
- **Volume Bars** — Volume data displayed beneath the chart
- **Multiple Timeframes** — 1H, 4H, 1D, 1W views
- **Interactive Controls** — Scroll to zoom, drag to pan

### 🎯 Technical Indicators
- **SMA (Simple Moving Average)** — Trend identification
- **EMA (Exponential Moving Average)** — Responsive trend tracking
- **RSI (Relative Strength Index)** — Overbought/oversold detection
- **MACD** — Momentum and trend direction
- **Bollinger Bands** — Volatility and support/resistance
- **ATR (Average True Range)** — Volatility measurement

### 🔮 Trend Prediction
- **AI-Powered Analysis** — Calculates signals from multiple indicators
- **Confidence Levels** — HIGH, MEDIUM, LOW
- **Signal Breakdown** — Shows bullish/bearish signals
- **Prediction Strength** — 0-100% score based on signal agreement

### 💾 Data Management
- **Real-time Data** — Fetches latest XAU/USD prices
- **Historical Data** — Caches candlestick data for performance
- **Rate Limiting** — Manages API call frequency
- **Mock Data Fallback** — Works without API key for testing

## Project Structure

```
xauusd-analyzer/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express API server
│   │   ├── analysis.js        # Technical analysis engine
│   │   └── dataFetcher.js     # Data fetching & caching
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── components/
│   │   │   ├── Chart.jsx      # Candlestick chart
│   │   │   ├── TechnicalIndicators.jsx
│   │   │   └── Prediction.jsx # Trend prediction panel
│   │   ├── styles/            # CSS modules
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── verify.mjs                 # Verification script
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone or navigate to the project:**
```bash
cd xauusd-analyzer
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

3. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

### Running the Application

**Terminal 1 - Backend (port 5000):**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (port 3000):**
```bash
cd frontend
npm run dev
```

Then open your browser to: **http://localhost:3000**

## API Endpoints

### Current Price
```
GET /api/xauusd/price
Returns: { price, change, changePercent, timestamp }
```

### Historical Data
```
GET /api/xauusd/history?days=30
Returns: Array of OHLCV candles
```

### Technical Indicators
```
GET /api/xauusd/indicators?period=20&days=30
Returns: { indicators: {sma, ema, rsi, macd, bollingerBands, atr}, prediction }
```

### Trend Prediction
```
GET /api/xauusd/prediction
Returns: { trend, score, confidence, signals, bullishSignals, bearishSignals, totalSignals }
```

## Configuration

### Using Real API Data

To use live market data from Alpha Vantage:

1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/api)

2. Set environment variable:
```bash
export ALPHA_VANTAGE_KEY="your_key_here"
npm start
```

### Rate Limiting

The backend includes built-in rate limiting:
- **5 requests per minute** (Alpha Vantage free tier)
- **300ms minimum delay** between requests
- **Exponential backoff** for 429 errors

## Technical Stack

### Backend
- **Express.js** — Web framework
- **Axios** — HTTP client
- **Node.js** — Runtime

### Frontend
- **React 18** — UI library
- **Vite** — Build tool
- **lightweight-charts** — Charting library
- **Tailwind CSS** — Styling

## How It Works

### Analysis Engine
1. Fetches historical candlestick data
2. Calculates technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
3. Analyzes signals from each indicator
4. Generates prediction based on signal agreement
5. Returns trend (UP/DOWN/NEUTRAL) with confidence level

### Prediction Scoring
- Each indicator generates a bullish or bearish signal
- Bullish signals increase score, bearish decrease
- Final score = (bullish_signals / total_signals) × 100
- Confidence based on total number of signals

## Example Usage

### Starting Fresh
```bash
# Install everything
npm install --prefix backend
npm install --prefix frontend

# Run both servers in separate terminals
npm start --prefix backend
npm run dev --prefix frontend

# Open http://localhost:3000
```

### Development
```bash
# Backend with auto-reload
cd backend && npm run dev

# Frontend with hot reload
cd frontend && npm run dev
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build
# Output: dist/

# Backend runs as-is with npm start
```

## Disclaimer

⚠️ **This is a technical analysis tool for educational purposes.** 

- Past performance is not indicative of future results
- Not financial advice — always do your own research
- Consult financial advisors before making trading decisions
- Use at your own risk

## Features for Future Enhancement

- [ ] Historical predictions accuracy tracking
- [ ] Multiple trading pair support
- [ ] Alert system for price/indicator thresholds
- [ ] Machine learning predictions
- [ ] User accounts and saved watchlists
- [ ] Mobile app version
- [ ] WebSocket real-time updates

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ for gold traders and analysts
