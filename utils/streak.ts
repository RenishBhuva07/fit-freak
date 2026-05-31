import { DailyRecord, StreakMeta } from '@/types/data';

export const calculateStreak = (history: DailyRecord[]): StreakMeta => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  let bestStreak = 0;
  let streakCounter = 0;

  // Find if today is complete
  const todayRecord = sortedHistory.find(r => r.date === today);
  const isTodayComplete = todayRecord?.isComplete === true;

  // Calculate best streak (walk through entire history)
  let tempStreak = 0;
  for (let i = 0; i < sortedHistory.length; i++) {
    const record = sortedHistory[i];

    if (record.type === 'rest') {
      // Rest days don't break the streak, but don't count
      continue;
    }

    if (record.isComplete) {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak
  // Start from yesterday and walk backwards
  const startIndex = sortedHistory.findIndex(r => r.date === yesterday);
  if (startIndex !== -1) {
    for (let i = startIndex; i < sortedHistory.length; i++) {
      const record = sortedHistory[i];

      if (record.type === 'rest') {
        continue;
      }

      if (record.isComplete) {
        streakCounter++;
      } else {
        // Missed workout day - streak broken
        break;
      }
    }
  }

  // If today is complete, include it in the current streak
  if (isTodayComplete) {
    streakCounter++;
  }

  currentStreak = streakCounter;

  return {
    currentStreak,
    bestStreak: bestStreak > currentStreak ? bestStreak : currentStreak,
    lastCompletedDate: isTodayComplete ? today : (sortedHistory.find(r => r.isComplete)?.date || null),
  };
};

export const getDateStatus = (
  date: string,
  history: DailyRecord[]
): 'completed' | 'missed' | 'rest' | 'future' | 'none' => {
  const today = new Date().toISOString().split('T')[0];

  if (date > today) {
    return 'future';
  }

  const record = history.find(r => r.date === date);

  if (!record) {
    return 'none';
  }

  if (record.type === 'rest') {
    return 'rest';
  }

  return record.isComplete ? 'completed' : 'missed';
};

export const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export const getCurrentDayOfWeek = (): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const estimateWorkoutDuration = (exercises: { sets: number; reps: number; restSeconds: number }[]): number => {
  let totalSeconds = 0;

  exercises.forEach(ex => {
    // Each rep takes approximately 3 seconds
    const workTime = ex.sets * ex.reps * 3;
    // Rest after each set (except last)
    const restTime = (ex.sets - 1) * ex.restSeconds;
    totalSeconds += workTime + restTime;
  });

  // Add transition time between exercises (60 seconds each)
  totalSeconds += (exercises.length - 1) * 60;

  return Math.round(totalSeconds / 60);
};
