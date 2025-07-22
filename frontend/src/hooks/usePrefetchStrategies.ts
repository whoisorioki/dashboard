import { useQueryClient } from "@tanstack/react-query";
import { useFilters } from "../context/FilterContext";
import { queryKeys } from "../lib/queryKeys";
import { useEffect } from "react";
import { useDashboardDataQuery } from "../queries/dashboardData.generated";
import { graphqlClient } from "../lib/graphqlClient";
import { addMonths, endOfMonth } from "date-fns";

export const usePrefetchStrategies = () => {
  const queryClient = useQueryClient();
  const { date_range, selected_branch, selected_product_line } = useFilters();

  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      const [start, end] = date_range;

      // Prefetch product analytics if on the main dashboard
      queryClient.prefetchQuery({
        queryKey: queryKeys.productsPage({
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          selected_branch,
          selected_product_line,
        }),
        queryFn: () =>
          graphqlClient.request(
            useDashboardDataQuery.document, // Re-using a larger query is fine for prefetching
            { startDate: start.toISOString(), endDate: end.toISOString(), branch: selected_branch, productLine: selected_product_line }
          ),
      });

      // Prefetch next month's data
      const nextMonthStart = addMonths(start, 1);
      const nextMonthEnd = endOfMonth(nextMonthStart);

      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard({ date_range: [nextMonthStart, nextMonthEnd], selected_branch, selected_product_line, sales_target: "0" }),
        queryFn: () =>
          graphqlClient.request(useDashboardDataQuery.document, { startDate: nextMonthStart.toISOString(), endDate: nextMonthEnd.toISOString(), branch: selected_branch }),
      });
    }, 3000); // Prefetch after 3 seconds of inactivity

    return () => clearTimeout(prefetchTimer);
  }, [queryClient, date_range, selected_branch, selected_product_line]);
};