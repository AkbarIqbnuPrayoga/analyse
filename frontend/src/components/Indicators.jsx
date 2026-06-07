import React, { useEffect, useState } from 'react';
import '../styles/Indicators.css';

function Indicators() {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchIndicators = async () => {
    try {
      const res = await fetch('/api/xauusd/indicators?period=20&days=30');
      const data = await res.json();
      setIndicators(data.indicators);
      setLoading(false);
    } catch (err) {
      console.error('Error loading indicators:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="indicators-container"><p>Loading...</p></div>;
  if (!indicators) return <div className="indicators-container"><p>No data</p></div>;

  const lastSMA = indicators.sma?.[indicators.sma.length - 1]?.toFixed(2);
  const lastEMA = indicators.ema?.[indicators.ema.length - 1]?.toFixed(2);
  const lastRSI = indicators.rsi?.[indicators.rsi.length - 1]?.toFixed(2);
  const lastBB = indicators.bollingerBands?.[indicators.bollingerBands.length - 1];

  return (
    <div className="indicators-container">
      <h2>Technical Indicators</h2>
      <div className="indicators-grid">
        <div className="indicator">
          <h3>SMA (20)</h3>
          <p className="value">${lastSMA}</p>
        </div>
        <div className="indicator">
          <h3>EMA (20)</h3>
          <p className="value">${lastEMA}</p>
        </div>
        <div className="indicator">
          <h3>RSI (14)</h3>
          <p className={`value ${lastRSI > 70 ? 'overbought' : lastRSI < 30 ? 'oversold' : ''}`}>
            {lastRSI}
          </p>
          <small>{lastRSI > 70 ? 'Overbought' : lastRSI < 30 ? 'Oversold' : 'Neutral'}</small>
        </div>
        <div className="indicator">
          <h3>Bollinger Bands</h3>
          {lastBB && (
            <>
              <p>Upper: ${lastBB.upper.toFixed(2)}</p>
              <p>Middle: ${lastBB.middle.toFixed(2)}</p>
              <p>Lower: ${lastBB.lower.toFixed(2)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Indicators;
