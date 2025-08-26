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
          queryKey: queryKeys.productAnalytics({} as any),
        });
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard({} as any),
        });
        break;

      case "salesperson":
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.salesPerformance({} as any),
        });
        break;

      case "branch":
        await this.queryClient.invalidateQueries({
          queryKey: queryKeys.branchPerformance({} as any),
        });
        break;
    }
  }

  /**
   * Warms the cache by prefetching critical data for the dashboard.
   * @param filters The current filters to prefetch data for.
   */
  async warmCache(filters: FilterState) {
    // Convert FilterState to DashboardFilters format
    const dashboardFilters = {
      startDate: filters.date_range?.[0]?.toISOString() || new Date().toISOString(),
      endDate: filters.date_range?.[1]?.toISOString() || new Date().toISOString(),
      branch: filters.selected_branch,
      productLine: filters.selected_product_line,
      itemGroups: [], // FilterState doesn't have selected_item_groups
      target: filters.sales_target ? parseFloat(filters.sales_target) : undefined,
    };

    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard(dashboardFilters),
      queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
    });
  }
}

export default CacheManager;