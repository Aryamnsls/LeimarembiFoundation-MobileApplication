/**
 * Shared Leimarembi Foundation design tokens.
 * Keep native and web surfaces aligned to one restrained brand palette.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const BrandColors = {
  // Brand Emeralds
  primary: '#0B3820',
  primaryHover: '#082C19',
  primaryDark: '#062314',
  primarySurface: '#0F472A',
  emerald: '#059669',
  secondaryEmerald: '#059669',
  emeraldDark: '#047857',
  emeraldSoft: '#E7F4EB',
  emeraldUltraLight: '#ECFDF5',
  mint: '#34D399',
  emeraldLight: '#34D399',

  // Restrained Heritage Gold
  gold: '#D4A63B',
  goldSoft: '#FBF5E4',
  goldAmber: '#F59E0B',
  goldDark: '#B88B27',
  goldLight: '#E5C16C',
  goldSurface: '#FEF3C7',

  // Neutrals, Canvas & Surfaces
  text: '#17251B',
  textPrimary: '#17251B',
  textSecondary: '#56655B',
  secondaryText: '#56655B',
  textMuted: '#849389',
  background: '#F6F8F6',
  canvas: '#F6F8F6',
  slateBg: '#F6F8F6',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  white: '#FFFFFF',
  border: '#E0E7E1',
  cardBorder: '#E0E7E1',

  // Dark Theme Tokens
  darkBackground: '#101813',
  darkSurface: '#19251D',
  darkSelected: '#26382B',
  darkText: '#F0F5F1',
  darkSecondary: '#A6B5AA',

  // Alerts & Danger
  danger: '#B42318',
  dangerDark: '#DC2626',
  dangerSurface: '#FEF2F2',
} as const;

export const Colors = {
  light: {
    text: BrandColors.text,
    background: BrandColors.background,
    backgroundElement: BrandColors.surface,
    backgroundSelected: BrandColors.emeraldSoft,
    textSecondary: BrandColors.textSecondary,
    primary: BrandColors.primary,
    tint: BrandColors.emerald,
    border: BrandColors.border,
    gold: BrandColors.gold,
    danger: BrandColors.danger,
  },
  dark: {
    text: BrandColors.darkText,
    background: BrandColors.darkBackground,
    backgroundElement: BrandColors.darkSurface,
    backgroundSelected: BrandColors.darkSelected,
    textSecondary: BrandColors.darkSecondary,
    primary: BrandColors.primary,
    tint: BrandColors.mint,
    border: 'rgba(255, 255, 255, 0.12)',
    gold: BrandColors.goldLight,
    danger: BrandColors.danger,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 960;
