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
      
      let earliest: Date;
      let latest: Date;
      
      // Handle different date formats: ISO string, Unix timestamp (ms), or Unix timestamp (s)
      const parseFlexibleDate = (dateValue: string | number): Date => {
        if (typeof dateValue === 'string') {
          // If it's a string that looks like a timestamp
          if (/^\d+$/.test(dateValue)) {
            const timestamp = parseInt(dateValue);
            // If timestamp is in seconds (< year 2100 in milliseconds), convert to milliseconds
            return new Date(timestamp < 4102444800000 ? timestamp * 1000 : timestamp);
          }
          // Otherwise treat as ISO string
          return new Date(dateValue);
        } else if (typeof dateValue === 'number') {
          // If timestamp is in seconds (< year 2100 in milliseconds), convert to milliseconds
          return new Date(dateValue < 4102444800000 ? dateValue * 1000 : dateValue);
        }
        throw new Error('Invalid date format');
      };
      
      try {
        earliest = parseFlexibleDate(data.dataRange.earliestDate);
        latest = parseFlexibleDate(data.dataRange.latestDate);
        
        if (!isNaN(earliest.getTime()) && !isNaN(latest.getTime())) {
          setMinDate(earliest);
          setMaxDate(latest);
          console.log("DataRange updated:", { 
            earliest: earliest.toISOString(), 
            latest: latest.toISOString() 
          });
        } else {
          throw new Error('Parsed dates are invalid');
        }
      } catch (error) {
        console.warn("Failed to parse dates from API:", { 
          earliest: data.dataRange.earliestDate, 
          latest: data.dataRange.latestDate,
          error: error
        });
        // Fall back to default dates
        setMinDate(new Date("2024-01-01"));
        setMaxDate(new Date("2025-06-01"));
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
