// Design tokens — mirrors the Neofit web app brand exactly
export const Colors = {
  background: '#0F1115',
  surface: '#1D212B',
  surfaceHover: '#222733',
  border: 'rgba(255,255,255,0.06)',
  borderFocus: 'rgba(139,174,158,0.5)',
  accent: '#8BAE9E',
  accentLight: '#A3C4B4',
  accentMuted: 'rgba(139,174,158,0.15)',
  text: '#EDEDED',
  textMuted: '#A8B0BE',
  textFaint: 'rgba(168,176,190,0.5)',
  success: '#74C69D',
  successMuted: 'rgba(116,198,157,0.15)',
  error: '#FF6B6B',
  errorMuted: 'rgba(255,107,107,0.15)',
  warning: '#C6A274',
  warningMuted: 'rgba(198,162,116,0.15)',
  push: '#C6A274',
  pull: '#74A5C6',
  legs: '#A274C6',
  rest: '#A8B0BE',
  overlay: 'rgba(15,17,21,0.85)',
  white5: 'rgba(255,255,255,0.05)',
  white8: 'rgba(255,255,255,0.08)',
  white12: 'rgba(255,255,255,0.12)',
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
}

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  hero: 34,
}

export const FontWeight: Record<string, '400' | '500' | '600' | '700' | '800'> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}
