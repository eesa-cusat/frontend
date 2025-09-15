'use client';

// Enhanced page-level caching for seamless navigation
import { useState, useEffect, useCallback } from 'react';
import { useGlobalCache } from '@/lib/globalCache';
import { useBackgroundPrefetch } from '@/lib/backgroundPrefetch';

interface PageCache {
  [key: string]: {
    component: React.ComponentType<any>;
    data: any;
    lastVisited: number;
    isStale: boolean;
  };
}

// Page cache manager for seamless navigation
export class PageCacheManager {
  private pageCache: PageCache = {};
  private currentPage: string = '';
  private subscribers: Set<() => void> = new Set();

  // Register a page with its data
  registerPage(pageKey: string, component: React.ComponentType<any>, data: any): void {
    this.pageCache[pageKey] = {
      component,
      data,
      lastVisited: Date.now(),
      isStale: false
    };
    this.notifySubscribers();
  }

  // Get cached page data
  getPageData(pageKey: string): any {
    const cached = this.pageCache[pageKey];
    if (cached && !cached.isStale) {
      cached.lastVisited = Date.now();
      return cached.data;
    }
    return null;
  }

  // Mark page as visited
  visitPage(pageKey: string): void {
    this.currentPage = pageKey;
    if (this.pageCache[pageKey]) {
      this.pageCache[pageKey].lastVisited = Date.now();
      this.pageCache[pageKey].isStale = false;
    }
    this.notifySubscribers();
  }

  // Mark page data as stale (needs refresh)
  markPageStale(pageKey: string): void {
    if (this.pageCache[pageKey]) {
      this.pageCache[pageKey].isStale = true;
    }
    this.notifySubscribers();
  }

  // Clear specific page from cache
  clearPage(pageKey: string): void {
    delete this.pageCache[pageKey];
    this.notifySubscribers();
  }

  // Get current page
  getCurrentPage(): string {
    return this.currentPage;
  }

  // Subscribe to changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Get all cached pages
  getCachedPages(): string[] {
    return Object.keys(this.pageCache);
  }

  // Cleanup old pages (keep last 5 visited)
  cleanup(): void {
    const pages = Object.entries(this.pageCache)
      .sort(([,a], [,b]) => b.lastVisited - a.lastVisited)
      .slice(5); // Keep only 5 most recent

    pages.forEach(([key]) => {
      delete this.pageCache[key];
    });

    if (pages.length > 0) {
      this.notifySubscribers();
    }
  }
}

// Global page cache manager
export const pageCacheManager = new PageCacheManager();

// React hook for seamless page caching
export const useSeamlessNavigation = (pageKey: string) => {
  const { getData, setData, isInitialPrefetchDone } = useGlobalCache();
  const { isPrefetching, startBackgroundPrefetch } = useBackgroundPrefetch();
  const [isPageCached, setIsPageCached] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Check if page is cached
  useEffect(() => {
    const cached = pageCacheManager.getPageData(pageKey);
    setIsPageCached(!!cached);
    setIsDataLoaded(!!cached);
  }, [pageKey]);

  // Subscribe to page cache changes
  useEffect(() => {
    const unsubscribe = pageCacheManager.subscribe(() => {
      const cached = pageCacheManager.getPageData(pageKey);
      setIsPageCached(!!cached);
      if (cached) {
        setIsDataLoaded(true);
      }
    });
    return unsubscribe;
  }, [pageKey]);

  // Mark page as visited
  const markVisited = useCallback(() => {
    pageCacheManager.visitPage(pageKey);
  }, [pageKey]);

  // Cache page data
  const cachePage = useCallback((component: React.ComponentType<any>, data: any) => {
    pageCacheManager.registerPage(pageKey, component, data);
    setIsPageCached(true);
    setIsDataLoaded(true);
  }, [pageKey]);

  // Get cached page data
  const getCachedData = useCallback(() => {
    return pageCacheManager.getPageData(pageKey);
  }, [pageKey]);

  // Check if data is available in global cache
  const hasGlobalCacheData = useCallback((app: string, type: string, page?: number) => {
    return !!getData(app, type, page);
  }, [getData]);

  // Get data from global cache
  const getGlobalCacheData = useCallback((app: string, type: string, page?: number) => {
    return getData(app, type, page);
  }, [getData]);

  // Store data in global cache
  const storeInGlobalCache = useCallback((app: string, type: string, data: any, page?: number) => {
    setData(app, type, data, page);
  }, [setData]);

  // Start prefetching if not done
  const ensurePrefetch = useCallback(() => {
    if (!isInitialPrefetchDone() && !isPrefetching) {
      startBackgroundPrefetch();
    }
  }, [isInitialPrefetchDone, isPrefetching, startBackgroundPrefetch]);

  return {
    isPageCached,
    isDataLoaded,
    markVisited,
    cachePage,
    getCachedData,
    hasGlobalCacheData,
    getGlobalCacheData,
    storeInGlobalCache,
    ensurePrefetch,
    isPrefetching,
    isInitialPrefetchDone: isInitialPrefetchDone()
  };
};

// Hook for progressive loading (cards first, images later)
export const useProgressiveLoading = (items: any[] = []) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isImagesLoading, setIsImagesLoading] = useState(true);

  // Mark image as loaded
  const markImageLoaded = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  // Check if image is loaded
  const isImageLoaded = useCallback((imageId: string) => {
    return loadedImages.has(imageId);
  }, [loadedImages]);

  // Check if all images are loaded
  useEffect(() => {
    if (items.length > 0) {
      const totalImages = items.filter(item => item.image || item.flyer || item.photo).length;
      setIsImagesLoading(loadedImages.size < totalImages);
    }
  }, [items, loadedImages]);

  return {
    markImageLoaded,
    isImageLoaded,
    isImagesLoading,
    loadedImagesCount: loadedImages.size
  };
};

// Hook for instant page switching
export const useInstantPageSwitch = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchToPage = useCallback((pageKey: string, navigationCallback: () => void) => {
    setIsTransitioning(true);
    
    // Check if page is already cached
    const cachedData = pageCacheManager.getPageData(pageKey);
    
    if (cachedData) {
      // Instant switch for cached pages
      navigationCallback();
      pageCacheManager.visitPage(pageKey);
      setIsTransitioning(false);
    } else {
      // Normal navigation for uncached pages
      navigationCallback();
      pageCacheManager.visitPage(pageKey);
      setIsTransitioning(false);
    }
  }, []);

  return {
    isTransitioning,
    switchToPage
  };
};
