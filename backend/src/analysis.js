/**
 * Technical Analysis Module
 * Provides functions to calculate technical indicators and generate trading signals
 * for XAUUSD (Gold vs USD) price analysis
 */

function calculateSMA(prices, period) {
  if (prices.length < period) return [];
  const smaValues = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    smaValues.push(sum / period);
  }
  return smaValues;
}

function calculateEMA(prices, period) {
  if (prices.length < period) return [];
  const multiplier = 2 / (period + 1);
  const emaValues = [];
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaValues.push(ema);
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
    emaValues.push(ema);
  }
  return emaValues;
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return [];
  const rsiValues = [];
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) gainSum += changes[i];
    else lossSum += Math.abs(changes[i]);
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  rsiValues.push(rsi);
  for (let i = period + 1; i < prices.length; i++) {
    const change = changes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }
  return rsiValues;
}

function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const startIndex = slowPeriod - fastPeriod;
  const macdLine = [];
  for (let i = 0; i < slowEMA.length; i++) {
    if (i + startIndex >= 0 && i + startIndex < fastEMA.length) {
      macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
    }
  }
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = [];
  const startSignalIndex = macdLine.length - signalLine.length;
  for (let i = startSignalIndex; i < macdLine.length; i++) {
    histogram.push(macdLine[i] - signalLine[i - startSignalIndex]);
  }
  return { macdLine: macdLine.slice(startSignalIndex), signalLine, histogram };
}

function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  const smaValues = calculateSMA(prices, period);
  const bands = { upperBand: [], middleBand: smaValues, lowerBand: [] };
  for (let i = 0; i < smaValues.length; i++) {
    const pricesSlice = prices.slice(i, i + period);
    const mean = smaValues[i];
    const squaredDiffs = pricesSlice.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);
    bands.upperBand.push(mean + (stdDev * stdDevMultiplier));
    bands.lowerBand.push(mean - (stdDev * stdDevMultiplier));
  }
  return bands;
}

function analyzeTrend(prices, shortPeriod = 20, longPeriod = 50) {
  if (prices.length < longPeriod) return { trend: 'INSUFFICIENT_DATA', strength: 0 };
  const shortSMA = calculateSMA(prices, shortPeriod);
  const longSMA = calculateSMA(prices, longPeriod);
  const latestShortSMA = shortSMA[shortSMA.length - 1];
  const latestLongSMA = longSMA[longSMA.length - 1];
  const latestPrice = prices[prices.length - 1];
  let trend = 'SIDEWAYS', strength = 0;
  if (latestShortSMA > latestLongSMA) {
    trend = 'UPTREND';
    strength = ((latestShortSMA - latestLongSMA) / latestLongSMA) * 100;
  } else if (latestShortSMA < latestLongSMA) {
    trend = 'DOWNTREND';
    strength = ((latestLongSMA - latestShortSMA) / latestLongSMA) * 100;
  }
  const bbands = calculateBollingerBands(prices, shortPeriod, 2);
  const latestMiddleBand = bbands.middleBand[bbands.middleBand.length - 1];
  if (trend === 'UPTREND' && latestPrice > latestMiddleBand) strength *= 1.1;
  else if (trend === 'DOWNTREND' && latestPrice < latestMiddleBand) strength *= 1.1;
  return { trend, strength: Math.min(100, strength), latestPrice, shortSMA: latestShortSMA, longSMA: latestLongSMA };
}

function generatePredictionScore(prices) {
  if (prices.length < 50) return { score: 0, signal: 'INSUFFICIENT_DATA', indicators: {} };
  let score = 0;
  const indicators = {};
  const rsi = calculateRSI(prices, 14);
  const latestRSI = rsi[rsi.length - 1];
  indicators.rsi = latestRSI;
  if (latestRSI > 70) { score -= 20; indicators.rsiSignal = 'OVERBOUGHT'; }
  else if (latestRSI < 30) { score += 20; indicators.rsiSignal = 'OVERSOLD'; }
  else if (latestRSI > 50) { score += 8; indicators.rsiSignal = 'BULLISH'; }
  else if (latestRSI < 50) { score -= 8; indicators.rsiSignal = 'BEARISH'; }
  else indicators.rsiSignal = 'NEUTRAL';
  const macd = calculateMACD(prices, 12, 26, 9);
  if (macd.histogram.length > 0) {
    const latestHistogram = macd.histogram[macd.histogram.length - 1];
    const previousHistogram = macd.histogram[macd.histogram.length - 2] || latestHistogram;
    indicators.macdHistogram = latestHistogram;
    if (latestHistogram > 0 && latestHistogram > previousHistogram) { score += 15; indicators.macdSignal = 'BULLISH_CROSSOVER'; }
    else if (latestHistogram < 0 && latestHistogram < previousHistogram) { score -= 15; indicators.macdSignal = 'BEARISH_CROSSOVER'; }
    else if (latestHistogram > 0) { score += 5; indicators.macdSignal = 'BULLISH'; }
    else if (latestHistogram < 0) { score -= 5; indicators.macdSignal = 'BEARISH'; }
  }
  const bbands = calculateBollingerBands(prices, 20, 2);
  const latestPrice = prices[prices.length - 1];
  const latestUpperBand = bbands.upperBand[bbands.upperBand.length - 1];
  const latestLowerBand = bbands.lowerBand[bbands.lowerBand.length - 1];
  const latestMiddleBand = bbands.middleBand[bbands.middleBand.length - 1];
  indicators.price = latestPrice;
  indicators.upperBand = latestUpperBand;
  indicators.lowerBand = latestLowerBand;
  const bandPosition = (latestPrice - latestLowerBand) / (latestUpperBand - latestLowerBand);
  if (bandPosition > 0.8) { score -= 10; indicators.bbandSignal = 'OVERBOUGHT_BANDS'; }
  else if (bandPosition < 0.2) { score += 10; indicators.bbandSignal = 'OVERSOLD_BANDS'; }
  else if (bandPosition > 0.5) { score += 3; indicators.bbandSignal = 'ABOVE_MIDDLE'; }
  else { score -= 3; indicators.bbandSignal = 'BELOW_MIDDLE'; }
  const trend = analyzeTrend(prices, 20, 50);
  indicators.trend = trend.trend;
  indicators.trendStrength = trend.strength;
  if (trend.trend === 'UPTREND') { score += Math.min(20, trend.strength * 0.2); indicators.trendSignal = 'STRONG_UPTREND'; }
  else if (trend.trend === 'DOWNTREND') { score -= Math.min(20, trend.strength * 0.2); indicators.trendSignal = 'STRONG_DOWNTREND'; }
  else indicators.trendSignal = 'SIDEWAYS_NO_CLEAR_DIRECTION';
  let signal = 'NEUTRAL';
  if (score > 50) signal = 'STRONG_BUY';
  else if (score > 20) signal = 'BUY';
  else if (score < -50) signal = 'STRONG_SELL';
  else if (score < -20) signal = 'SELL';
  return { score: Math.max(-100, Math.min(100, score)), signal, indicators, timestamp: new Date().toISOString() };
}

function generateHistoricalAnalysis(prices, lookbackPeriods = 10) {
  if (prices.length < 50) return [];
  const analyses = [];
  const startIndex = Math.max(50, prices.length - lookbackPeriods);
  for (let i = startIndex; i < prices.length; i++) {
    const slicedPrices = prices.slice(0, i + 1);
    const analysis = generatePredictionScore(slicedPrices);
    analyses.push({ index: i, price: prices[i], ...analysis });
  }
  return analyses;
}

function analyzeIndicators(historyData, period = 20) {
  // Extract prices from history data
  const prices = historyData.map(d => parseFloat(d.close || d.price || 0)).filter(p => p > 0);

  if (prices.length === 0) {
    return { sma: [], ema: [], rsi: [], macd: {}, bollingerBands: [] };
  }

  const sma = calculateSMA(prices, period);
  const ema = calculateEMA(prices, period);
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices, 12, 26, 9);
  const bbands = calculateBollingerBands(prices, period, 2);

  // Convert Bollinger Bands format to array of objects
  const bollingerBands = [];
  for (let i = 0; i < bbands.upperBand.length; i++) {
    bollingerBands.push({
      upper: bbands.upperBand[i],
      middle: bbands.middleBand[i],
      lower: bbands.lowerBand[i]
    });
  }

  // Return MACD in the expected format
  const macdFormatted = {
    macd: macd.macdLine,
    signal: macd.signalLine,
    histogram: macd.histogram
  };

  return {
    sma,
    ema,
    rsi,
    macd: macdFormatted,
    bollingerBands
  };
}

function predictTrend(historyData, indicators) {
  const prices = historyData.map(d => parseFloat(d.close || d.price || 0)).filter(p => p > 0);

  if (prices.length === 0) {
    return { score: 0, signal: 'INSUFFICIENT_DATA', indicators: {} };
  }

  return generatePredictionScore(prices);
}

export {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  analyzeTrend,
  generatePredictionScore,
  generateHistoricalAnalysis,
  analyzeIndicators,
  predictTrend
};
