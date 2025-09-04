import { useState, useCallback, useRef } from 'react';

interface UseOptimizedFetchOptions {
  debounceMs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseOptimizedFetchOptions = {}
): FetchState<T> {
  const { debounceMs = 300, retryAttempts = 3, retryDelay = 1000 } = options;
  
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeWithRetry = useCallback(
    async (fn: () => Promise<T>, attempts: number = retryAttempts): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry(fn, attempts - 1);
        }
        throw error;
      }
    },
    [retryAttempts, retryDelay]
  );

  const fetch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise<void>((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));

          // Create new abort controller
          abortControllerRef.current = new AbortController();

          const data = await executeWithRetry(fetchFn);

          setState(prev => ({ ...prev, data, loading: false }));
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            setState(prev => ({ 
              ...prev, 
              error: error as Error, 
              loading: false 
            }));
          }
        }
        resolve();
      }, debounceMs);
    });
  }, [fetchFn, debounceMs, executeWithRetry]);

  return {
    ...state,
    refetch: fetch,
  };
}

// Hook for handling multiple simultaneous requests
export function useOptimizedMultiFetch<T extends Record<string, any>>(
  requests: Record<keyof T, () => Promise<T[keyof T]>>
): {
  data: Partial<T>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    error: Error | null;
  }>({
    data: {},
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const results = await Promise.allSettled(
        Object.entries(requests).map(async ([key, fetchFn]) => ({
          key,
          result: await fetchFn(),
        }))
      );

      const data: Partial<T> = {};
      let hasError = false;
      let lastError: Error | null = null;

      results.forEach((result, index) => {
        const key = Object.keys(requests)[index] as keyof T;
        
        if (result.status === 'fulfilled') {
          data[key] = result.value.result;
        } else {
          hasError = true;
          lastError = result.reason;
        }
      });

      setState(prev => ({
        ...prev,
        data: { ...prev.data, ...data },
        loading: false,
        error: hasError ? lastError : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [requests]);

  return {
    ...state,
    refetch: fetch,
  };
}

// Hook for infinite scroll / pagination
export function useOptimizedPagination<T>(
  fetchFn: (page: number, limit: number) => Promise<{ items: T[]; hasMore: boolean }>,
  limit: number = 10
) {
  const [state, setState] = useState<{
    items: T[];
    hasMore: boolean;
    loading: boolean;
    error: Error | null;
    page: number;
  }>({
    items: [],
    hasMore: true,
    loading: false,
    error: null,
    page: 1,
  });

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchFn(state.page, limit);
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...result.items],
        hasMore: result.hasMore,
        loading: false,
        page: prev.page + 1,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [fetchFn, limit, state.page, state.hasMore, state.loading]);

  const reset = useCallback(() => {
    setState({
      items: [],
      hasMore: true,
      loading: false,
      error: null,
      page: 1,
    });
  }, []);

  return {
    ...state,
    loadMore,
    reset,
  };
}
