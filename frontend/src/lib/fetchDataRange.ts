/**
 * Fetches the available data range and total record count from the backend /api/data-range endpoint.
 * Logs the result to the browser console for debugging purposes.
 *
 * Example usage (in browser console or React useEffect):
 *   import { fetchAndLogDataRange } from '../lib/fetchDataRange';
 *   fetchAndLogDataRange();
 */
export async function fetchAndLogDataRange() {
    try {
        const response = await fetch('/api/data-range');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
            const { earliest_date, latest_date, total_records } = result.data[0];
            // eslint-disable-next-line no-console
            console.log('[Data Range] Earliest:', earliest_date, 'Latest:', latest_date, 'Total Records:', total_records);
        } else {
            // eslint-disable-next-line no-console
            console.warn('[Data Range] No data returned from /api/data-range');
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Data Range] Error fetching /api/data-range:', error);
    }
} 