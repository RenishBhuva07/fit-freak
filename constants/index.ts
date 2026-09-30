import { MuscleGroup, DayOfWeek, ThemeColors } from '@/types/data';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Calves',
  'Shoulders',
  'Abs',
  'Glutes',
  'Cardio',
];

export const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Chest: '#FFC4C4',
  Back: '#C4FAF8',
  Biceps: '#FFECA1',
  Triceps: '#E6CFFF',
  Quads: '#C4D6FF',
  Hamstrings: '#C2F9BB',
  Calves: '#D6FD53',
  Shoulders: '#FFD6EC',
  Abs: '#FFECA1',
  Glutes: '#FFD6EC',
  Cardio: '#C4FAF8',
};

export const GRADIENTS = {
  primary: {
    dark: ['#1a1a2e', '#16213e', '#0f3460'],
    light: ['#ffffff', '#f0f4f8', '#e8eeef'],
  },
  accent: {
    start: '#667eea',
    end: '#764ba2',
  },
  streak: {
    start: '#FF6B6B',
    end: '#FFE66D',
  },
  success: {
    start: '#11998e',
    end: '#38ef7d',
  },
  background: {
    dark: ['#0a0a0f', '#141428', '#1a1a3e'],
    light: ['#ffffff', '#f8fafc', '#eef2f7'],
  },
  card: {
    dark: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(255, 255, 255, 0.7)',
  },
  glass: {
    dark: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.25)',
  },
  border: {
    dark: 'rgba(255, 255, 255, 0.1)',
    light: 'rgba(255, 255, 255, 0.3)',
  },
};

export const BRAND_COLORS = {
  NEON_LIME: '#D6FD53',
  SOFT_LAVENDER: '#E2D2FF',
  POWDER_BLUE: '#C4D6FF',
  RICH_BLACK: '#0B0B0B',
  CHARCOAL_CARD: '#161618',
};

export const FONTS = {
  regular: 'SpaceGrotesk-Regular',
  medium: 'SpaceGrotesk-Medium',
  bold: 'SpaceGrotesk-Bold',
  display: 'SpaceGrotesk-Bold',
  displayExtra: 'SpaceGrotesk-Bold',
  digital: 'SpaceGrotesk-Bold',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  accent: '#764ba2', // A beautiful deep purple for light theme
  accentLight: '#f5f3ff',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  card: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(0, 0, 0, 0.06)',
  streak: '#FF6B6B',
};

export const DARK_THEME: ThemeColors = {
  background: BRAND_COLORS.RICH_BLACK,
  backgroundSecondary: '#121214',
  backgroundTertiary: BRAND_COLORS.CHARCOAL_CARD,
  text: '#ffffff',
  textSecondary: '#A5A5AF',
  textTertiary: '#646470',
  accent: BRAND_COLORS.NEON_LIME,
  accentLight: 'rgba(214, 253, 83, 0.12)',
  success: BRAND_COLORS.NEON_LIME,
  error: '#FF6B6B',
  warning: '#fbbf24',
  card: BRAND_COLORS.CHARCOAL_CARD,
  border: 'rgba(255, 255, 255, 0.06)',
  streak: '#FF6B6B',
};

export const STORAGE_KEYS = {
  EXERCISES: 'gymflow_exercises',
  GROUPS: 'gymflow_groups',
  TODAY_COMPLETION: 'gymflow_today_completion',
  STREAK_HISTORY: 'gymflow_streak_history',
  STREAK_META: 'gymflow_streak_meta',
  THEME: 'gymflow_theme',
};

export const GROUP_COLORS = [
  '#E6CFFF', // Soft Purple
  '#C4D6FF', // Soft Blue
  '#D6FD53', // Neon Lime
  '#FFC4C4', // Soft Pink/Red
  '#FFECA1', // Soft Yellow/Gold
  '#C2F9BB', // Soft Mint
  '#C4FAF8', // Soft Teal/Cyan
  '#FFD6EC', // Soft Rose
];
