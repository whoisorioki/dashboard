import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:8000';

// Type for query parameters
interface UseApiOptions {
  [key: string]: string | number | boolean | undefined;
}

// Function to format date parameters
const formatDateParam = (date: Date | null): string | undefined => {
  return date ? format(date, 'yyyy-MM-dd') : undefined;
};

// Convert query parameters to URL search params
const buildQueryString = (params?: UseApiOptions): string => {
  if (!params) return '';
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Generic fetch function
async function fetchData<T>(endpoint: string, params?: UseApiOptions): Promise<T> {
  const url = `${BASE_URL}/api${endpoint}${buildQueryString(params)}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Custom hook for fetching data
export const useApi = <T>(
  endpoint: string,
  params?: UseApiOptions,
  options = {}
) => {
  const queryKey = [endpoint, params];
  
  const { data, error, isLoading, refetch } = useQuery<T>({
    queryKey,
    queryFn: () => fetchData<T>(endpoint, params),
    ...options,
  });

  return {
    data,
    error,
    isLoading,
    mutate: refetch
  };
}

// Custom hook for mutations (POST, PUT, DELETE)
export function useApiMutation<T, R>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const response = await fetch(`${BASE_URL}/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    ...options,
  });
}

// Helper hook specifically for date-based queries
export function useDateRangeApi<T>(
  endpoint: string,
  dateRange: [Date | null, Date | null],
  additionalParams?: UseApiOptions,
  options = {}
) {
  const params = {
    start_date: formatDateParam(dateRange[0]),
    end_date: formatDateParam(dateRange[1]),
    ...additionalParams,
  };
  
  return useApi<T>(endpoint, params, options);
}
