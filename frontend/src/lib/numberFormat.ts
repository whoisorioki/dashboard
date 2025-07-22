// Utility to abbreviate numbers and format as Kenyan Shillings (KSh)
export function formatKshAbbreviated(value: number): string {
  if (value == null || isNaN(value)) return 'KSh 0';
  const abs = Math.abs(value);
  let formatted = '';
  if (abs >= 1_000_000_000) {
    formatted = (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' B';
  } else if (abs >= 1_000_000) {
    formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' M';
  } else if (abs >= 1_000) {
    formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '') + ' K';
  } else {
    formatted = value.toString();
  }
  return `KSh ${formatted}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '--';
  return `${value.toFixed(1)}%`;
} 