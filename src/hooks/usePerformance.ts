import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
}

// Hook to monitor page performance
export function usePerformanceMonitoring(pageName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const startTime = startTimeRef.current;
    const renderStart = renderStartRef.current;
    
    // Measure initial load time
    const loadTime = Date.now() - startTime;
    
    // Measure time to first render
    const renderTime = Date.now() - renderStart;

    // Log performance metrics
    console.log(`[Performance] ${pageName}:`, {
      loadTime: `${loadTime}ms`,
      renderTime: `${renderTime}ms`,
    });

    // Report to analytics (if implemented)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_performance', {
        event_category: 'Performance',
        event_label: pageName,
        value: loadTime,
        custom_map: {
          load_time: loadTime,
          render_time: renderTime,
        }
      });
    }

    // Cleanup function
    return () => {
      // Additional cleanup if needed
    };
  }, [pageName]);

  return {
    startTime: startTimeRef.current,
    measureInteraction: (actionName: string) => {
      const interactionTime = Date.now() - startTimeRef.current;
      console.log(`[Performance] ${pageName} - ${actionName}: ${interactionTime}ms`);
      
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'user_interaction', {
          event_category: 'Performance',
          event_label: `${pageName} - ${actionName}`,
          value: interactionTime,
        });
      }
    }
  };
}

// Hook to detect slow connections and adjust behavior
export function useConnectionQuality() {
  const getConnectionInfo = () => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  };

  const isSlowConnection = () => {
    const connection = getConnectionInfo();
    if (!connection) return false;
    
    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.downlink < 1.5 ||
      connection.saveData
    );
  };

  return {
    connectionInfo: getConnectionInfo(),
    isSlowConnection: isSlowConnection(),
    shouldReduceQuality: isSlowConnection(),
  };
}
