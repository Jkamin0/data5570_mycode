export const COLORS = {
  primary: {
    gradient: ['#667eea', '#764ba2'],
    main: '#667eea',
    light: '#a8b5ff',
    dark: '#4c63d2',
  },
  secondary: {
    gradient: ['#f093fb', '#f5576c'],
    main: '#f093fb',
    light: '#ffc3fd',
    dark: '#d371d8',
  },
  success: {
    gradient: ['#4facfe', '#00f2fe'],
    main: '#4facfe',
    light: '#7fc4ff',
    dark: '#2d8fd9',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#ef5350',
    light: '#e57373',
    dark: '#d32f2f',
  },
  background: {
    primary: '#f8f9ff',
    secondary: '#ffffff',
    card: '#ffffff',
  },
  text: {
    primary: '#2d3748',
    secondary: '#718096',
    disabled: '#a0aec0',
    inverse: '#ffffff',
  },
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e0',
    dark: '#a0aec0',
  },
  streak: {
    fire: '#ff6b6b',
    gradient: ['#ff6b6b', '#ff8e53'],
  },
  habit: {
    colors: [
      '#667eea',
      '#f093fb',
      '#4facfe',
      '#43e97b',
      '#fa709a',
      '#feca57',
      '#48dbfb',
      '#ff9ff3',
      '#54a0ff',
      '#00d2d3',
    ],
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 40,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  colored: (color) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }),
};

export const ANIMATIONS = {
  timing: {
    quick: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
};
