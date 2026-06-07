import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import '../styles/Chart.css';

function Chart({ timeframe }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map timeframe to API parameters and lookback periods
  const getTimeframeParams = (tf) => {
    const params = {
      '1h': { interval: '1h', days: 7, label: '1 Hour' },
      '4h': { interval: '4h', days: 30, label: '4 Hour' },
      '1d': { interval: '1d', days: 90, label: '1 Day' },
      '1w': { interval: '1w', days: 365, label: '1 Week' }
    };
    return params[tf] || params['1d'];
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize chart
    const width = containerRef.current.clientWidth || 800;
    const chart = createChart(containerRef.current, {
      layout: {
        textColor: '#d1d5db',
        background: { color: '#1f2937' }
      },
      width: Math.max(width, 400),
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 2
      },
      localization: {
        timeFormatter: (businessDayOrTimestamp) => {
          return new Date(businessDayOrTimestamp * 1000).toLocaleDateString();
        }
      }
    });

    chartRef.current = chart;

    // Enable scroll and zoom
    chart.timeScale().applyOptions({
      allowShiftVisibleRangeOnMouseWheel: true,
      allowDragWithMouseWheel: true
    });

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = getTimeframeParams(timeframe);
        const queryParams = new URLSearchParams({
          interval: params.interval,
          limit: Math.ceil(params.days * 24 / parseInt(params.interval))
        });

        const res = await fetch(`/api/xauusd/history?${queryParams}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No data received from API');
        }

        // Transform data to candlestick format
        const candleData = data.map(d => ({
          time: new Date(d.timestamp).getTime() / 1000,
          open: parseFloat(d.open),
          high: parseFloat(d.high),
          low: parseFloat(d.low),
          close: parseFloat(d.close)
        })).sort((a, b) => a.time - b.time);

        // Clear previous series if they exist
        if (candleSeriesRef.current) {
          chart.removeSeries(candleSeriesRef.current);
        }
        if (volumeSeriesRef.current) {
          chart.removeSeries(volumeSeriesRef.current);
        }

        // Add candlestick series
        const candleSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444'
        });

        candleSeriesRef.current = candleSeries;
        candleSeries.setData(candleData);

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
          color: '#3b82f6',
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume'
        });

        volumeSeriesRef.current = volumeSeries;

        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.7,
            bottom: 0
          }
        });

        const volumeData = data.map(d => ({
          time: new Date(d.timestamp).getTime() / 1000,
          value: parseFloat(d.volume) || 0,
          color: parseFloat(d.close) > parseFloat(d.open) ? '#10b98133' : '#ef444433'
        })).sort((a, b) => a.time - b.time);

        volumeSeries.setData(volumeData);

        // Fit chart to content
        chart.timeScale().fitContent();
        setLoading(false);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [timeframe]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>XAU/USD Price Chart - {getTimeframeParams(timeframe).label}</h2>
        {loading && <span className="chart-status loading">Loading...</span>}
        {error && <span className="chart-status error">Error: {error}</span>}
      </div>
      <div
        ref={containerRef}
        className="chart"
        style={{ opacity: loading ? 0.5 : 1 }}
      />
      <div className="chart-controls">
        <p className="chart-hint">Scroll to zoom, drag to pan</p>
      </div>
    </div>
  );
}

export default Chart;
