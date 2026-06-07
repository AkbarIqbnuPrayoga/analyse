import React, { useEffect, useState } from 'react';
import Chart from './components/Chart';
import TechnicalIndicators from './components/TechnicalIndicators';
import Prediction from './components/Prediction';
import './App.css';

function App() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1d');

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrice = async () => {
    try {
      const res = await fetch('/api/xauusd/price');
      const data = await res.json();
      setPrice(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏆 XAU/USD Analyzer</h1>
        <div className="price-display">
          {price && (
            <>
              <span className="price">${price.price.toFixed(2)}</span>
              <span className={`change ${price.change > 0 ? 'up' : 'down'}`}>
                {price.change > 0 ? '+' : ''}{price.change} ({price.changePercent}%)
              </span>
            </>
          )}
        </div>
      </header>

      <div className="controls">
        <button
          className={timeframe === '1h' ? 'active' : ''}
          onClick={() => setTimeframe('1h')}
        >
          1H
        </button>
        <button
          className={timeframe === '4h' ? 'active' : ''}
          onClick={() => setTimeframe('4h')}
        >
          4H
        </button>
        <button
          className={timeframe === '1d' ? 'active' : ''}
          onClick={() => setTimeframe('1d')}
        >
          1D
        </button>
        <button
          className={timeframe === '1w' ? 'active' : ''}
          onClick={() => setTimeframe('1w')}
        >
          1W
        </button>
      </div>

      <div className="container">
        <Chart timeframe={timeframe} />
        <TechnicalIndicators />
        <Prediction />
      </div>
    </div>
  );
}

export default App;
