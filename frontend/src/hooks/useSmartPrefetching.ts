import { useQueryClient } from "@tanstack/react-query";
import { useFilters } from "../context/FilterContext";
import { queryKeys, normalizeDateFilters } from "../lib/queryKeys";
import { useEffect } from "react";
import { addMonths, endOfMonth, subMonths, startOfMonth } from "date-fns";

export const useSmartPrefetching = () => {
  const queryClient = useQueryClient();
  const { date_range, selected_branch, selected_product_line } = useFilters();

  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      const [start, end] = date_range;

      // Prefetch next month's data
      const nextMonthStart = startOfMonth(addMonths(start, 1));
      const nextMonthEnd = endOfMonth(nextMonthStart);
      
      const nextMonthFilters = {
        startDate: nextMonthStart.toISOString().split('T')[0],
        endDate: nextMonthEnd.toISOString().split('T')[0],
        branch: selected_branch,
        productLine: selected_product_line,
      };

      queryClient.prefetchQuery({
        queryKey: queryKeys.monthlySalesGrowth(nextMonthFilters),
        queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Prefetch previous month's data
      const prevMonthStart = startOfMonth(subMonths(start, 1));
      const prevMonthEnd = endOfMonth(prevMonthStart);
      
      const prevMonthFilters = {
        startDate: prevMonthStart.toISOString().split('T')[0],
        endDate: prevMonthEnd.toISOString().split('T')[0],
        branch: selected_branch,
        productLine: selected_product_line,
      };

      queryClient.prefetchQuery({
        queryKey: queryKeys.monthlySalesGrowth(prevMonthFilters),
        queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
        staleTime: 10 * 60 * 1000, // 10 minutes
      });

      // Prefetch current month with different branch/product combinations
      const currentFilters = {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        branch: selected_branch,
        productLine: selected_product_line,
      };

      // Prefetch branch performance data
      queryClient.prefetchQuery({
        queryKey: queryKeys.branchPerformance(currentFilters),
        queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Prefetch common filter combinations
      const commonBranches = ['Nairobi', 'Mombasa', 'Kisumu'];
      const commonProductLines = ['Electronics', 'Clothing', 'Food'];

      commonBranches.forEach(branch => {
        if (branch !== selected_branch) {
          const branchFilters = { ...currentFilters, branch };
          queryClient.prefetchQuery({
            queryKey: queryKeys.monthlySalesGrowth(branchFilters),
            queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
            staleTime: 15 * 60 * 1000, // 15 minutes
          });
        }
      });

      commonProductLines.forEach(productLine => {
        if (productLine !== selected_product_line) {
          const productFilters = { ...currentFilters, productLine };
          queryClient.prefetchQuery({
            queryKey: queryKeys.monthlySalesGrowth(productFilters),
            queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
            staleTime: 15 * 60 * 1000, // 15 minutes
          });
        }
      });

      console.log('🚀 Smart prefetching completed for:', {
        nextMonth: nextMonthFilters,
        prevMonth: prevMonthFilters,
        current: currentFilters,
        commonBranches: commonBranches.length,
        commonProductLines: commonProductLines.length,
      });

    }, 3000); // Prefetch after 3 seconds of inactivity

    return () => clearTimeout(prefetchTimer);
  }, [queryClient, date_range, selected_branch, selected_product_line]);

  // Function to manually prefetch specific data
  const prefetchData = (filters: any) => {
    const normalizedFilters = normalizeDateFilters(filters);
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.monthlySalesGrowth(normalizedFilters),
      queryFn: () => Promise.resolve({}), // Placeholder - actual implementation needed
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    console.log('🔍 Manual prefetch for:', normalizedFilters);
  };

  return { prefetchData };
};
