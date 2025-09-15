'use client';

// Provider for homepage-aware background prefetch
import { useEffect } from 'react';
import { useBackgroundPrefetch } from '@/lib/backgroundPrefetch';
import { usePathname } from 'next/navigation';

interface PrefetchProviderProps {
  children: React.ReactNode;
}

export const PrefetchProvider: React.FC<PrefetchProviderProps> = ({ children }) => {
  const { markHomepageLoaded, isPrefetching, isPaused } = useBackgroundPrefetch();
  const pathname = usePathname();

  useEffect(() => {
    // Mark homepage as loaded when user is on root path and page is ready
    if (pathname === '/') {
      const timer = setTimeout(() => {
        console.log('🏠 Homepage fully loaded - enabling prioritized background prefetch');
        markHomepageLoaded();
      }, 1500); // Wait for homepage to fully render

      return () => clearTimeout(timer);
    }
  }, [pathname, markHomepageLoaded]);

  // Log prefetch status for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`📊 Prefetch Status: ${isPrefetching ? 'Running' : 'Idle'} | ${isPaused ? 'Paused' : 'Active'} | Path: ${pathname}`);
    }
  }, [isPrefetching, isPaused, pathname]);

  return <>{children}</>;
};
