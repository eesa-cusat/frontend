'use client';

// Background prefetch service for featured content
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { globalCache } from '@/lib/globalCache';

interface PrefetchService {
  startBackgroundPrefetch: () => void;
  isPrefetching: boolean;
  prefetchProgress: Record<string, 'pending' | 'loading' | 'done' | 'error'>;
  manualPrefetch: (apps: string[]) => Promise<void>;
}

// Prefetch configurations for each app
const PREFETCH_CONFIG = {
  events: {
    endpoints: [
      { type: 'featured', url: '/events/featured/' },
      { type: 'list', url: '/events/?page=1&page_size=12' },
      { type: 'upcoming', url: '/events/upcoming/' }
    ]
  },
  projects: {
    endpoints: [
      { type: 'featured', url: '/projects/featured/' },
      { type: 'list', url: '/projects/?page=1&page_size=12' }
    ]
  },
  gallery: {
    endpoints: [
      { type: 'featured', url: '/gallery/featured/' },
      { type: 'recent', url: '/gallery/?page=1&page_size=12' }
    ]
  },
  academics: {
    endpoints: [
      { type: 'overview', url: '/academics/overview/' },
      { type: 'schemes', url: '/academics/schemes/' }
    ]
  },
  alumni: {
    endpoints: [
      { type: 'featured', url: '/alumni/featured/' },
      { type: 'recent', url: '/alumni/?page=1&page_size=12' }
    ]
  },
  careers: {
    endpoints: [
      { type: 'featured', url: '/placements/featured/' },
      { type: 'recent', url: '/placements/?page=1&page_size=12' }
    ]
  }
};

class BackgroundPrefetcher {
  private isRunning = false;
  private progress: Record<string, 'pending' | 'loading' | 'done' | 'error'> = {};
  private subscribers: Set<() => void> = new Set();
  private abortController: AbortController | null = null;

  constructor() {
    // Initialize progress for all apps
    Object.keys(PREFETCH_CONFIG).forEach(app => {
      this.progress[app] = globalCache.isPrefetchDone(app) ? 'done' : 'pending';
    });
  }

  // Start background prefetching
  async startBackgroundPrefetch(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.abortController = new AbortController();
    this.notifySubscribers();

    try {
      // Check which apps need prefetching
      const appsToPrefetch = Object.keys(PREFETCH_CONFIG).filter(
        app => !globalCache.isPrefetchDone(app)
      );

      if (appsToPrefetch.length === 0) {
        this.isRunning = false;
        this.notifySubscribers();
        return;
      }

      // Prefetch with delays to avoid overwhelming the server
      for (const app of appsToPrefetch) {
        if (this.abortController?.signal.aborted) break;
        
        await this.prefetchApp(app);
        
        // Small delay between apps
        if (!this.abortController?.signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Background prefetch failed:', error);
    } finally {
      this.isRunning = false;
      this.abortController = null;
      this.notifySubscribers();
    }
  }

  // Prefetch specific apps manually
  async manualPrefetch(apps: string[]): Promise<void> {
    if (this.isRunning) {
      this.stopPrefetch();
    }

    this.isRunning = true;
    this.abortController = new AbortController();
    this.notifySubscribers();

    try {
      for (const app of apps) {
        if (this.abortController?.signal.aborted) break;
        if (PREFETCH_CONFIG[app as keyof typeof PREFETCH_CONFIG]) {
          await this.prefetchApp(app);
        }
      }
    } catch (error) {
      console.error('Manual prefetch failed:', error);
    } finally {
      this.isRunning = false;
      this.abortController = null;
      this.notifySubscribers();
    }
  }

  // Prefetch single app
  private async prefetchApp(app: string): Promise<void> {
    if (this.abortController?.signal.aborted) return;

    this.progress[app] = 'loading';
    this.notifySubscribers();

    try {
      const config = PREFETCH_CONFIG[app as keyof typeof PREFETCH_CONFIG];
      
      // Fetch all endpoints for this app in parallel
      const promises = config.endpoints.map(async (endpoint) => {
        if (this.abortController?.signal.aborted) return;
        
        try {
          // Check if already cached
          const cached = globalCache.get(app, endpoint.type, 1);
          if (cached) return cached;

          // Fetch from API
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
          const response = await axios.get(`${API_BASE_URL}${endpoint.url}`, {
            signal: this.abortController?.signal
          });
          
          // Cache the response
          globalCache.set(app, endpoint.type, response.data, 1);
          
          return response.data;
        } catch (error) {
          // Only log error if it's not an abort
          if (!this.abortController?.signal.aborted) {
            console.warn(`Failed to prefetch ${app} ${endpoint.type}:`, error);
          }
          throw error;
        }
      });

      await Promise.all(promises);
      
      this.progress[app] = 'done';
      globalCache.markPrefetchDone(app);
    } catch (error) {
      if (!this.abortController?.signal.aborted) {
        this.progress[app] = 'error';
        console.error(`Failed to prefetch ${app}:`, error);
      }
    }
    
    this.notifySubscribers();
  }

  // Stop prefetching
  stopPrefetch(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isRunning = false;
    this.notifySubscribers();
  }

  // Subscribe to progress updates
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Get current progress
  getProgress(): Record<string, 'pending' | 'loading' | 'done' | 'error'> {
    return { ...this.progress };
  }

  // Check if prefetching is running
  getIsRunning(): boolean {
    return this.isRunning;
  }

  // Get prefetch statistics
  getStats(): { total: number; done: number; pending: number; loading: number; error: number } {
    const stats = { total: 0, done: 0, pending: 0, loading: 0, error: 0 };
    
    Object.values(this.progress).forEach(status => {
      stats.total++;
      stats[status]++;
    });
    
    return stats;
  }
}

// Global prefetcher instance
const backgroundPrefetcher = new BackgroundPrefetcher();

// React hook for using background prefetcher
export const useBackgroundPrefetch = (): PrefetchService => {
  const [isRunning, setIsRunning] = useState(backgroundPrefetcher.getIsRunning());
  const [progress, setProgress] = useState(backgroundPrefetcher.getProgress());

  useEffect(() => {
    const unsubscribe = backgroundPrefetcher.subscribe(() => {
      setIsRunning(backgroundPrefetcher.getIsRunning());
      setProgress(backgroundPrefetcher.getProgress());
    });
    
    return unsubscribe;
  }, []);

  const startBackgroundPrefetch = useCallback(() => {
    backgroundPrefetcher.startBackgroundPrefetch();
  }, []);

  const manualPrefetch = useCallback((apps: string[]) => {
    return backgroundPrefetcher.manualPrefetch(apps);
  }, []);

  return {
    startBackgroundPrefetch,
    isPrefetching: isRunning,
    prefetchProgress: progress,
    manualPrefetch
  };
};

// Auto-start prefetch when imported (with delay)
let autoStarted = false;
export const autoStartPrefetch = () => {
  if (!autoStarted && typeof window !== 'undefined') {
    autoStarted = true;
    // Start after a small delay to not interfere with initial page load
    setTimeout(() => {
      backgroundPrefetcher.startBackgroundPrefetch();
    }, 2000);
  }
};

// Export stats function for debugging
export const getPrefetchStats = () => {
  return {
    service: backgroundPrefetcher.getStats(),
    cache: globalCache.getStats()
  };
};
