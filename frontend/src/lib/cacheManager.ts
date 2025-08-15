import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import type { FilterState } from "../context/FilterContext";

export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidates all queries related to the main dashboard.
   */
  async invalidateDashboard() {
    await this.queryClient.invalidateQueries({
      queryKey: queryKeys.all,
    });
  }

  /**
   * Invalidates queries based on the entity that changed.
   * @param changedEntity The type of data that was updated.
   */
  async invalidateRelatedData(
    changedEntity: "product" | "salesperson" | "branch"
  ) {
    switch (changedEntity) {
      case "product":
        // Invalidate product analytics and any dashboard view that shows products
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.productsPage({} as any), // Invalidate all product queries
        });
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard({} as any),
        });
        break;

      case "salesperson":
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.salesPage({} as any),
        });
        break;

      case "branch":
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.branchesPage({} as any),
        });
        break;
    }
  }

  /**
   * Warms the cache by prefetching critical data for the dashboard.
   * @param filters The current filters to prefetch data for.
   */
  async warmCache(filters: FilterState) {
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard(filters),
      queryFn: () =>
        this.queryClient.fetchQuery({
          queryKey: queryKeys.dashboard(filters),
          // This assumes you have a fetcher function defined elsewhere
          // queryFn: () => fetchDashboardData(filters),
        }),
    });
  }
}

import { queryClient } from "./queryClient";

export const cacheManager = new CacheManager(queryClient);