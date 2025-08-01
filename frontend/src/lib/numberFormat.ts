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

export function formatPercentage(
  value: number | null | undefined, 
  options: {
    decimals?: number;
    showSign?: boolean;
    showBadge?: boolean;
  } = {}
): string {
  if (value == null || isNaN(value)) return '--';
  
  const {
    decimals = 1,
    showSign = false,
    showBadge = false
  } = options;
  
  const sign = showSign && value > 0 ? '+' : '';
  const formatted = `${sign}${value.toFixed(decimals)}%`;
  
  if (showBadge) {
    if (value > 0) return `📈 ${formatted}`;
    if (value < 0) return `📉 ${formatted}`;
    return `➖ ${formatted}`;
  }
  
  return formatted;
}

export function formatChange(
  value: number | null | undefined,
  options: {
    decimals?: number;
    showArrow?: boolean;
    colorCode?: boolean;
  } = {}
): string {
  if (value == null || isNaN(value)) return '--';
  
  const {
    decimals = 1,
    showArrow = true,
    colorCode = false
  } = options;
  
  const sign = value > 0 ? '+' : '';
  const arrow = showArrow ? (value > 0 ? '↗' : value < 0 ? '↘' : '→') : '';
  
  return `${arrow} ${sign}${value.toFixed(decimals)}%`;
} 