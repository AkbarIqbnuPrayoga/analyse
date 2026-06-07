import React, { useEffect, useState, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import '../styles/TechnicalIndicators.css';

function TechnicalIndicators() {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartsRef = useRef({});
  const containerRefs = useRef({});

  const [enabled, setEnabled] = useState({
    sma: true,
    rsi: true,
    macd: true,
    bollingerBands: true
  });

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (indicators) {
      renderCharts();
    }
  }, [indicators, enabled]);

  const fetchIndicators = async () => {
    try {
      const res = await fetch('/api/xauusd/indicators?period=20&days=30');
      if (!res.ok) throw new Error('Failed to fetch indicators');
      const data = await res.json();
      setIndicators(data.indicators);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error loading indicators:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderCharts = () => {
    if (enabled.sma && indicators.sma && containerRefs.current.sma) {
      renderSMAChart();
    }
    if (enabled.rsi && indicators.rsi && containerRefs.current.rsi) {
      renderRSIChart();
    }
    if (enabled.macd && indicators.macd && containerRefs.current.macd) {
      renderMACDChart();
    }
    if (enabled.bollingerBands && indicators.bollingerBands && containerRefs.current.bollingerBands) {
      renderBollingerBandsChart();
    }
  };

  const renderSMAChart = () => {
    const container = containerRefs.current.sma;
    if (!container) return;

    if (chartsRef.current.sma) {
      chartsRef.current.sma.remove();
    }

    const chart = createChart(container, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#111827' }
      },
      width: container.clientWidth,
      height: 250,
      timeScale: {
        timeVisible: false,
        secondsVisible: false
      }
    });

    chartsRef.current.sma = chart;

    const lineSeries = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2
    });

    const data = indicators.sma.map((value, idx) => ({
      time: idx,
      value: parseFloat(value)
    }));

    lineSeries.setData(data);
    chart.timeScale().fitContent();
  };

  const renderRSIChart = () => {
    const container = containerRefs.current.rsi;
    if (!container) return;

    if (chartsRef.current.rsi) {
      chartsRef.current.rsi.remove();
    }

    const width = container.clientWidth || 400;
    const chart = createChart(container, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#111827' }
      },
      width: Math.max(width, 300),
      height: 250,
      timeScale: {
        timeVisible: false,
        secondsVisible: false
      }
    });

    chartsRef.current.rsi = chart;

    const lineSeries = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2
    });

    const data = indicators.rsi.map((value, idx) => ({
      time: idx,
      value: parseFloat(value)
    }));

    lineSeries.setData(data);

    try {
      chart.priceScale('right').applyOptions({
        minValue: 0,
        maxValue: 100
      });

      // Add overbought/oversold markers
      chart.addLineSeries({ color: '#ef4444', lineStyle: 2 }).setData([
        { time: 0, value: 70 },
        { time: data.length - 1, value: 70 }
      ]);

      chart.addLineSeries({ color: '#10b981', lineStyle: 2 }).setData([
        { time: 0, value: 30 },
        { time: data.length - 1, value: 30 }
      ]);
    } catch (e) {
      console.warn('RSI chart setup warning:', e.message);
    }

    chart.timeScale().fitContent();
  };

  const renderMACDChart = () => {
    const container = containerRefs.current.macd;
    if (!container) return;

    if (chartsRef.current.macd) {
      chartsRef.current.macd.remove();
    }

    const chart = createChart(container, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#111827' }
      },
      width: container.clientWidth,
      height: 250,
      timeScale: {
        timeVisible: false,
        secondsVisible: false
      }
    });

    chartsRef.current.macd = chart;

    const macdLineSeries = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 2
    });

    const signalLineSeries = chart.addLineSeries({
      color: '#ec4899',
      lineWidth: 2,
      lineStyle: 1
    });

    const histogramSeries = chart.addHistogramSeries({
      color: '#06b6d4',
      priceFormat: { type: 'price', precision: 4 },
      priceScaleId: 'left'
    });

    if (indicators.macd && indicators.macd.macd) {
      const macdData = indicators.macd.macd.map((value, idx) => ({
        time: idx,
        value: parseFloat(value)
      }));

      const signalData = indicators.macd.signal.map((value, idx) => ({
        time: idx,
        value: parseFloat(value)
      }));

      const histogramData = indicators.macd.histogram.map((value, idx) => ({
        time: idx,
        value: parseFloat(value),
        color: parseFloat(value) > 0 ? '#10b98144' : '#ef444444'
      }));

      macdLineSeries.setData(macdData);
      signalLineSeries.setData(signalData);
      histogramSeries.setData(histogramData);
    }

    chart.timeScale().fitContent();
  };

  const renderBollingerBandsChart = () => {
    const container = containerRefs.current.bollingerBands;
    if (!container) return;

    if (chartsRef.current.bollingerBands) {
      chartsRef.current.bollingerBands.remove();
    }

    const chart = createChart(container, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#111827' }
      },
      width: container.clientWidth,
      height: 250,
      timeScale: {
        timeVisible: false,
        secondsVisible: false
      }
    });

    chartsRef.current.bollingerBands = chart;

    const upperSeries = chart.addLineSeries({
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 1
    });

    const middleSeries = chart.addLineSeries({
      color: '#fbbf24',
      lineWidth: 2
    });

    const lowerSeries = chart.addLineSeries({
      color: '#10b981',
      lineWidth: 1,
      lineStyle: 1
    });

    if (indicators.bollingerBands && Array.isArray(indicators.bollingerBands)) {
      const upperData = indicators.bollingerBands.map((band, idx) => ({
        time: idx,
        value: parseFloat(band.upper)
      }));

      const middleData = indicators.bollingerBands.map((band, idx) => ({
        time: idx,
        value: parseFloat(band.middle)
      }));

      const lowerData = indicators.bollingerBands.map((band, idx) => ({
        time: idx,
        value: parseFloat(band.lower)
      }));

      upperSeries.setData(upperData);
      middleSeries.setData(middleData);
      lowerSeries.setData(lowerData);
    }

    chart.timeScale().fitContent();
  };

  const toggleIndicator = (indicator) => {
    setEnabled(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  if (loading) return <div className="technical-indicators-container"><p>Loading indicators...</p></div>;
  if (error) return <div className="technical-indicators-container"><p>Error: {error}</p></div>;
  if (!indicators) return <div className="technical-indicators-container"><p>No data available</p></div>;

  return (
    <div className="technical-indicators-container">
      <div className="indicators-header">
        <h2>Technical Indicators</h2>
        <div className="indicator-toggles">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled.sma}
              onChange={() => toggleIndicator('sma')}
            />
            <span>SMA</span>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled.rsi}
              onChange={() => toggleIndicator('rsi')}
            />
            <span>RSI</span>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled.macd}
              onChange={() => toggleIndicator('macd')}
            />
            <span>MACD</span>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={enabled.bollingerBands}
              onChange={() => toggleIndicator('bollingerBands')}
            />
            <span>Bollinger Bands</span>
          </label>
        </div>
      </div>

      <div className="indicators-panels">
        {enabled.sma && (
          <div className="indicator-panel">
            <div className="panel-header">
              <h3>Simple Moving Average (SMA)</h3>
              <span className="panel-value">${indicators.sma[indicators.sma.length - 1]?.toFixed(2)}</span>
            </div>
            <div ref={el => containerRefs.current.sma = el} className="indicator-chart" />
          </div>
        )}

        {enabled.rsi && (
          <div className="indicator-panel">
            <div className="panel-header">
              <h3>Relative Strength Index (RSI)</h3>
              <span className={`panel-value ${indicators.rsi[indicators.rsi.length - 1] > 70 ? 'overbought' : indicators.rsi[indicators.rsi.length - 1] < 30 ? 'oversold' : ''}`}>
                {indicators.rsi[indicators.rsi.length - 1]?.toFixed(2)}
              </span>
            </div>
            <div ref={el => containerRefs.current.rsi = el} className="indicator-chart" />
          </div>
        )}

        {enabled.macd && (
          <div className="indicator-panel">
            <div className="panel-header">
              <h3>MACD (Moving Average Convergence Divergence)</h3>
              <span className="panel-value">
                {indicators.macd?.macd?.[indicators.macd.macd.length - 1]?.toFixed(4)}
              </span>
            </div>
            <div ref={el => containerRefs.current.macd = el} className="indicator-chart" />
          </div>
        )}

        {enabled.bollingerBands && (
          <div className="indicator-panel">
            <div className="panel-header">
              <h3>Bollinger Bands</h3>
              <div className="bb-values">
                <span className="bb-label">U: ${indicators.bollingerBands[indicators.bollingerBands.length - 1]?.upper?.toFixed(2)}</span>
                <span className="bb-label">M: ${indicators.bollingerBands[indicators.bollingerBands.length - 1]?.middle?.toFixed(2)}</span>
                <span className="bb-label">L: ${indicators.bollingerBands[indicators.bollingerBands.length - 1]?.lower?.toFixed(2)}</span>
              </div>
            </div>
            <div ref={el => containerRefs.current.bollingerBands = el} className="indicator-chart" />
          </div>
        )}
      </div>
    </div>
  );
}

export default TechnicalIndicators;
