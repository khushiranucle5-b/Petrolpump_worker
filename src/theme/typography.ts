/**
 * Petrol Pump Worker App - Typography Tokens
 * Clean, bold, legible styling optimized for fast reading outdoors & under sunlight.
 */
import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headings
  h1: {
    fontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h2: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  h3: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  h4: {
    fontFamily,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600' as TextStyle['fontWeight'],
  },

  // Body Text
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as TextStyle['fontWeight'],
  },

  // Specialized Display
  amountHero: {
    fontFamily,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800' as TextStyle['fontWeight'],
  },
  amountLarge: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  amountMedium: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
  },

  // UI labels & buttons
  button: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
  badge: {
    fontFamily,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
};

export type Typography = typeof typography;