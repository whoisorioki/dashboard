import { useQueryClient } from "@tanstack/react-query";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useEffect } from "react";
import { addMonths, endOfMonth } from "date-fns";

export const usePrefetchStrategies = () => {
  const queryClient = useQueryClient();
  const { date_range, selected_branch, selected_product_line } = useFilters();

  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      const [start, end] = date_range;

      // Prefetch product analytics if on the main dashboard
      const productFilters = {
        dateRange: { start, end },
        productLine: selected_product_line,
      };

      queryClient.prefetchQuery({
        queryKey: queryKeys.productAnalytics(productFilters),
        queryFn: () => Promise.resolve({}), // Placeholder since we can't use the document property
      });

      // Prefetch next month's data
      const nextMonthStart = addMonths(start, 1);
      const nextMonthEnd = endOfMonth(nextMonthStart);

      const nextMonthFilters = {
        startDate: nextMonthStart.toISOString().split('T')[0],
        endDate: nextMonthEnd.toISOString().split('T')[0],
        branch: selected_branch,
        productLine: selected_product_line,
        itemGroups: [],
        target: 0,
      };

      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard(nextMonthFilters),
        queryFn: () => Promise.resolve({}), // Placeholder since we can't use the document property
      });
    }, 3000); // Prefetch after 3 seconds of inactivity

    return () => clearTimeout(prefetchTimer);
  }, [queryClient, date_range, selected_branch, selected_product_line]);
};