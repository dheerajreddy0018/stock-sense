/**
 * Formats a number as INR Currency (default for GCET Hyderabad Hackathon 2026) or USD.
 */
export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats integer or fractional quantity with unit of measure.
 */
export function formatQuantity(qty: number, uom?: string): string {
  if (isNaN(qty)) return '0';
  const formatted = new Intl.NumberFormat('en-IN').format(qty);
  return uom ? `${formatted} ${uom}` : formatted;
}

/**
 * Formats ISO date or timestamp into readable format.
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats a short date string (e.g. 26 Sep 2026)
 */
export function formatShortDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}
