
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Star, Trophy, Calendar, Clock, Moon, Dumbbell, Flame } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/useStreak';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_COLORS, FONTS } from '@/constants';

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

  // Colors taken from the three summary cards: Total Workouts, Total Exercises, This Month
  const weeklyBoxColors = ['#E6CFFF', '#C4D6FF', BRAND_COLORS.NEON_LIME];

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
          <Animated.View
            entering={ZoomIn.delay(100).duration(500)}
            style={styles.streakSectionShadow}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FFE66D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakSectionInner}
            >
              <View style={styles.streakBackgroundIcon} pointerEvents="none">
                <Star size={140} color="rgba(255,255,255,0.14)" strokeWidth={1.6} />
              </View>
              <View style={styles.streakMain}>
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
                style={styles.weeklyGridShadow}
              >
                <View
                  style={[
                    styles.weeklyGridInner,
                    {
                      backgroundColor: isDark ? BRAND_COLORS.CHARCOAL_CARD : '#0A0A0F',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  ]}
                >
                  {weeklyOverview.map((day, index) => {
                    // fill weekly boxes in order with the three summary card colors
                    const boxFill = weeklyBoxColors[index % weeklyBoxColors.length];
                    const dayBg = boxFill;
                    return (
                      <Animated.View
                        key={day.date}
                        entering={FadeInDown.delay(index * 70 + 300).duration(400)}
                        style={[
                          styles.dayCell,
                          { backgroundColor: dayBg },
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
                    );
                  })}
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            <View style={styles.summaryGrid}>
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.summaryCardShadow}
              >
                <View
                  style={[
                    styles.summaryCardInner,
                    { backgroundColor: '#E6CFFF', borderColor: 'rgba(0,0,0,0.04)' },
                  ]}
                >
                  <View style={styles.backgroundIcon} pointerEvents="none">
                    <Dumbbell size={96} color="rgba(10,10,15,0.06)" strokeWidth={1.6} />
                  </View>
                  <Text style={[styles.summaryNumber, { color: '#0A0A0F' }]}>
                    {stats.totalWorkouts}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: '#0A0A0F' }]}>
                    Total Workouts
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                style={styles.summaryCardShadow}
              >
                <View
                  style={[
                    styles.summaryCardInner,
                    { backgroundColor: '#C4D6FF', borderColor: 'rgba(0,0,0,0.04)' },
                  ]}
                >
                  <View style={styles.backgroundIcon} pointerEvents="none">
                    <Trophy size={96} color="rgba(10,10,15,0.06)" strokeWidth={1.6} />
                  </View>
                  <Text style={[styles.summaryNumber, { color: '#0A0A0F' }]}>
                    {stats.totalExercises}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: '#0A0A0F' }]}>
                    Total Exercises
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(500).duration(400)}
                style={styles.summaryCardShadow}
              >
                <View
                  style={[
                    styles.summaryCardInner,
                    { backgroundColor: BRAND_COLORS.NEON_LIME, borderColor: 'rgba(0,0,0,0.04)' },
                  ]}
                >
                  <View style={styles.backgroundIcon} pointerEvents="none">
                    <Calendar size={96} color="rgba(10,10,15,0.06)" strokeWidth={1.6} />
                  </View>
                  <Text style={[styles.summaryNumber, { color: '#0A0A0F' }]}>
                    {stats.monthlyWorkouts}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: '#0A0A0F' }]}>
                    This Month
                  </Text>
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(600).duration(400)}
                style={styles.summaryCardShadow}
              >
                <View
                  style={[
                    styles.summaryCardInner,
                    { backgroundColor: BRAND_COLORS.CHARCOAL_CARD, borderColor: 'rgba(255,255,255,0.06)' },
                  ]}
                >
                  <View style={styles.backgroundIcon} pointerEvents="none">
                    <Star size={96} color="rgba(255,255,255,0.06)" strokeWidth={1.6} />
                  </View>
                  <Text style={[styles.summaryNumber, { color: '#FFFFFF' }]}>
                    {stats.bestStreak}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: '#FFFFFF' }]}>
                    Best Streak
                  </Text>
                </View>
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
                  style={styles.historyCardShadow}
                >
                  <View
                    style={[
                      styles.historyCardInner,
                      {
                        backgroundColor: Platform.OS === 'android'
                          ? (isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff')
                          : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)'),
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
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
    paddingTop: Platform.OS === 'ios' ? 72 : 52,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  streakSectionShadow: {
    borderRadius: 28,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  streakSectionInner: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 28,
    overflow: 'hidden',
  },
  streakMain: {
    alignItems: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 68,
    fontFamily: FONTS.digital,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  streakLabel: {
    fontSize: 20,
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weeklySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  weeklyGridShadow: {
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  weeklyGridInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 8,
    width: '100%',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
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
  summaryCardShadow: {
    width: (width - 54) / 2,
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryCardInner: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    alignItems: 'center',
    width: '100%',
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
    fontFamily: FONTS.digital,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  backgroundIcon: {
    position: 'absolute',
    right: -12,
    top: -18,
    opacity: 0.9,
    transform: [{ scale: 1 }],
    zIndex: 0,
  },
  streakBackgroundIcon: {
    position: 'absolute',
    right: 10,
    top: 6,
    opacity: 0.9,
    zIndex: 0,
    transform: [{ scale: 1 }],
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
    fontFamily: FONTS.medium,
    textAlign: 'center',
    fontWeight: '500',
  },
  historyCardShadow: {
    borderRadius: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  historyLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 4,
  },
  historyGroup: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    fontWeight: '500',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyProgress: {
    fontSize: 15,
    fontFamily: FONTS.digital,
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
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
