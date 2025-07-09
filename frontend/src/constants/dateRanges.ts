// Date ranges based on actual data in Druid
// These are fallback values if the API fails

export const FALLBACK_DATE_RANGE = {
  // Earliest data available (fallback)
  MIN_DATE: new Date('2023-01-01'),
  
  // Latest data available (fallback)
  MAX_DATE: new Date('2025-06-01'),
}

// Helper function to get fallback date range (full range)
export const getDefaultDateRange = (): [Date, Date] => {
  return [FALLBACK_DATE_RANGE.MIN_DATE, FALLBACK_DATE_RANGE.MAX_DATE]
}

// Helper function to validate date range
export const isValidDateRange = (startDate: Date | null, endDate: Date | null, minDate?: Date | null, maxDate?: Date | null): boolean => {
  if (!startDate || !endDate) return false
  
  const min = minDate || FALLBACK_DATE_RANGE.MIN_DATE
  const max = maxDate || FALLBACK_DATE_RANGE.MAX_DATE
  
  return (
    startDate >= min &&
    endDate <= max &&
    startDate <= endDate
  )
}
