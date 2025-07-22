import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister, SyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;

// Enhanced QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if ((error as any)?.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
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
export const localStoragePersister: SyncStoragePersister | undefined =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "SALES_ANALYTICS_CACHE",
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        throttleTime: 1000,
      })
    : undefined;

if (localStoragePersister) {
  persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: TWENTY_FOUR_HOURS,
    buster: "v1.0.0",
  });
}
