/**
 * Formatting Utilities for Currency, Dates, and Text
 */

/**
 * Format number into Indian Rupee (₹) currency string
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format currency without decimals for compact displays
 */
export const formatCompactCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

/**
 * Format ISO date string into readable Date string e.g. "24 Sep 2026"
 */
export const formatDate = (isoString?: string): string => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format ISO date string into 12-hour Time string e.g. "11:45 AM"
 */
export const formatTime = (isoString?: string): string => {
  if (!isoString) return '--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Format full date & time e.g. "24 Sep 2026, 11:45 AM"
 */
export const formatDateTime = (isoString?: string): string => {
  if (!isoString) return '--';
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
};

/**
 * Mask mobile number for privacy e.g. "+91 98765 *****"
 */
export const maskMobile = (mobile?: string): string => {
  if (!mobile) return '';
  const clean = mobile.replace(/\s+/g, '');
  if (clean.length >= 10) {
    const start = clean.slice(0, 5);
    return `${start} *****`;
  }
  return mobile;
};

/**
 * Calculate discount amount and final amount for preview display
 */
export const computeDiscountBreakdown = (
  fuelAmount: number,
  discountPercentage: number
): {
  discountAmount: number;
  finalAmount: number;
} => {
  if (isNaN(fuelAmount) || fuelAmount <= 0) {
    return { discountAmount: 0, finalAmount: 0 };
  }
  const pct = Math.max(0, Math.min(100, discountPercentage));
  const discountAmount = Number(((fuelAmount * pct) / 100).toFixed(2));
  const finalAmount = Number((fuelAmount - discountAmount).toFixed(2));

  return { discountAmount, finalAmount };
};
