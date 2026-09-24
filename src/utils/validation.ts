/**
 * Input Validation Utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidMobile = (mobile: string): boolean => {
  // Supports 10-digit Indian numbers with optional +91 or leading 0
  const clean = mobile.replace(/[\s\-+]/g, '');
  const digitsOnly = clean.startsWith('91') && clean.length === 12 ? clean.slice(2) : clean;
  return /^[6-9]\d{9}$/.test(digitsOnly);
};

export const isValidIdentifier = (identifier: string): boolean => {
  const trimmed = identifier.trim();
  return isValidEmail(trimmed) || isValidMobile(trimmed) || trimmed.length >= 3;
};

export const isValidPassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

export const validateFuelAmount = (
  amountText: string,
  maxAllowed: number = 500000
): { valid: boolean; amount: number; error?: string } => {
  const trimmed = amountText.trim();
  if (!trimmed) {
    return { valid: false, amount: 0, error: 'Please enter the fuel amount' };
  }

  const parsed = Number(trimmed);
  if (isNaN(parsed)) {
    return { valid: false, amount: 0, error: 'Please enter a valid numeric amount' };
  }

  if (parsed <= 0) {
    return { valid: false, amount: 0, error: 'Fuel amount must be greater than zero' };
  }

  if (parsed > maxAllowed) {
    return { valid: false, amount: parsed, error: `Maximum transaction limit is ₹${maxAllowed.toLocaleString('en-IN')}` };
  }

  // Check max 2 decimal places
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts[1] && parts[1].length > 2) {
      return { valid: false, amount: parsed, error: 'Amount cannot have more than 2 decimal places' };
    }
  }

  return { valid: true, amount: parsed };
};
