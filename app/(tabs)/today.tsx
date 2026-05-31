import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { Moon, Zap, RefreshCw, Play, Trophy } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { useStreak } from '@/hooks/useStreak';
import { ExerciseCard } from '@/components/ExerciseCard';
import { CelebrationScreen } from '@/components/CelebrationScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function TodayScreen() {
  const { colors, isDark } = useTheme();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { groups, loading: groupsLoading, getGroupExercises } = useGroups(exercises);
  const { streakMeta } = useStreak();
  const {
    todayCompletion,
    todaysGroups,
    loading: todayLoading,
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
  } = useToday(exercises, groups);

  const [refreshing, setRefreshing] = useState(false);
  const progressAnim = useSharedValue(0);

  const loading = exercisesLoading || groupsLoading || todayLoading;
  const todaysExercises = getTodaysExercises();
  const progress = getProgress();
  const isRestDay = todaysGroups.length === 0;
  const hasActiveWorkout = todayCompletion && todayCompletion.groupId;

  useEffect(() => {
    progressAnim.value = withSpring(progress.percentage / 100);
  }, [progress.percentage]);

  const animatedProgressWidth = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleStartWorkout = async (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startWorkout(groupId);
  };

  const handleMarkComplete = async (exerciseId: string, isComplete: boolean) => {
    if (isComplete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await unmarkExerciseComplete(exerciseId);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await markExerciseComplete(exerciseId);
    }
  };

  const handleResetWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await resetWorkout();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
          </Text>
        </View>
      );
    }

    if (isRestDay && !hasActiveWorkout) {
      return (
        <View style={styles.centerContent}>
          <Animated.View entering={ZoomIn.delay(200).duration(500)}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.restIconContainer}
            >
              <Moon size={48} color="#FFFFFF" strokeWidth={1.5} />
            </LinearGradient>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={[styles.restTitle, { color: colors.text }]}>Rest Day</Text>
            <Text style={[styles.restText, { color: colors.textSecondary }]}>
              No workouts scheduled for today. Enjoy your rest!
            </Text>
          </Animated.View>
          {streakMeta.currentStreak > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <LinearGradient
                colors={['#FF6B6B', '#FFE66D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.streakCard}
              >
                <Zap size={24} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.streakCardText}>
                  {streakMeta.currentStreak} Day Streak
                </Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      );
    }

    if (!hasActiveWorkout && todaysGroups.length > 0) {
      return (
        <View style={styles.startContainer}>
          <Text style={[styles.startTitle, { color: colors.text }]}>
            Ready to workout?
          </Text>
          <Text style={[styles.startSubtitle, { color: colors.textSecondary }]}>
            {todaysGroups.length === 1
              ? todaysGroups[0].name
              : `${todaysGroups.length} groups for today`}
          </Text>

          {todaysGroups.map((group, index) => {
            const groupExercises = getGroupExercises(group.id);
            return (
              <Animated.View
                key={group.id}
                entering={FadeInDown.delay(index * 100 + 200).duration(400)}
              >
                <TouchableOpacity
                  style={[
                    styles.groupStartCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(255, 255, 255, 0.6)',
                      borderColor: `${group.color}40`,
                    },
                  ]}
                  onPress={() => handleStartWorkout(group.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[group.color, `${group.color}cc`]}
                    style={styles.colorBar}
                  />
                  <View style={styles.groupStartContent}>
                    <Text style={[styles.groupStartName, { color: colors.text }]}>
                      {group.name}
                    </Text>
                    <View style={styles.groupStartMeta}>
                      <Text style={[styles.groupStartMetaText, { color: colors.textSecondary }]}>
                        {groupExercises.length} exercises
                      </Text>
                      <View style={styles.daysBadges}>
                        {group.days.slice(0, 3).map((day) => (
                          <View
                            key={day}
                            style={[
                              styles.dayMiniBadge,
                              { backgroundColor: `${group.color}25` },
                            ]}
                          >
                            <Text style={[styles.dayMiniText, { color: group.color }]}>
                              {day}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <LinearGradient
                    colors={[group.color, `${group.color}cc`]}
                    style={styles.playButtonGradient}
                  >
                    <Play size={22} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {hasActiveWorkout && (
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <View
                style={[
                  styles.progressContainer,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(255, 255, 255, 0.6)',
                  },
                ]}
              >
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {progress.completed} / {progress.total} exercises
                  </Text>
                  <Text style={[styles.progressPercent, { color: colors.accent }]}>
                    {progress.percentage}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBarBg,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}
                >
                  <Animated.View style={[styles.progressBarFill, animatedProgressWidth]}>
                    <LinearGradient
                      colors={[colors.accent, '#764ba2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </Animated.View>
                </View>
              </View>
            </Animated.View>

            {todaysExercises.map((exercise, index) => {
              const isComplete = isExerciseComplete(exercise.id);
              const nextExerciseIndex = progress.completed;
              const isHighlighted = !isComplete && index === nextExerciseIndex;

              return (
                <Animated.View
                  key={exercise.id}
                  entering={FadeInDown.delay(index * 80 + 200).duration(400)}
                >
                  <ExerciseCard
                    exercise={exercise}
                    isComplete={isComplete}
                    showCompleteButton
                    highlighted={isHighlighted}
                    onComplete={() => handleMarkComplete(exercise.id, isComplete)}
                  />
                </Animated.View>
              );
            })}

            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: `${colors.error}15` },
              ]}
              onPress={handleResetWorkout}
              activeOpacity={0.7}
            >
              <RefreshCw size={18} color={colors.error} strokeWidth={2} />
              <Text style={[styles.resetText, { color: colors.error }]}>
                Reset Workout
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.header}>
          <View>
            <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
              {dayOfWeek}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Today</Text>
          </View>
          <ThemeToggle />
        </View>

        {streakMeta.currentStreak > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <LinearGradient
              colors={['#FF6B6B', '#FFE66D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.streakBanner}
            >
              <Zap size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.streakBannerText}>
                {streakMeta.currentStreak} Day Streak
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {renderContent()}

        <CelebrationScreen
          visible={showCelebration}
          streakCount={streakMeta.currentStreak}
          isNewRecord={
            streakMeta.currentStreak === streakMeta.bestStreak &&
            streakMeta.currentStreak > 0
          }
          onDismiss={dismissCelebration}
        />
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
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
  },
  streakBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  restIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  restTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  restText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 18,
    gap: 12,
    marginTop: 28,
  },
  streakCardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  loadingText: {
    fontSize: 16,
  },
  startContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  startTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  startSubtitle: {
    fontSize: 17,
    marginBottom: 24,
    fontWeight: '500',
  },
  groupStartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
  },
  colorBar: {
    width: 5,
    height: 60,
    borderRadius: 3,
    marginRight: 16,
  },
  groupStartContent: {
    flex: 1,
  },
  groupStartName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  groupStartMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupStartMetaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  daysBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  dayMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayMiniText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  progressContainer: {
    marginBottom: 24,
    padding: 18,
    borderRadius: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 28,
    gap: 10,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
