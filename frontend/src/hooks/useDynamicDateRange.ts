import { useState, useEffect } from 'react'
import { useDataRange } from './useDataRange'
import { getDefaultDateRange } from '../constants/dateRanges'

export const useDynamicDateRange = (): [Date | null, Date | null] => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const { minDate, maxDate, isLoading } = useDataRange()

  useEffect(() => {
    if (!isLoading) {
      if (minDate && maxDate) {
        // Use dynamic dates from API
        setDateRange([minDate, maxDate])
      } else {
        // Fallback to hardcoded dates
        const fallbackRange = getDefaultDateRange()
        setDateRange(fallbackRange)
      }
    }
  }, [minDate, maxDate, isLoading])

  return dateRange
}
