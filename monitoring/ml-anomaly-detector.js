/**
 * Machine Learning Anomaly Detection Module
 * Simple ML algorithms for detecting system anomalies
 */

class MLAnomalyDetector {
  constructor() {
    this.models = {
      cpu: new TimeSeriesAnomalyDetector('cpu'),
      memory: new TimeSeriesAnomalyDetector('memory'),
      network: new TimeSeriesAnomalyDetector('network'),
      disk: new TimeSeriesAnomalyDetector('disk')
    };
    
    this.trainingData = {
      cpu: [],
      memory: [],
      network: [],
      disk: []
    };
    
    this.isTraining = true;
    this.minTrainingSize = 100; // Minimum data points before making predictions
  }

  /**
   * Train models with new data point
   */
  train(metrics) {
    const dataPoint = {
      timestamp: Date.now(),
      cpu: metrics.cpu.usage,
      memory: metrics.memory.usagePercent,
      network: metrics.connections.count,
      disk: Math.max(...metrics.disk.map(d => d.usagePercent))
    };

    // Add to training data
    Object.keys(this.trainingData).forEach(key => {
      this.trainingData[key].push(dataPoint[key]);
      
      // Keep only recent data (sliding window)
      if (this.trainingData[key].length > 1000) {
        this.trainingData[key] = this.trainingData[key].slice(-1000);
      }
    });

    // Train individual models
    Object.keys(this.models).forEach(key => {
      if (this.trainingData[key].length >= this.minTrainingSize) {
        this.models[key].train(this.trainingData[key]);
      }
    });
  }

  /**
   * Detect anomalies in current metrics
   */
  detectAnomalies(metrics) {
    const anomalies = [];
    
    const currentData = {
      cpu: metrics.cpu.usage,
      memory: metrics.memory.usagePercent,
      network: metrics.connections.count,
      disk: Math.max(...metrics.disk.map(d => d.usagePercent))
    };

    Object.keys(this.models).forEach(key => {
      if (this.trainingData[key].length >= this.minTrainingSize) {
        const anomaly = this.models[key].predict(currentData[key]);
        if (anomaly.isAnomaly) {
          anomalies.push({
            type: `${key}_anomaly`,
            severity: anomaly.severity,
            confidence: anomaly.confidence,
            message: `ML detected ${key} anomaly: ${currentData[key]} (expected: ${anomaly.expected.toFixed(2)})`,
            metrics: {
              actual: currentData[key],
              expected: anomaly.expected,
              deviation: anomaly.deviation,
              confidence: anomaly.confidence
            }
          });
        }
      }
    });

    return anomalies;
  }

  /**
   * Get model statistics
   */
  getModelStats() {
    const stats = {};
    
    Object.keys(this.models).forEach(key => {
      stats[key] = {
        trainingSize: this.trainingData[key].length,
        isReady: this.trainingData[key].length >= this.minTrainingSize,
        ...this.models[key].getStats()
      };
    });

    return stats;
  }
}

/**
 * Time Series Anomaly Detector using statistical methods
 */
class TimeSeriesAnomalyDetector {
  constructor(name) {
    this.name = name;
    this.windowSize = 50; // Size of sliding window for calculations
    this.data = [];
    this.stats = {
      mean: 0,
      stdDev: 0,
      min: Infinity,
      max: -Infinity
    };
  }

  /**
   * Train the model with historical data
   */
  train(data) {
    this.data = [...data];
    this.updateStatistics();
  }

  /**
   * Update statistical measures
   */
  updateStatistics() {
    if (this.data.length === 0) return;

    // Use recent data for statistics (sliding window)
    const recentData = this.data.slice(-this.windowSize);
    
    // Calculate mean
    this.stats.mean = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    
    // Calculate standard deviation
    const variance = recentData.reduce((sum, val) => sum + Math.pow(val - this.stats.mean, 2), 0) / recentData.length;
    this.stats.stdDev = Math.sqrt(variance);
    
    // Calculate min/max
    this.stats.min = Math.min(...recentData);
    this.stats.max = Math.max(...recentData);
  }

  /**
   * Predict if a value is anomalous
   */
  predict(value) {
    if (this.data.length < 10) {
      return { isAnomaly: false, confidence: 0, expected: value, deviation: 0 };
    }

    // Calculate z-score
    const zScore = Math.abs(value - this.stats.mean) / (this.stats.stdDev || 1);
    
    // Calculate expected value using exponential smoothing
    const alpha = 0.3; // Smoothing factor
    const expected = this.exponentialSmoothing(value, alpha);
    
    // Calculate deviation percentage
    const deviation = Math.abs(value - expected) / (expected || 1) * 100;
    
    // Determine if anomaly based on multiple criteria
    const isStatisticalAnomaly = zScore > 2.5; // 2.5 standard deviations
    const isDeviationAnomaly = deviation > 30; // 30% deviation from expected
    const isRangeAnomaly = value < this.stats.min * 0.5 || value > this.stats.max * 1.5;
    
    const isAnomaly = isStatisticalAnomaly || isDeviationAnomaly || isRangeAnomaly;
    
    // Calculate confidence based on multiple factors
    let confidence = 0;
    if (isStatisticalAnomaly) confidence += 0.4;
    if (isDeviationAnomaly) confidence += 0.3;
    if (isRangeAnomaly) confidence += 0.3;
    
    // Adjust confidence based on data quality
    const dataQuality = Math.min(this.data.length / 100, 1); // More data = higher confidence
    confidence *= dataQuality;
    
    // Determine severity
    let severity = 'low';
    if (confidence > 0.7) severity = 'high';
    else if (confidence > 0.4) severity = 'medium';

    return {
      isAnomaly,
      confidence: Math.round(confidence * 100) / 100,
      severity,
      expected,
      deviation,
      zScore,
      factors: {
        statistical: isStatisticalAnomaly,
        deviation: isDeviationAnomaly,
        range: isRangeAnomaly
      }
    };
  }

  /**
   * Exponential smoothing for trend prediction
   */
  exponentialSmoothing(newValue, alpha) {
    if (this.data.length === 0) return newValue;
    
    const recentData = this.data.slice(-10); // Use last 10 points
    let smoothed = recentData[0];
    
    for (let i = 1; i < recentData.length; i++) {
      smoothed = alpha * recentData[i] + (1 - alpha) * smoothed;
    }
    
    return smoothed;
  }

  /**
   * Detect seasonal patterns
   */
  detectSeasonality() {
    if (this.data.length < 100) return null;
    
    // Simple autocorrelation for detecting patterns
    const maxLag = Math.min(50, Math.floor(this.data.length / 4));
    let bestLag = 0;
    let maxCorrelation = 0;
    
    for (let lag = 1; lag <= maxLag; lag++) {
      const correlation = this.autocorrelation(lag);
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }
    
    return {
      period: bestLag,
      strength: maxCorrelation,
      isSignificant: maxCorrelation > 0.3
    };
  }

  /**
   * Calculate autocorrelation for given lag
   */
  autocorrelation(lag) {
    if (lag >= this.data.length) return 0;
    
    const n = this.data.length - lag;
    const mean1 = this.data.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = this.data.slice(lag).reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = this.data[i] - mean1;
      const diff2 = this.data[i + lag] - mean2;
      
      numerator += diff1 * diff2;
      denom1 += diff1 * diff1;
      denom2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(denom1 * denom2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get model statistics
   */
  getStats() {
    const seasonality = this.detectSeasonality();
    
    return {
      ...this.stats,
      dataPoints: this.data.length,
      seasonality,
      trend: this.calculateTrend()
    };
  }

  /**
   * Calculate trend direction
   */
  calculateTrend() {
    if (this.data.length < 10) return 'unknown';
    
    const recent = this.data.slice(-10);
    const older = this.data.slice(-20, -10);
    
    if (older.length === 0) return 'unknown';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }
}

/**
 * Advanced Pattern Recognition for complex anomalies
 */
class PatternRecognizer {
  constructor() {
    this.patterns = new Map();
    this.knownAnomalies = [
      'memory_leak',
      'cpu_spike',
      'disk_filling',
      'connection_flood',
      'periodic_anomaly'
    ];
  }

  /**
   * Learn patterns from historical data
   */
  learnPatterns(historicalData) {
    // Implement pattern learning algorithms
    // This could include clustering, sequence mining, etc.
    console.log('Learning patterns from historical data...');
  }

  /**
   * Recognize patterns in current data
   */
  recognizePattern(currentMetrics, historicalContext) {
    // Implement pattern recognition logic
    // This could use techniques like DTW, clustering, etc.
    return null;
  }
}

export { MLAnomalyDetector, TimeSeriesAnomalyDetector, PatternRecognizer };
