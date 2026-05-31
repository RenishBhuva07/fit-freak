import { useState, useEffect, useCallback } from 'react';
import { DailyRecord, StreakMeta, DayOfWeek } from '@/types/data';
import { storage } from '@/utils/storage';
import { calculateStreak, getDateStatus, getDayName } from '@/utils/streak';

export function useStreak() {
  const [streakMeta, setStreakMeta] = useState<StreakMeta>({
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
  });
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [meta, streakHistory] = await Promise.all([
      storage.getStreakMeta(),
      storage.getStreakHistory(),
    ]);
    setStreakMeta(meta);
    setHistory(streakHistory);
    setLoading(false);
  };

  const refreshStreak = useCallback(async () => {
    const streakHistory = await storage.getStreakHistory();
    const meta = calculateStreak(streakHistory);
    await storage.setStreakMeta(meta);
    setStreakMeta(meta);
    setHistory(streakHistory);
  }, []);

  const getSortedHistory = useCallback(() => {
    return [...history].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [history]);

  const getWeeklyOverview = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days: { date: string; status: 'completed' | 'missed' | 'rest' | 'future' | 'none'; label: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        status: getDateStatus(dateStr, history),
        label: getDayName(dateStr),
      });
    }

    return days;
  }, [history]);

  const getStats = useCallback(() => {
    const totalWorkouts = history.filter(r => r.isComplete).length;
    const totalExercises = history.reduce((sum, r) => sum + r.completedExercises, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyWorkouts = history.filter(r => {
      const date = new Date(r.date);
      return r.isComplete && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    return {
      totalWorkouts,
      totalExercises,
      monthlyWorkouts,
      bestStreak: streakMeta.bestStreak,
    };
  }, [history, streakMeta.bestStreak]);

  const initializeRestDay = useCallback(async (date: string) => {
    const existing = history.find(r => r.date === date);
    if (existing) return;

    const restRecord: DailyRecord = {
      date,
      type: 'rest',
      groupId: null,
      groupName: null,
      totalExercises: 0,
      completedExercises: 0,
      isComplete: false,
      completedAt: null,
    };

    const updatedHistory = [...history, restRecord];
    setHistory(updatedHistory);
    await storage.setStreakHistory(updatedHistory);
  }, [history]);

  return {
    streakMeta,
    history,
    loading,
    refreshStreak,
    getSortedHistory,
    getWeeklyOverview,
    getStats,
    initializeRestDay,
  };
}
