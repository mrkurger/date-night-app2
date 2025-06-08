'use client';

import { useEffect } from 'react';
import React from 'react';

// Type declaration for Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Global gtag function
declare const gtag: (...args: any[]) => void;

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    const observer = new PerformanceObserver(list => {
      const metrics: PerformanceMetrics = {};

      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.lcp = entry.startTime;
            break;
          case 'first-input':
            metrics.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            break;
        }
      }

      // Send metrics to analytics service
      if (Object.keys(metrics).length > 0) {
        sendMetrics(metrics);
      }
    });

    // Observe different performance entry types
    try {
      observer.observe({
        entryTypes: [
          'paint',
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
          'navigation',
        ],
      });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.warn('Some performance metrics not supported:', e);
    }

    // Memory usage monitoring (if supported)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      sendMetrics({
        memoryUsed: memoryInfo.usedJSHeapSize,
        memoryTotal: memoryInfo.totalJSHeapSize,
        memoryLimit: memoryInfo.jsHeapSizeLimit,
      });
    }

    // Connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      sendMetrics({
        connectionType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}

function sendMetrics(metrics: any) {
  // In development, just log the metrics
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Metrics:', metrics);
    return;
  }

  // In production, send to your analytics service
  // Example implementations:

  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    Object.entries(metrics).forEach(([key, value]) => {
      gtag('event', 'web_vitals', {
        metric_name: key,
        metric_value: value,
        custom_parameter: 'performance_monitoring',
      });
    });
  }

  // Custom analytics endpoint
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }),
  }).catch(error => {
    console.warn('Failed to send performance metrics:', error);
  });
}

// Hook for manual performance tracking
export function usePerformanceTracking() {
  const trackEvent = (eventName: string, duration?: number) => {
    const metrics = {
      eventName,
      duration,
      timestamp: Date.now(),
    };

    sendMetrics(metrics);
  };

  const trackPageLoad = (pageName: string) => {
    const loadTime = performance.now();
    trackEvent(`page_load_${pageName}`, loadTime);
  };

  return { trackEvent, trackPageLoad };
}

// Utility function to measure component render time
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string,
) {
  return function PerformanceTrackedComponent(props: T) {
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        sendMetrics({
          componentRenderTime: endTime - startTime,
          componentName,
        });
      };
    }, []);

    return <Component {...props} />;
  };
}
