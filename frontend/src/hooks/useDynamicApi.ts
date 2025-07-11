import { useApi as useRealApi } from './useApi'

// Define consistent return type interface
interface ApiResult<T> {
  data: T | undefined
  error: unknown
  isLoading: boolean
  mutate: () => void
}

// Dynamic hook that uses the real API but respects the "ignore mock data in Druid" setting
export const useApi = <T>(endpoint: string, params?: any, options = {}): ApiResult<T> => {
  // Check if we should ignore mock data that might exist in the Druid cluster
  const ignoreMockDataInDruid = localStorage.getItem('ignoreMockDataInDruid') === 'true'
  
  // Add the flag to filter out mock data from Druid if needed
  const enhancedParams = ignoreMockDataInDruid 
    ? { ...params, ignore_mock_data: true }
    : params
  
  return useRealApi<T>(endpoint, enhancedParams, options)
}

// Also export as useDynamicApi for backward compatibility
export const useDynamicApi = useApi

export default useApi
