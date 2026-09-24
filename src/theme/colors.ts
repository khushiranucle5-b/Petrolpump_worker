/**
 * Petrol Pump Worker App - Color Palette
 * Designed for high visibility, professional petrol-station aesthetic,
 * rich dark backgrounds, crisp card surfaces, and accessible contrast.
 */

export const colors = {
  // Brand & Primary
  primary: '#0A3F5C',
  primaryLight: '#0E5A84',
  primaryDark: '#052333',
  primaryGradientStart: '#0A3F5C',
  primaryGradientEnd: '#062B40',

  // Secondary & Accents
  accent: '#0B96CD',
  accentLight: '#42B1DB',
  accentDark: '#086E96',
  accentSubtle: '#E6F4FA',

  cyan: '#0B96CD',
  cyanLight: '#E6F4FA',
  cyanDark: '#086E96',

  // Status & Alerts
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#047857',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#B91C1C',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',

  // Neutral & Surfaces
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  surfaceDark: '#0A3F5C',

  // Text Colors
  textPrimary: '#0A3F5C',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  textInverseSecondary: '#CBD5E1',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  borderFocused: '#0B96CD',

  // UI Overlays & Shadows
  overlay: 'rgba(5, 35, 51, 0.7)',
  shadow: '#0A3F5C',
  scannerGlow: '#0B96CD',
  laserColor: '#0B96CD',

  // QR Reticle & Frame
  qrFrame: '#FFFFFF',
  qrCorner: '#0B96CD',
  qrMask: 'rgba(10, 63, 92, 0.75)',
};

export type Colors = typeof colors;
