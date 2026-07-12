import { useState, useEffect, useCallback } from 'react';
import { TodayCompletion, Exercise, WorkoutGroup, DailyRecord, DayOfWeek } from '@/types/data';
import { storage } from '@/utils/storage';
import { getCurrentDayOfWeek, calculateStreak } from '@/utils/streak';

export function useToday(exercises: Exercise[], groups: WorkoutGroup[]) {
  const [todayCompletion, setTodayCompletion] = useState<TodayCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = getCurrentDayOfWeek() as DayOfWeek;
  const todaysGroups = groups.filter(g => g.days.includes(dayOfWeek));

  useEffect(() => {
    loadTodayCompletion();
  }, []);

  useEffect(() => {
    const checkCompletion = async () => {
      if (todayCompletion && todayCompletion.groupId) {
        const group = groups.find(g => g.id === todayCompletion.groupId);
        if (group) {
          const allExercisesComplete = group.exerciseIds.every(exId =>
            todayCompletion.completedExerciseIds.includes(exId)
          );
          if (allExercisesComplete && group.exerciseIds.length > 0) {
            await markDayComplete(todayCompletion);
            setShowCelebration(true);
          }
        }
      }
    };
    checkCompletion();
  }, [todayCompletion, groups]);

  const loadTodayCompletion = async () => {
    const completion = await storage.getTodayCompletion();
    setTodayCompletion(completion);
    setLoading(false);
  };

  const startWorkout = useCallback(async (groupId: string) => {
    const completion: TodayCompletion = {
      date: today,
      completedExerciseIds: [],
      groupId,
    };
    setTodayCompletion(completion);
    setShowCelebration(false);
    await storage.setTodayCompletion(completion);
  }, [today]);

  const markExerciseComplete = useCallback(async (exerciseId: string) => {
    if (!todayCompletion) return;

    const updatedCompletion: TodayCompletion = {
      ...todayCompletion,
      completedExerciseIds: [...todayCompletion.completedExerciseIds, exerciseId],
    };
    setTodayCompletion(updatedCompletion);
    await storage.setTodayCompletion(updatedCompletion);
  }, [todayCompletion]);

  const unmarkExerciseComplete = useCallback(async (exerciseId: string) => {
    if (!todayCompletion) return;

    const updatedCompletion: TodayCompletion = {
      ...todayCompletion,
      completedExerciseIds: todayCompletion.completedExerciseIds.filter(id => id !== exerciseId),
    };
    setTodayCompletion(updatedCompletion);
    setShowCelebration(false);
    await storage.setTodayCompletion(updatedCompletion);

    // Check if we need to unmark the day as complete
    const history = await storage.getStreakHistory();
    const todayRecord = history.find(r => r.date === today);
    if (todayRecord && todayRecord.isComplete) {
      const updatedHistory = history.map(r =>
        r.date === today
          ? {
            ...r,
            completedExercises: updatedCompletion.completedExerciseIds.length,
            isComplete: false,
            completedAt: null,
          }
          : r
      );
      await storage.setStreakHistory(updatedHistory);

      const meta = calculateStreak(updatedHistory);
      await storage.setStreakMeta(meta);
    }
  }, [todayCompletion, today]);

  const resetWorkout = useCallback(async () => {
    if (!todayCompletion) return;

    const updatedCompletion: TodayCompletion = {
      ...todayCompletion,
      completedExerciseIds: [],
    };
    setTodayCompletion(updatedCompletion);
    setShowCelebration(false);
    await storage.setTodayCompletion(updatedCompletion);

    // Unmark day as complete if it was marked
    const history = await storage.getStreakHistory();
    const todayRecord = history.find(r => r.date === today);
    if (todayRecord && todayRecord.isComplete) {
      const updatedHistory = history.map(r =>
        r.date === today
          ? {
            ...r,
            completedExercises: 0,
            isComplete: false,
            completedAt: null,
          }
          : r
      );
      await storage.setStreakHistory(updatedHistory);

      const meta = calculateStreak(updatedHistory);
      await storage.setStreakMeta(meta);
    }
  }, [todayCompletion, today]);

  const markDayComplete = async (completion: TodayCompletion) => {
    const group = groups.find(g => g.id === completion.groupId);
    if (!group) return;

    const record: DailyRecord = {
      date: today,
      type: 'workout',
      groupId: group.id,
      groupName: group.name,
      totalExercises: group.exerciseIds.length,
      completedExercises: completion.completedExerciseIds.length,
      isComplete: true,
      completedAt: new Date().toISOString(),
    };

    const history = await storage.getStreakHistory();
    const existingIndex = history.findIndex(r => r.date === today);

    if (existingIndex >= 0) {
      history[existingIndex] = record;
    } else {
      history.push(record);
    }

    await storage.setStreakHistory(history);

    const meta = calculateStreak(history);
    await storage.setStreakMeta(meta);
  };

  const getTodaysExercises = useCallback((): Exercise[] => {
    if (!todayCompletion || !todayCompletion.groupId) return [];

    const group = groups.find(g => g.id === todayCompletion.groupId);
    if (!group) return [];

    return group.exerciseIds
      .map(exId => exercises.find(ex => ex.id === exId))
      .filter((ex): ex is Exercise => ex !== undefined);
  }, [todayCompletion, groups, exercises]);

  const getProgress = useCallback(() => {
    if (!todayCompletion || !todayCompletion.groupId) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const group = groups.find(g => g.id === todayCompletion.groupId);
    if (!group) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = todayCompletion.completedExerciseIds.length;
    const total = group.exerciseIds.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [todayCompletion, groups]);

  const isExerciseComplete = useCallback((exerciseId: string) => {
    if (!todayCompletion) return false;
    return todayCompletion.completedExerciseIds.includes(exerciseId);
  }, [todayCompletion]);

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const completeWorkout = useCallback(async () => {
    if (!todayCompletion || !todayCompletion.groupId) return;
    const group = groups.find(g => g.id === todayCompletion.groupId);
    if (!group) return;

    const updatedCompletion: TodayCompletion = {
      ...todayCompletion,
      completedExerciseIds: group.exerciseIds,
    };

    setTodayCompletion(updatedCompletion);
    await storage.setTodayCompletion(updatedCompletion);
    await markDayComplete(updatedCompletion);
    setShowCelebration(true);
  }, [todayCompletion, groups, today]);

  return {
    todayCompletion,
    todaysGroups,
    loading,
    dayOfWeek,
    startWorkout,
    markExerciseComplete,
    unmarkExerciseComplete,
    resetWorkout,
    getTodaysExercises,
    getProgress,
    isExerciseComplete,
    showCelebration,
    dismissCelebration,
    completeWorkout,
    refreshToday: loadTodayCompletion,
  };
}
