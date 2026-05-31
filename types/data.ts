export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Calves'
  | 'Shoulders'
  | 'Abs'
  | 'Glutes'
  | 'Cardio';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
  isCustom: boolean;
}

export interface WorkoutGroup {
  id: string;
  name: string;
  exerciseIds: string[];
  days: DayOfWeek[];
  color: string;
  icon?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  type: 'workout' | 'rest';
  groupId: string | null;
  groupName: string | null;
  totalExercises: number;
  completedExercises: number;
  isComplete: boolean;
  completedAt: string | null; // ISO timestamp
}

export interface StreakMeta {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

export interface TodayCompletion {
  date: string; // YYYY-MM-DD
  completedExerciseIds: string[];
  groupId: string | null;
}

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  success: string;
  error: string;
  warning: string;
  card: string;
  border: string;
  streak: string;
}
