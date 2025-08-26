import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

// Enhanced QueryClient configuration with better caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,        // 10 minutes (was 5) - data stays fresh longer
      gcTime: 60 * 60 * 1000,           // 1 hour (was 30 min) - cache lives longer
      refetchOnWindowFocus: false,       // Don't refetch when window regains focus
      refetchOnReconnect: false,         // Don't refetch on reconnect (was 'always')
      refetchOnMount: false,             // Don't refetch when component mounts
      retry: (failureCount, error) => {
        if ((error as any)?.status === 404) return false;
        return failureCount < 2;         // Reduce retries from 3 to 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s delay
    },
    mutations: {
      retry: 1,                          // Keep 1 retry for mutations
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // eslint-disable-next-line no-console
      console.error('Query Error:', { error, queryKey: query.queryKey });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // eslint-disable-next-line no-console
      console.error('Mutation Error:', { error, variables });
    },
  }),
});

/**
 * A persister for react-query that uses localStorage.
 * It is only defined in the browser environment to ensure SSR compatibility.
 */
if (typeof window !== 'undefined') {
  try {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'dashboard-cache-v1', // Versioned cache key
      serialize: data => JSON.stringify(data),
      deserialize: data => JSON.parse(data),
      throttleTime: 1000, // Throttle writes to localStorage
    });

    // Persist the query client
    persistQueryClient({
      queryClient,
      persister,
      maxAge: TWENTY_FOUR_HOURS, // Cache for 24 hours
      buster: 'dashboard-v1', // Cache buster for versioning
    });

    console.log('✅ React Query cache persistence enabled');
  } catch (error) {
    console.warn('⚠️ Failed to enable React Query cache persistence:', error);
  }
}

export default queryClient;
