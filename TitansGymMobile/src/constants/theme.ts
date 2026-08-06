export const COLORS = {
  // Primary palette - bold orange/amber for gym energy
  primary: '#FF6B2C',
  primaryLight: '#FF8F5C',
  primaryDark: '#E05A1F',
  primaryGlow: 'rgba(255, 107, 44, 0.3)',

  // Accent - electric cyan for contrast
  accent: '#00D4FF',
  accentLight: '#5BE5FF',
  accentDark: '#00A8CC',
  accentGlow: 'rgba(0, 212, 255, 0.2)',

  // Success / green
  success: '#00E676',
  successLight: '#69F0AE',
  successDark: '#00C853',
  successBg: 'rgba(0, 230, 118, 0.1)',

  // Warning / yellow
  warning: '#FFD740',
  warningLight: '#FFE57F',
  warningDark: '#FFC400',
  warningBg: 'rgba(255, 215, 64, 0.1)',

  // Danger / red
  danger: '#FF5252',
  dangerLight: '#FF8A80',
  dangerDark: '#FF1744',
  dangerBg: 'rgba(255, 82, 82, 0.1)',

  // Backgrounds (dark mode)
  background: '#0A0E17',
  backgroundSecondary: '#111827',
  backgroundTertiary: '#1A2332',
  surface: '#1E293B',
  surfaceLight: '#263548',
  surfaceHighlight: '#2D3F54',

  // Card glass effect
  cardBg: 'rgba(30, 41, 59, 0.85)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderLight: 'rgba(255, 255, 255, 0.15)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textMuted: '#475569',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.15)',

  // Gradients
  gradientStart: '#FF6B2C',
  gradientEnd: '#FF8F5C',
  gradientAccentStart: '#00D4FF',
  gradientAccentEnd: '#00A8CC',
  headerGradientStart: '#0A0E17',
  headerGradientEnd: '#111827',

  // Trainer specific accent
  trainerAccent: '#A855F7',
  trainerAccentLight: '#C084FC',
  trainerAccentGlow: 'rgba(168, 85, 247, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const FONTS = {
  // We'll use system fonts that look great
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  hero: 32,
  display: 40,

  // Spacing
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 12,
  spacingBase: 16,
  spacingLg: 20,
  spacingXl: 24,
  spacingXxl: 32,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusFull: 999,

  // Icon
  iconSm: 18,
  iconMd: 24,
  iconLg: 28,
  iconXl: 32,

  // Tab bar
  tabBarHeight: 70,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  }),
};
