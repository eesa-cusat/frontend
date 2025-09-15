'use client';

// Global cache system without external dependencies
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  page?: number;
  filters?: any;
}

// Cache duration constants (in milliseconds)
export const CACHE_DURATIONS = {
  FEATURED: 10 * 60 * 1000,    // 10 minutes for featured content
  PAGINATED: 5 * 60 * 1000,    // 5 minutes for paginated data
  DETAIL: 15 * 60 * 1000,      // 15 minutes for detailed views
  ACADEMIC_DATA: 30 * 60 * 1000, // 30 minutes for academic structure data
  OVERVIEW: 10 * 60 * 1000,    // 10 minutes for overview data
};

class GlobalCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private prefetchStatus: Record<string, boolean> = {};
  private subscribers: Set<() => void> = new Set();

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      // Load from localStorage on initialization
      this.loadFromStorage();
      
      // Set up periodic cleanup
      setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
  }

  // Create cache key
  private createCacheKey(app: string, type: string, page?: number, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `${app}_${type}_p${page || 1}_${btoa(filterStr).slice(0, 10)}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any> | undefined, maxAge: number): boolean {
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < maxAge;
  }

  // Set data in cache
  set(app: string, type: string, data: any, page?: number, filters?: any): void {
    const key = this.createCacheKey(app, type, page, filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      page,
      filters
    });
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
    this.notifySubscribers();
  }

  // Get data from cache
  get(app: string, type: string, page?: number, filters?: any, maxAge?: number): any {
    const key = this.createCacheKey(app, type, page, filters);
    const entry = this.cache.get(key);
    
    const duration = maxAge || this.getDefaultDuration(type);
    
    if (this.isValid(entry, duration)) {
      return entry!.data;
    }
    
    return null;
  }

  // Get default cache duration based on type
  private getDefaultDuration(type: string): number {
    switch (type) {
      case 'featured': return CACHE_DURATIONS.FEATURED;
      case 'detail': return CACHE_DURATIONS.DETAIL;
      case 'academic_data': return CACHE_DURATIONS.ACADEMIC_DATA;
      case 'overview': return CACHE_DURATIONS.OVERVIEW;
      default: return CACHE_DURATIONS.PAGINATED;
    }
  }

  // Mark prefetch as done for an app
  markPrefetchDone(app: string): void {
    this.prefetchStatus[app] = true;
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
    this.notifySubscribers();
  }

  // Check if prefetch is done for an app
  isPrefetchDone(app: string): boolean {
    return !!this.prefetchStatus[app];
  }

  // Check if initial prefetch is complete
  isInitialPrefetchDone(): boolean {
    return ['events', 'projects', 'gallery'].every(app => this.isPrefetchDone(app));
  }

  // Clear cache for specific app
  clearApp(app: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${app}_`)) {
        this.cache.delete(key);
      }
    }
    this.prefetchStatus[app] = false;
    if (typeof window !== 'undefined') {
      this.saveToStorage();
    }
    this.notifySubscribers();
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
    this.prefetchStatus = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eesa_global_cache');
      localStorage.removeItem('eesa_prefetch_status');
    }
    this.notifySubscribers();
  }

  // Cleanup expired entries
  private cleanup(): void {
    let hasChanges = false;
    
    for (const [key, entry] of this.cache.entries()) {
      const type = key.split('_')[1];
      const maxAge = this.getDefaultDuration(type);
      
      if (!this.isValid(entry, maxAge)) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }
    
    if (hasChanges && typeof window !== 'undefined') {
      this.saveToStorage();
      this.notifySubscribers();
    }
  }

  // Save to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to Object for JSON serialization
      const cacheObj: Record<string, CacheEntry<any>> = {};
      for (const [key, value] of this.cache.entries()) {
        cacheObj[key] = value;
      }
      
      localStorage.setItem('eesa_global_cache', JSON.stringify(cacheObj));
      localStorage.setItem('eesa_prefetch_status', JSON.stringify(this.prefetchStatus));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = localStorage.getItem('eesa_global_cache');
      const prefetchData = localStorage.getItem('eesa_prefetch_status');
      
      if (cacheData) {
        const cacheObj = JSON.parse(cacheData);
        for (const [key, value] of Object.entries(cacheObj)) {
          this.cache.set(key, value as CacheEntry<any>);
        }
      }
      
      if (prefetchData) {
        this.prefetchStatus = JSON.parse(prefetchData);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Subscribe to cache changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of cache changes
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Get cache stats for debugging
  getStats(): { size: number; apps: string[]; prefetchStatus: Record<string, boolean> } {
    const apps = Array.from(new Set(
      Array.from(this.cache.keys()).map(key => key.split('_')[0])
    ));
    
    return {
      size: this.cache.size,
      apps,
      prefetchStatus: { ...this.prefetchStatus }
    };
  }
}

// Global cache instance
export const globalCache = new GlobalCache();

// React hook for using cache with automatic updates
export const useGlobalCache = () => {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = globalCache.subscribe(() => {
      forceUpdate(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const setData = useCallback((app: string, type: string, data: any, page?: number, filters?: any) => {
    globalCache.set(app, type, data, page, filters);
  }, []);

  const getData = useCallback((app: string, type: string, page?: number, filters?: any, maxAge?: number) => {
    return globalCache.get(app, type, page, filters, maxAge);
  }, []);

  const clearAppCache = useCallback((app: string) => {
    globalCache.clearApp(app);
  }, []);

  const clearAllCache = useCallback(() => {
    globalCache.clearAll();
  }, []);

  const markPrefetchDone = useCallback((app: string) => {
    globalCache.markPrefetchDone(app);
  }, []);

  const isPrefetchDone = useCallback((app: string) => {
    return globalCache.isPrefetchDone(app);
  }, []);

  const isInitialPrefetchDone = useCallback(() => {
    return globalCache.isInitialPrefetchDone();
  }, []);

  const getCacheStats = useCallback(() => {
    return globalCache.getStats();
  }, []);

  return {
    setData,
    getData,
    clearAppCache,
    clearAllCache,
    markPrefetchDone,
    isPrefetchDone,
    isInitialPrefetchDone,
    getCacheStats
  };
};
