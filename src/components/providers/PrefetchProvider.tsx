'use client';

// Provider for auto-starting background prefetch
import { useEffect } from 'react';
import { useBackgroundPrefetch } from '@/lib/backgroundPrefetch';

interface PrefetchProviderProps {
  children: React.ReactNode;
}

export const PrefetchProvider: React.FC<PrefetchProviderProps> = ({ children }) => {
  const { startBackgroundPrefetch, isPrefetching } = useBackgroundPrefetch();

  useEffect(() => {
    // Start background prefetch after component mounts with a small delay
    // This ensures the initial page load is not affected
    const timer = setTimeout(() => {
      if (!isPrefetching) {
        startBackgroundPrefetch();
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [startBackgroundPrefetch, isPrefetching]);

  return <>{children}</>;
};
