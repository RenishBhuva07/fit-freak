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
  Chest: '#FF6B6B',
  Back: '#4ECDC4',
  Biceps: '#FFE66D',
  Triceps: '#C44DFF',
  Quads: '#45B7D1',
  Hamstrings: '#96CEB4',
  Calves: '#FFA07A',
  Shoulders: '#FF69B4',
  Abs: '#F7931E',
  Glutes: '#DDA0DD',
  Cardio: '#00D4FF',
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

export const LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  accent: '#667eea',
  accentLight: '#eef2ff',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  card: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(0, 0, 0, 0.06)',
  streak: '#FF6B6B',
};

export const DARK_THEME: ThemeColors = {
  background: '#0a0a0f',
  backgroundSecondary: '#141428',
  backgroundTertiary: '#1a1a3e',
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  textTertiary: '#606070',
  accent: '#667eea',
  accentLight: '#1e1e4e',
  success: '#38ef7d',
  error: '#ff6b6b',
  warning: '#fbbf24',
  card: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)',
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
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#667eea',
  '#C44DFF',
  '#FF69B4',
  '#45B7D1',
  '#F7931E',
];
