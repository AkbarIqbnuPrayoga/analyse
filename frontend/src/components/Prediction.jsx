import React, { useEffect, useState } from 'react';
import '../styles/Prediction.css';

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    fetchPrediction();
    const interval = setInterval(fetchPrediction, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prediction && displayScore < prediction.score) {
      const timer = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + 2, prediction.score));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [displayScore, prediction]);

  const fetchPrediction = async () => {
    try {
      const res = await fetch('/api/xauusd/prediction');
      const data = await res.json();
      setPrediction(data);
      setDisplayScore(0);
      setLoading(false);
    } catch (err) {
      console.error('Error loading prediction:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="prediction-container">
        <div className="prediction-skeleton">
          <div className="skeleton-bar"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="prediction-container">
        <div className="prediction-error">
          <p>Unable to load prediction data</p>
        </div>
      </div>
    );
  }

  const getTrendConfig = (trend) => {
    switch (trend) {
      case 'UP':
        return { color: '#10b981', icon: '↑', label: 'BULLISH', glow: 'glow-green' };
      case 'DOWN':
        return { color: '#ef4444', icon: '↓', label: 'BEARISH', glow: 'glow-red' };
      case 'SIDEWAYS':
      default:
        return { color: '#f59e0b', icon: '→', label: 'NEUTRAL', glow: 'glow-amber' };
    }
  };

  const getConfidenceConfig = (confidence) => {
    switch (confidence) {
      case 'HIGH':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', level: 'HIGH' };
      case 'MEDIUM':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', level: 'MEDIUM' };
      case 'LOW':
      default:
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', level: 'LOW' };
    }
  };

  const trendConfig = getTrendConfig(prediction.trend);
  const confidenceConfig = getConfidenceConfig(prediction.confidence);

  const bullishPercent = prediction.totalSignals > 0
    ? Math.round((prediction.bullishSignals / prediction.totalSignals) * 100)
    : 0;
  const bearishPercent = prediction.totalSignals > 0
    ? Math.round((prediction.bearishSignals / prediction.totalSignals) * 100)
    : 0;

  return (
    <div className="prediction-container">
      <div className="prediction-card">
        {/* Header Section */}
        <div className="prediction-header">
          <div className="header-content">
            <h2 className="prediction-title">Market Prediction</h2>
            <p className="prediction-timestamp">
              Updated just now
            </p>
          </div>
          <div className="price-badge">
            ${prediction.lastPrice?.toFixed(2)}
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="trend-section">
          <div className={`trend-indicator ${trendConfig.glow}`}>
            <div className="trend-icon" style={{ color: trendConfig.color }}>
              {trendConfig.icon}
            </div>
          </div>
          <div className="trend-details">
            <div className="trend-label" style={{ color: trendConfig.color }}>
              {trendConfig.label}
            </div>
            <div className="trend-status">
              Market is trending {prediction.trend}
            </div>
          </div>
        </div>

        {/* Score Section */}
        <div className="score-section">
          <div className="score-header">
            <label className="score-label">Prediction Strength</label>
            <span className="score-value">{displayScore}%</span>
          </div>
          <div className="score-bar-container">
            <div className="score-bar">
              <div
                className="score-fill"
                style={{
                  width: `${displayScore}%`,
                  backgroundColor: trendConfig.color,
                  boxShadow: `0 0 20px ${trendConfig.color}40`
                }}
              />
            </div>
          </div>
          <div className="score-description">
            {displayScore >= 75 ? 'Strong signal detected' :
             displayScore >= 50 ? 'Moderate signal detected' :
             'Weak signal detected'}
          </div>
        </div>

        {/* Confidence & Signals Grid */}
        <div className="metrics-grid">
          {/* Confidence Badge */}
          <div className="metric-card confidence-card" style={{ backgroundColor: confidenceConfig.bg }}>
            <div className="metric-label">Confidence</div>
            <div className="confidence-display">
              <div className="confidence-circle" style={{ borderColor: confidenceConfig.color }}>
                <span className="confidence-level" style={{ color: confidenceConfig.color }}>
                  {confidenceConfig.level}
                </span>
              </div>
            </div>
          </div>

          {/* Signal Breakdown */}
          <div className="metric-card signals-card">
            <div className="metric-label">Signal Breakdown</div>
            <div className="signals-breakdown">
              <div className="signal-row">
                <div className="signal-item bullish-signal">
                  <span className="signal-dot" style={{ backgroundColor: '#10b981' }}></span>
                  <span className="signal-name">Bullish</span>
                  <span className="signal-value">{prediction.bullishSignals}/{prediction.totalSignals}</span>
                </div>
                <div className="signal-bar-mini">
                  <div
                    className="signal-fill"
                    style={{
                      width: `${bullishPercent}%`,
                      backgroundColor: '#10b981'
                    }}
                  />
                </div>
              </div>
              <div className="signal-row">
                <div className="signal-item bearish-signal">
                  <span className="signal-dot" style={{ backgroundColor: '#ef4444' }}></span>
                  <span className="signal-name">Bearish</span>
                  <span className="signal-value">{prediction.bearishSignals}/{prediction.totalSignals}</span>
                </div>
                <div className="signal-bar-mini">
                  <div
                    className="signal-fill"
                    style={{
                      width: `${bearishPercent}%`,
                      backgroundColor: '#ef4444'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signals List */}
        {prediction.signals && prediction.signals.length > 0 && (
          <div className="signals-list-section">
            <div className="signals-list-header">
              <h3>Technical Signals</h3>
              <span className="signals-count">{prediction.signals.length}</span>
            </div>
            <div className="signals-list">
              {prediction.signals.slice(0, 5).map((signal, i) => (
                <div key={i} className="signal-item-detailed">
                  <span className="signal-bullet">→</span>
                  <span className="signal-text">{signal}</span>
                </div>
              ))}
              {prediction.signals.length > 5 && (
                <div className="signals-more">
                  +{prediction.signals.length - 5} more signals
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="prediction-disclaimer">
          <div className="disclaimer-icon">⚠</div>
          <p>
            <strong>Disclaimer:</strong> This technical analysis tool provides signals based on historical data.
            Always conduct independent research and consult financial advisors before trading.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Prediction;
