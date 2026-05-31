import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Star, Trophy, Calendar, Clock, Moon, Dumbbell, Flame } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/useStreak';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WeeklyDay {
  date: string;
  status: 'completed' | 'missed' | 'rest' | 'future' | 'none';
  label: string;
}

export default function StatsScreen() {
  const { colors, isDark } = useTheme();
  const {
    streakMeta,
    history,
    loading,
    getWeeklyOverview,
    getSortedHistory,
    getStats,
  } = useStreak();

  const weeklyOverview = getWeeklyOverview();
  const sortedHistory = getSortedHistory();
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  const renderDayIcon = (status: string) => {
    const iconSize = 22;
    switch (status) {
      case 'completed':
        return <Flame size={iconSize} color="#38ef7d" strokeWidth={2.5} />;
      case 'missed':
        return <Dumbbell size={iconSize - 2} color="#ff6b6b" strokeWidth={2} />;
      case 'rest':
        return <Moon size={iconSize - 2} color={colors.textTertiary} strokeWidth={2} />;
      default:
        return <View style={[styles.emptyCircle, { borderColor: colors.border }]} />;
    }
  };

  const getDayBackgroundColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'rgba(56, 239, 125, 0.15)';
      case 'missed':
        return 'rgba(255, 107, 107, 0.12)';
      case 'rest':
        return isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
      default:
        return isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)';
    }
  };

  const renderStatusBadge = (record: {
    isComplete: boolean;
    type: string;
    completedExercises: number;
    totalExercises: number;
  }) => {
    if (record.type === 'rest') {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: 'rgba(107, 114, 128, 0.15)' },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: colors.textTertiary }]}>
            Rest
          </Text>
        </View>
      );
    }
    if (record.isComplete) {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: colors.success }]}>
            Complete
          </Text>
        </View>
      );
    }
    if (record.completedExercises > 0) {
      return (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: colors.warning }]}>
            Partial
          </Text>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
        ]}
      >
        <Text style={[styles.statusBadgeText, { color: colors.error }]}>
          Missed
        </Text>
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const todayDate = new Date();
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === todayDate.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Stats</Text>
          <ThemeToggle />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Streak Section */}
          <Animated.View entering={ZoomIn.delay(100).duration(500)}>
            <LinearGradient
              colors={['#FF6B6B', '#FFE66D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakSection}
            >
              <View style={styles.streakMain}>
                <Star size={52} color="#FFFFFF" strokeWidth={1.5} />
                <Text style={styles.streakNumber}>{streakMeta.currentStreak}</Text>
              </View>
              <Text style={styles.streakLabel}>Day Streak</Text>
              {streakMeta.bestStreak > 0 && (
                <View style={styles.bestStreakRow}>
                  <Trophy size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.bestStreakText}>
                    Best: {streakMeta.bestStreak} days
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Weekly Overview */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.weeklySection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                This Week
              </Text>
              <View
                style={[
                  styles.weeklyGrid,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
              >
                {weeklyOverview.map((day, index) => (
                  <Animated.View
                    key={day.date}
                    entering={FadeInDown.delay(index * 70 + 300).duration(400)}
                    style={[
                      styles.dayCell,
                      { backgroundColor: getDayBackgroundColor(day.status) },
                      day.date === today && {
                        borderColor: colors.accent,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                      {day.label}
                    </Text>
                    <View style={styles.dayIconContainer}>
                      {renderDayIcon(day.status)}
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            <View style={styles.summaryGrid}>
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
              >
                <View style={styles.summaryIconContainer}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.summaryIconGradient}
                  >
                    <Dumbbell size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {stats.totalWorkouts}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Workouts
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
              >
                <View style={styles.summaryIconContainer}>
                  <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    style={styles.summaryIconGradient}
                  >
                    <Trophy size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {stats.totalExercises}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Total Exercises
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
              >
                <View style={styles.summaryIconContainer}>
                  <LinearGradient
                    colors={['#f093fb', '#f5576c']}
                    style={styles.summaryIconGradient}
                  >
                    <Calendar size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {stats.monthlyWorkouts}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  This Month
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(600).duration(400)}
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
              >
                <View style={styles.summaryIconContainer}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FFE66D']}
                    style={styles.summaryIconGradient}
                  >
                    <Star size={24} color="#FFFFFF" strokeWidth={2} />
                  </LinearGradient>
                </View>
                <Text style={[styles.summaryNumber, { color: colors.text }]}>
                  {stats.bestStreak}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Best Streak
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Completion History */}
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>History</Text>
            {sortedHistory.length === 0 ? (
              <View
                style={[
                  styles.emptyHistory,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.5)',
                  },
                ]}
              >
                <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
                  No workout history yet. Start a workout today!
                </Text>
              </View>
            ) : (
              sortedHistory.slice(0, 30).map((record, index) => (
                <Animated.View
                  key={record.date}
                  entering={FadeInDown.delay(index * 40).duration(400)}
                  style={[
                    styles.historyCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.6)',
                    },
                  ]}
                >
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyDate, { color: colors.text }]}>
                      {formatDate(record.date)}
                    </Text>
                    {record.groupName && (
                      <Text style={[styles.historyGroup, { color: colors.textSecondary }]}>
                        {record.groupName}
                      </Text>
                    )}
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyProgress, { color: colors.text }]}>
                      {record.completedExercises} /{' '}
                      {record.totalExercises || record.completedExercises}
                    </Text>
                    {renderStatusBadge(record)}
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Syne',
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  streakSection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 28,
    marginBottom: 24,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 68,
    fontFamily: 'Orbitron',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  bestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  bestStreakText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weeklySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Syne',
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 22,
    gap: 8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  dayIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  summaryCard: {
    width: (width - 54) / 2,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
  },
  summaryIconContainer: {
    marginBottom: 12,
  },
  summaryIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontFamily: 'Orbitron',
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  historySection: {
    marginBottom: 24,
  },
  emptyHistory: {
    padding: 36,
    borderRadius: 22,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk',
    textAlign: 'center',
    fontWeight: '500',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontFamily: 'Syne',
    fontWeight: '800',
    marginBottom: 4,
  },
  historyGroup: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '500',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyProgress: {
    fontSize: 15,
    fontFamily: 'Orbitron',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
