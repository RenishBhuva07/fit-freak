import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import { Exercise, WorkoutGroup, DailyRecord, StreakMeta, TodayCompletion, ThemeMode } from '@/types/data';
import { getDefaultExercises } from '@/data/defaultExercises';

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
      return data ? JSON.parse(data) : [];
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
