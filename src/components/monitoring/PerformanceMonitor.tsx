import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const reportMetric = (metric: PerformanceMetrics) => {
      // In a real app, you would send this to your analytics service
      console.log('Performance Metric:', metric);
      
      // Example: Send to analytics
      // analytics.track('performance_metric', metric);
    };

    // Web Vitals observer
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportMetric({ lcp: lastEntry.startTime });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          reportMetric({ fid: entry.processingStart - entry.startTime });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let cls = 0;
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        reportMetric({ cls });
      }).observe({ entryTypes: ['layout-shift'] });

      // Navigation Timing
      if (performance.getEntriesByType) {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime;
          
          reportMetric({ 
            ttfb, 
            fcp: fcp || 0 
          });
        }
      }
    }

    // API Performance monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const duration = performance.now() - start;
      
      // Log slow API calls (> 2 seconds)
      if (duration > 2000) {
        console.warn(`Slow API call: ${args[0]} took ${duration.toFixed(2)}ms`);
      }
      
      return response;
    };

    return () => {
      // Cleanup
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
