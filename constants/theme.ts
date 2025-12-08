export const colors = {
  primary: '#4A7C2E',
  primaryDark: '#3A6125',
  primaryLight: '#5A8C3E',
  background: '#F5F8F3',
  textPrimary: '#2D3E1F',
  textSecondary: '#5A6C4A',
  textTertiary: '#8A9B7A',
  accent: '#7FA957',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFBF9',
  border: '#E0E6DB',
  borderLight: '#EDF1E9',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  success: '#388E3C',
  successLight: '#E8F5E9',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  info: '#1976D2',
  infoLight: '#E3F2FD',
  disabled: '#BDBDBD',
  disabledBackground: '#F5F5F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
