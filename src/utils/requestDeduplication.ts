// Request deduplication utility to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  dedupe?: boolean; // Enable deduplication (default: true for GET requests)
}

export const createRequestKey = (url: string, options: RequestOptions = {}): string => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${url}:${body}`;
};

export const deduplicatedFetch = async (
  url: string, 
  options: RequestOptions = {}
): Promise<Response> => {
  const method = options.method || 'GET';
  const shouldDedupe = options.dedupe !== false && method === 'GET';
  
  if (!shouldDedupe) {
    return fetch(url, options as RequestInit);
  }

  const requestKey = createRequestKey(url, options);
  
  // If there's already a pending request for this key, return it
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  // Create new request and store in pending map
  const requestPromise = fetch(url, options as RequestInit).finally(() => {
    // Remove from pending map when request completes
    pendingRequests.delete(requestKey);
  });

  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
};

// Clear all pending requests (useful for logout/cleanup)
export const clearPendingRequests = () => {
  pendingRequests.clear();
};

// Get current pending request count (for debugging)
export const getPendingRequestCount = () => {
  return pendingRequests.size;
};
