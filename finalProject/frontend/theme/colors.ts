export const AppColors = {
  // Primary Colors (vibrant colors that pop on dark backgrounds)
  limeGreen: '#BBF244',
  oliveGreen: '#94BF36',
  darkOlive: '#535925',
  coral: '#F27244',
  almostBlack: '#0D0D0D',

  // Semantic Colors
  primary: '#BBF244',
  secondary: '#94BF36',
  accent: '#F27244',

  // Dark Mode Background Colors
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceVariant: '#262626',
  surfaceElevated: '#2D2D2D',

  // Dark Mode Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textLight: '#808080',
  textOnPrimary: '#0D0D0D',
  textOnDark: '#BBF244',

  // Status Colors
  positive: '#94BF36',
  warning: '#F27244',
  negative: '#F27244',

  // Budget Health Colors
  healthy: '#94BF36',
  cautionary: '#F27244',
  overspent: '#535925',

  // Chart Colors (adjusted for dark mode visibility)
  chartPrimary: '#BBF244',
  chartSecondary: '#94BF36',
  chartAccent: '#F27244',
  chartNeutral: '#404040',
  chartGrid: '#333333',

  // UI Colors (dark mode optimized)
  divider: '#333333',
  border: '#404040',
  overlay: 'rgba(0, 0, 0, 0.7)',
  dialogBackground: '#1A1A1A',
  inputBackground: '#262626',
};

export const getAvailableColor = (available: number): string => {
  if (available > 0) return AppColors.positive;
  if (available < 0) return AppColors.negative;
  return AppColors.textLight;
};

export const getHealthColor = (spentPercentage: number, available: number): string => {
  if (available < 0) {
    return AppColors.overspent;
  } else if (spentPercentage >= 80) {
    return AppColors.cautionary;
  } else {
    return AppColors.healthy;
  }
};

export const getTransactionColor = (transactionType: 'income' | 'expense'): string => {
  return transactionType === 'income' ? AppColors.positive : AppColors.negative;
};
