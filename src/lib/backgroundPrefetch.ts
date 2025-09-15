'use client';

// Background prefetch service for featured content
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { globalCache } from '@/lib/globalCache';

interface PrefetchService {
  startBackgroundPrefetch: () => void;
  markHomepageLoaded: () => void;
  isPrefetching: boolean;
  isPaused: boolean;
  prefetchProgress: Record<string, 'pending' | 'loading' | 'done' | 'error'>;
  manualPrefetch: (apps: string[]) => Promise<void>;
}

// Prioritized prefetch configuration - loads in order after homepage
const PREFETCH_CONFIG = {
  // Priority 1: Core academic content (loads first after homepage)
  academics: {
    priority: 1,
    endpoints: [
      { type: 'schemes', url: '/academics/schemes/' },
      { type: 'subjects', url: '/academics/subjects/' }
    ]
  },
  // Priority 2: Events (loads second)
  events: {
    priority: 2,
    endpoints: [
      { type: 'list', url: '/events/?page=1&page_size=12' },
      { type: 'upcoming', url: '/events/upcoming/' }
    ]
  },
  // Priority 3: Projects (loads third)
  projects: {
    priority: 3,
    endpoints: [
      { type: 'list', url: '/projects/?page=1&page_size=12' },
      { type: 'featured', url: '/projects/featured/' }
    ]
  },
  // Priority 4: Gallery (loads fourth)
  gallery: {
    priority: 4,
    endpoints: [
      { type: 'recent', url: '/gallery/?page=1&page_size=12' }
    ]
  },
  // Priority 5: Alumni (loads fifth - only working endpoints)
  alumni: {
    priority: 5,
    endpoints: [
      { type: 'list', url: '/alumni/alumni/?page=1&page_size=12' },
      { type: 'batches', url: '/alumni/batches/' }
    ]
  }
  // Note: Removed placements/careers as they were causing unwanted prefetch
};

class BackgroundPrefetcher {
  private isRunning = false;
  private isPaused = false;
  private homepageLoaded = false;
  private currentlyNavigating = false;
  private progress: Record<string, 'pending' | 'loading' | 'done' | 'error'> = {};
  private subscribers: Set<() => void> = new Set();
  private abortController: AbortController | null = null;
  private navigationTimeout: NodeJS.Timeout | null = null;
  private permanentFailures: Set<string> = new Set();

  constructor() {
    // Initialize progress for all apps
    Object.keys(PREFETCH_CONFIG).forEach(app => {
      this.progress[app] = globalCache.isPrefetchDone(app) ? 'done' : 'pending';
    });

    // Load permanent failures from localStorage to prevent 404 spam
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('permanentFailures');
        if (saved) {
          const failures = JSON.parse(saved);
          this.permanentFailures = new Set(failures);
          console.log('🛑 Loaded permanent failures:', Array.from(this.permanentFailures));
        }
      } catch (error) {
        console.warn('Failed to load permanent failures:', error);
      }
      
      this.setupNavigationListeners();
    }
  }

  // Setup navigation listeners to pause prefetching during user navigation
  private setupNavigationListeners(): void {
    // Listen for route changes (Next.js navigation)
    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        this.handleNavigation();
        return originalPushState.apply(window.history, args);
      };

      window.history.replaceState = (...args) => {
        this.handleNavigation();
        return originalReplaceState.apply(window.history, args);
      };

      // Also listen for popstate (back/forward buttons)
      window.addEventListener('popstate', () => {
        this.handleNavigation();
      });
    }
  }

  // Handle navigation events - pause prefetching temporarily
  private handleNavigation(): void {
    this.currentlyNavigating = true;
    this.pausePrefetch();

    // Clear existing timeout
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }

    // Resume prefetching after navigation settles (2 seconds)
    this.navigationTimeout = setTimeout(() => {
      this.currentlyNavigating = false;
      if (this.homepageLoaded && !this.isPaused) {
        this.resumePrefetch();
      }
    }, 2000);
  }

  // Mark homepage as loaded to start background prefetching
  markHomepageLoaded(): void {
    this.homepageLoaded = true;
    console.log('📍 Homepage loaded - starting prioritized background prefetch');
    this.notifySubscribers();
    
    // Start prefetching after a short delay if not navigating
    setTimeout(() => {
      if (!this.currentlyNavigating && !this.isRunning) {
        this.startPrioritizedPrefetch();
      }
    }, 1000);
  }

  // Pause prefetching
  pausePrefetch(): void {
    this.isPaused = true;
    if (this.abortController) {
      this.abortController.abort();
    }
    console.log('⏸️ Background prefetch paused (user navigating)');
  }

  // Resume prefetching
  resumePrefetch(): void {
    this.isPaused = false;
    console.log('▶️ Background prefetch resumed');
    if (this.homepageLoaded && !this.isRunning) {
      setTimeout(() => {
        this.startPrioritizedPrefetch();
      }, 500);
    }
  }

  // Start prioritized background prefetching (homepage → academics → events → projects → etc.)
  async startPrioritizedPrefetch(): Promise<void> {
    if (this.isRunning || this.isPaused || !this.homepageLoaded || this.currentlyNavigating) {
      return;
    }
    
    this.isRunning = true;
    this.abortController = new AbortController();
    this.notifySubscribers();

    try {
      // Get apps sorted by priority
      const appsByPriority = Object.entries(PREFETCH_CONFIG)
        .filter(([app]) => !globalCache.isPrefetchDone(app))
        .sort(([,a], [,b]) => a.priority - b.priority)
        .map(([app]) => app);

      if (appsByPriority.length === 0) {
        console.log('✅ All priority content already cached');
        this.isRunning = false;
        this.notifySubscribers();
        return;
      }

      console.log(`🚀 Starting prioritized prefetch: ${appsByPriority.join(' → ')}`);

      // Prefetch apps in priority order with pausing support
      for (const app of appsByPriority) {
        // Check if we should pause/abort
        if (this.abortController?.signal.aborted || this.isPaused || this.currentlyNavigating) {
          console.log(`⏸️ Prefetch paused at ${app}`);
          break;
        }
        
        await this.prefetchApp(app);
        
        // Longer delay between priority levels to avoid overwhelming server
        if (!this.abortController?.signal.aborted && !this.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (error) {
      console.error('❌ Prioritized prefetch failed:', error);
    } finally {
      this.isRunning = false;
      this.abortController = null;
      this.notifySubscribers();
    }
  }

  // Legacy method for backward compatibility
  async startBackgroundPrefetch(): Promise<void> {
    return this.startPrioritizedPrefetch();
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

  // Prefetch single app with priority-based loading
  private async prefetchApp(app: string): Promise<void> {
    if (this.abortController?.signal.aborted || this.isPaused || this.currentlyNavigating) return;

    this.progress[app] = 'loading';
    console.log(`📡 Loading ${app} content in background...`);
    this.notifySubscribers();

    try {
      const config = PREFETCH_CONFIG[app as keyof typeof PREFETCH_CONFIG];
      if (!config) {
        console.warn(`⚠️ No config found for app: ${app}`);
        return;
      }
      
      // Fetch endpoints sequentially to avoid overwhelming server
      for (const endpoint of config.endpoints) {
        if (this.abortController?.signal.aborted || this.isPaused || this.currentlyNavigating) {
          console.log(`⏸️ Paused prefetch for ${app} at ${endpoint.type}`);
          return;
        }
        
        try {
          // Skip permanently failed endpoints
          const endpointKey = `${app}.${endpoint.type}`;
          if (this.permanentFailures.has(endpointKey)) {
            console.log(`⚠️ Skipping permanently failed endpoint: ${endpointKey}`);
            continue;
          }

          // Skip known non-existent endpoints to prevent 404 spam
          const skipEndpoints = [
            'gallery.featured',
            'academics.overview', 
            'alumni.featured',
            'placements.featured',
            'placements.list'
          ];
          if (skipEndpoints.includes(endpointKey)) {
            console.log(`🚫 Skipping non-existent endpoint: ${endpointKey}`);
            this.permanentFailures.add(endpointKey);
            continue;
          }

          // Check if already cached
          const cached = globalCache.get(app, endpoint.type, 1);
          if (cached) {
            console.log(`💾 ${app}.${endpoint.type} already cached`);
            continue;
          }

          // Fetch from API
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
          const url = `${API_BASE_URL}${endpoint.url}`;
          
          console.log(`🔄 Fetching ${app}.${endpoint.type} from ${url}`);
          
          const response = await axios.get(url, {
            signal: this.abortController?.signal,
            timeout: 10000 // 10 second timeout per request
          });
          
          // Cache the response
          globalCache.set(app, endpoint.type, response.data, 1);
          console.log(`✅ Cached ${app}.${endpoint.type} (${response.data?.results?.length || response.data?.length || 'unknown'} items)`);
          
          // Small delay between endpoints to be server-friendly
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error: any) {
          // Only log error if it's not an abort or pause
          if (!this.abortController?.signal.aborted && !this.isPaused) {
            const status = error.response?.status;
            if (status === 404) {
              console.warn(`⚠️ Endpoint not found (skipping future attempts): ${app}.${endpoint.type}`);
              // Mark this endpoint as permanently failed to avoid future attempts
              if (!this.permanentFailures) this.permanentFailures = new Set();
              this.permanentFailures.add(`${app}.${endpoint.type}`);
            } else {
              console.error(`❌ Failed to prefetch ${app}.${endpoint.type}:`, {
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}${endpoint.url}`,
                error: error.message,
                status: status
              });
            }
          }
          // Don't throw - continue with other endpoints
        }
      }
      
      this.progress[app] = 'done';
      globalCache.markPrefetchDone(app);
      console.log(`🎉 Completed background loading for ${app}`);
      
    } catch (error) {
      if (!this.abortController?.signal.aborted && !this.isPaused) {
        this.progress[app] = 'error';
        console.error(`❌ Failed to prefetch ${app}:`, error);
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

  // Get current pause state
  getIsPaused(): boolean {
    return this.isPaused;
  }

  // Get current navigation state
  getIsNavigating(): boolean {
    return this.currentlyNavigating;
  }

  // Get homepage loaded state
  getHomepageLoaded(): boolean {
    return this.homepageLoaded;
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

// Cache clearing utility for invalid/non-existent endpoints
export const clearInvalidEndpointsCache = () => {
  if (typeof window !== 'undefined') {
    // Clear localStorage cache for endpoints that don't exist
    const invalidKeys = [
      'alumni_featured',        // Featured alumni - not implemented
      'gallery_featured',       // Featured gallery - not implemented  
      'placements_featured',    // Featured placements - not implemented
      'placements_list',        // General placements - not implemented
      'academics_overview'      // Academic overview - not implemented
    ];
    
    invalidKeys.forEach(key => {
      localStorage.removeItem(`cache_${key}`);
      localStorage.removeItem(`globalCache_${key}`);
    });
    
    // Clear globalCache for apps with endpoints that cause 404s
    ['alumni', 'placements', 'gallery'].forEach(app => {
      if (globalCache.clearApp) globalCache.clearApp(app);
    });
    
    console.log('🧹 Cleared cache for non-existent API endpoints (alumni/gallery/placements featured)');
  }
};

// Clean browser cache and prevent future 404 spam
export const stopInvalidEndpointRequests = () => {
  if (typeof window !== 'undefined') {
    // Mark these endpoints as permanently failed to prevent future requests
    const failedEndpoints = [
      'alumni.featured',        // Alumni featured profiles - not implemented 
      'gallery.featured',       // Featured gallery images - not implemented
      'placements.featured',    // Featured placements - not implemented
      'placements.list',        // Placements list - endpoint doesn't exist
      'academics.overview'      // Academic overview stats - not implemented
    ];
    
    // Get existing failures and merge
    try {
      const existing = localStorage.getItem('permanentFailures');
      const existingFailures = existing ? JSON.parse(existing) : [];
      const mergedFailures = [...new Set([...existingFailures, ...failedEndpoints])];
      localStorage.setItem('permanentFailures', JSON.stringify(mergedFailures));
      console.log('🛑 Marked non-existent endpoints as permanently failed:', mergedFailures);
    } catch (error) {
      localStorage.setItem('permanentFailures', JSON.stringify(failedEndpoints));
      console.log('🛑 Marked non-existent endpoints as permanently failed');
    }
  }
};

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

  const markHomepageLoaded = useCallback(() => {
    backgroundPrefetcher.markHomepageLoaded();
  }, []);

  const manualPrefetch = useCallback((apps: string[]) => {
    return backgroundPrefetcher.manualPrefetch(apps);
  }, []);

  return {
    startBackgroundPrefetch,
    markHomepageLoaded,
    isPrefetching: isRunning,
    isPaused: backgroundPrefetcher.getIsPaused(),
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
