import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, GROUP_COLORS } from '@/constants';
import { Exercise, WorkoutGroup, DailyRecord, StreakMeta, TodayCompletion, ThemeMode, DayOfWeek } from '@/types/data';
import { getDefaultExercises } from '@/data/defaultExercises';

export const getDefaultGroups = (): WorkoutGroup[] => {
  const dayDetails: { label: DayOfWeek; name: string }[] = [
    { label: 'Mon', name: 'Monday Workout' },
    { label: 'Tue', name: 'Tuesday Workout' },
    { label: 'Wed', name: 'Wednesday Workout' },
    { label: 'Thu', name: 'Thursday Workout' },
    { label: 'Fri', name: 'Friday Workout' },
    { label: 'Sat', name: 'Saturday Workout' },
    { label: 'Sun', name: 'Sunday Workout' },
  ];

  const defaultGroups = dayDetails.map((day, idx) => ({
    id: `day-group-${day.label.toLowerCase()}`,
    name: day.name,
    exerciseIds: [],
    days: [day.label],
    color: GROUP_COLORS[idx % GROUP_COLORS.length],
  }));

  // Add the "All Days Workout" group active on all days
  defaultGroups.push({
    id: 'day-group-all',
    name: 'All Days Workout',
    exerciseIds: [],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    color: GROUP_COLORS[7 % GROUP_COLORS.length],
  });

  return defaultGroups;
};

export const storage = {
  // Exercises
  async getExercises(): Promise<Exercise[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!data) {
        const defaultExercises = getDefaultExercises();
        await this.setExercises(defaultExercises);
        return defaultExercises;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting exercises:', error);
      return getDefaultExercises();
    }
  },

  async setExercises(exercises: Exercise[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  // Groups
  async getGroups(): Promise<WorkoutGroup[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (!data) {
        const defaultGroups = getDefaultGroups();
        await this.setGroups(defaultGroups);
        return defaultGroups;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  },

  async setGroups(groups: WorkoutGroup[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  // Today Completion
  async getTodayCompletion(): Promise<TodayCompletion | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_COMPLETION);
      if (!data) return null;
      const completion: TodayCompletion = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];
      if (completion.date !== today) {
        return null;
      }
      return completion;
    } catch (error) {
      console.error('Error getting today completion:', error);
      return null;
    }
  },

  async setTodayCompletion(completion: TodayCompletion): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TODAY_COMPLETION, JSON.stringify(completion));
  },

  async clearTodayCompletion(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.TODAY_COMPLETION);
  },

  // Streak History
  async getStreakHistory(): Promise<DailyRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting streak history:', error);
      return [];
    }
  },

  async setStreakHistory(history: DailyRecord[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_HISTORY, JSON.stringify(history));
  },

  // Streak Meta
  async getStreakMeta(): Promise<StreakMeta> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_META);
      if (!data) {
        const defaultMeta: StreakMeta = {
          currentStreak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        };
        await this.setStreakMeta(defaultMeta);
        return defaultMeta;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting streak meta:', error);
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
      };
    }
  },

  async setStreakMeta(meta: StreakMeta): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_META, JSON.stringify(meta));
  },

  // Theme
  async getTheme(): Promise<ThemeMode> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return (data as ThemeMode) || 'dark';
    } catch (error) {
      console.error('Error getting theme:', error);
      return 'dark';
    }
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};
