import { useState, useEffect } from "react";
import { useDataRangeQuery } from "./generated/graphql";
import { graphqlClient } from "../graphqlClient";

interface DataRangeResult {
  minDate: Date | null;
  maxDate: Date | null;
  isLoading: boolean;
  error: unknown;
}

interface DruidDataRange {
  earliest_date: string;
  latest_date: string;
  total_records: number;
}

export const useDataRange = (): DataRangeResult => {
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);

  // Fetch the data range from Druid
  const { data, error, isLoading } = useDataRangeQuery({
    client: graphqlClient,
  });

  useEffect(() => {
    if (data && data.dataRange && data.dataRange.length > 0) {
      const range = data.dataRange[0];
      try {
        // Parse the ISO date strings from Druid
        const earliest = new Date(range.earliest_date);
        const latest = new Date(range.latest_date);

        // Validate dates
        if (!isNaN(earliest.getTime()) && !isNaN(latest.getTime())) {
          setMinDate(earliest);
          setMaxDate(latest);
        }
      } catch (err) {
        console.error("Error parsing dates from data range:", err);
        // Fallback to hardcoded dates if parsing fails
        setMinDate(new Date("2023-01-01"));
        setMaxDate(new Date("2025-06-01"));
      }
    }
  }, [data]);

  // Fallback to hardcoded dates if API fails
  useEffect(() => {
    if (error || (!isLoading && !data)) {
      console.warn("Using fallback dates due to API error:", error);
      setMinDate(new Date("2023-01-01"));
      setMaxDate(new Date("2025-06-01"));
    }
  }, [error, isLoading, data]);

  return {
    minDate,
    maxDate,
    isLoading,
    error,
  };
};
