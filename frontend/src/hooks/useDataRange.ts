import { useState, useEffect } from 'react';
import { useDataRangeQuery } from '../queries/dataRange.generated';
import { graphqlClient } from '../lib/graphqlClient';

/**
 * Hook to fetch the earliest and latest available dates from the backend.
 * 
 * This hook queries the backend to get the actual data range available in the system,
 * which is used to set constraints on date pickers and ensure queries are within
 * valid data boundaries.
 *
 * Returns:
 *   minDate (Date): The earliest available date in the system.
 *   maxDate (Date): The latest available date in the system.
 *   isLoading (boolean): Whether the query is currently loading.
 *   error (Error | null): Any error that occurred during the query.
 */
export const useDataRange = () => {
  const [minDate, setMinDate] = useState<Date>(new Date("2024-01-01"));
  const [maxDate, setMaxDate] = useState<Date>(new Date("2025-06-01"));

  const { data, error, isLoading } = useDataRangeQuery(graphqlClient);

  // Process successful API response
  useEffect(() => {
    if (data?.dataRange) {
      console.log("DataRange API response:", data.dataRange);
      const earliest = new Date(data.dataRange.earliestDate);
      const latest = new Date(data.dataRange.latestDate);
      
      if (!isNaN(earliest.getTime()) && !isNaN(latest.getTime())) {
        setMinDate(earliest);
        setMaxDate(latest);
        console.log("DataRange updated:", { earliest: earliest.toISOString(), latest: latest.toISOString() });
      } else {
        console.warn("Invalid dates from API:", { earliest: data.dataRange.earliestDate, latest: data.dataRange.latestDate });
      }
    }
  }, [data]);

  // Fallback to hardcoded dates if API fails
  useEffect(() => {
    if (error || (!isLoading && !data)) {
      console.log("DataRange API unavailable, using fallback dates (2024-01-01 to 2025-06-01)");
      if (error) {
        console.error("DataRange API error:", error);
      }
      setMinDate(new Date("2024-01-01"));
      setMaxDate(new Date("2025-06-01"));
    }
  }, [error, isLoading, data]);

  return { minDate, maxDate, isLoading, error };
};
