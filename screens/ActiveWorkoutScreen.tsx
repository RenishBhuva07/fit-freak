import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
// animations removed for static exercise cards
import { Play, Pause, ChevronLeft, RefreshCw } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { useStreak } from '@/hooks/useStreak';
import { ExerciseCard } from '@/components/ExerciseCard';
import { CelebrationScreen } from '@/components/CelebrationScreen';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BRAND_COLORS, FONTS } from '@/constants';

const { width, height } = Dimensions.get('window');

export default function ActiveWorkoutScreen() {
  const { colors, isDark } = useTheme();
  const { exercises } = useExercises();
  const { groups, getGroupEstimatedDuration } = useGroups(exercises);
  const { streakMeta } = useStreak();
  const {
    todayCompletion,
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
  } = useToday(exercises, groups);

  const navigation = useNavigation<any>();
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const todaysExercises = getTodaysExercises();
  const progress = getProgress();
  const activeWorkoutGroup = groups.find(g => g.id === todayCompletion?.groupId);
  const estimatedDuration = activeWorkoutGroup ? getGroupEstimatedDuration(activeWorkoutGroup.id) : 0;
  const burnRatePerMinute = 8;
  const caloriesTarget = Math.max(Math.round(estimatedDuration * burnRatePerMinute), 120);
  const caloriesBurned = progress.total > 0
    ? Math.round((progress.completed / progress.total) * caloriesTarget)
    : 0;
  const calorieProgressLevel = progress.total > 0
    ? Math.min(5, Math.max(1, Math.round((progress.completed / progress.total) * 5)))
    : 3;

  useEffect(() => {
    if (!todayCompletion) {
      return;
    }

    setElapsedSeconds(0);
    setWorkoutPaused(showCelebration ? true : false);
  }, [todayCompletion?.groupId, showCelebration]);

  useEffect(() => {
    if (showCelebration) {
      setWorkoutPaused(true);
    }
  }, [showCelebration]);

  // Active workout elapsed timer logic
  useEffect(() => {
    let interval: any = null;
    if (todayCompletion && !workoutPaused && !showCelebration) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [todayCompletion, workoutPaused, showCelebration]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWorkoutPaused(prev => !prev);
  };

  const handleResetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setElapsedSeconds(0);
    setWorkoutPaused(true);
  };

  const handleRestartSession = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await resetWorkout();
    setElapsedSeconds(0);
    setWorkoutPaused(true);
    dismissCelebration();
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
    Alert.alert(
      "Reset Workout?",
      "Are you sure you want to reset all exercises in this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await resetWorkout();
            setElapsedSeconds(0);
            setWorkoutPaused(true);
          }
        }
      ]
    );
  };

  const handleCompleteWorkout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeWorkout();
  };

  const handleCelebrationDismiss = () => {
    dismissCelebration();
    // After celebration, return to the main dashboard
    navigation.navigate('MainTabs', { screen: 'Today' });
  };

  if (!todayCompletion || !activeWorkoutGroup) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>No active workout found.</Text>
        <TouchableOpacity
          style={[styles.backToDashboardButton, { backgroundColor: colors.accentLight }]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Today' })}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.workoutContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Full Screen Background Graphic of Exercise */}
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundTertiary]}
        style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
      />

      <View style={styles.workoutBgPlaceholder}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path d="M0,0 L100,0 L100,100 L0,100 Z" fill={colors.backgroundTertiary} />
          <Circle cx="50" cy="40" r="30" fill="none" stroke={colors.border} strokeWidth="0.5" />
          <Circle cx="50" cy="40" r="40" fill="none" stroke={colors.border} strokeWidth="0.2" />
          <Path d="M20,10 L80,90 M80,10 L20,90" stroke={colors.border} strokeWidth="0.1" />
        </Svg>

        <View style={styles.squatTrainerTextContainer}>
          <Text style={[styles.trainerOverlayWord, { color: colors.textTertiary }]}>FITNESS</Text>
        </View>
      </View>

      {/* Top Header */}
      <View style={[styles.workoutHeader, { zIndex: 10 }]}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={[styles.backArrowButton, { backgroundColor: colors.accentLight }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={[styles.workoutHeaderTitle, { color: colors.text }]}>Your Workout</Text>
            <Text style={[styles.workoutHeaderSubtitle, { color: colors.textSecondary }]}>{activeWorkoutGroup.name}</Text>
          </View>
        </View>

        <View style={styles.workoutHeaderRight}>
          <View style={styles.burnedContainer}>
            <Text style={[styles.burnedLabel, { color: colors.textSecondary }]}>Kcal Burned</Text>
            <Text style={[styles.burnedValue, { color: colors.text }]}>{caloriesBurned}</Text>
          </View>
          <View style={styles.caloriesIndicatorBars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.indicatorBar,
                  i <= calorieProgressLevel ? { backgroundColor: colors.accentLight } : { backgroundColor: colors.border }
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.pauseButton, { backgroundColor: colors.card, shadowColor: colors.background }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setWorkoutPaused(!workoutPaused);
            }}
          >
            {workoutPaused ? <Play size={20} color={isDark ? colors.background : colors.text} fill={isDark ? colors.background : colors.text} /> : <Pause size={20} color={isDark ? colors.background : colors.text} fill={isDark ? colors.background : colors.text} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable list of exercises overlaid in workout */}
      <ScrollView
        style={[styles.workoutScroll, { zIndex: 5 }]}
        contentContainerStyle={styles.workoutScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {todaysExercises.map((exercise, index) => {
          const isComplete = isExerciseComplete(exercise.id);
          const nextExerciseIndex = progress.completed;
          const isHighlighted = !isComplete && index === nextExerciseIndex;

          return (
            <View key={exercise.id} style={styles.exerciseCardWrapper}>
              <ExerciseCard
                exercise={exercise}
                isComplete={isComplete}
                showCompleteButton
                highlighted={isHighlighted}
                onComplete={() => handleMarkComplete(exercise.id, isComplete)}
              />
            </View>
          );
        })}

        {/* Complete Session Button */}
        <TouchableOpacity
          style={styles.completeButtonContainer}
          onPress={handleCompleteWorkout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[BRAND_COLORS.NEON_LIME, '#cFFF04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.completeButtonGradient}
          >
            <Text style={[styles.completeButtonText, { color: colors.background }]}>Complete Session</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reset Workout Session Button */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: isDark ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.08)' },
          ]}
          onPress={handleResetWorkout}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={colors.error} strokeWidth={2} />
          <Text style={[styles.resetText, { color: colors.error }]}>Reset Workout Session</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Premium white curved timer overlay panel */}
      <View style={[styles.workoutFooterPanel, { zIndex: 15, backgroundColor: colors.card, shadowColor: colors.background, shadowOpacity: 0.12 }]}>
        <View style={[styles.panelHandle, { backgroundColor: colors.border }]} />

        <View style={styles.timerControlRow}>
          <View style={styles.timeStatsColumn}>
            <Text style={[styles.timeStatsLabel, { color: colors.textSecondary }]}>Elapsed</Text>
            <Text style={[styles.timeStatsValue, { color: colors.text }]}>{formatTimer(elapsedSeconds)}</Text>
          </View>

          <View style={styles.digitalTimerContainer}>
            <TouchableOpacity onPress={handleToggleTimer} activeOpacity={0.8}>
              <Text style={[styles.digitalTimer, { color: colors.text }]}>{formatTimer(elapsedSeconds)}</Text>
            </TouchableOpacity>
            <View style={styles.timerControlsRow}>
              <TouchableOpacity onPress={handleToggleTimer} style={styles.smallTimerControl} activeOpacity={0.8}>
                {workoutPaused ? <Play size={14} color={colors.text} /> : <Pause size={14} color={colors.text} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResetTimer} style={styles.smallTimerControl} activeOpacity={0.8}>
                <RefreshCw size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeStatsColumnAlignRight}>
            <Text style={[styles.timeStatsLabel, { color: colors.textSecondary }]}>Set</Text>
            <Text style={[styles.timeStatsValue, { color: colors.text }]}>{`${Math.min(progress.completed + 1, progress.total)}/${progress.total}`}</Text>
          </View>
        </View>
      </View>

      <CelebrationScreen
        visible={showCelebration}
        streakCount={streakMeta.currentStreak}
        isNewRecord={
          streakMeta.currentStreak === streakMeta.bestStreak &&
          streakMeta.currentStreak > 0
        }
        onDismiss={handleCelebrationDismiss}
        actionLabel="Restart Session"
        onAction={handleRestartSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  workoutContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  workoutBgPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squatTrainerTextContainer: {
    position: 'absolute',
    top: height * 0.15,
  },
  trainerOverlayWord: {
    fontSize: width * 0.16,
    color: 'rgba(255, 255, 255, 0.015)',
    fontFamily: FONTS.display,
    letterSpacing: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 12,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  workoutHeaderTitle: {
    fontSize: 20,
    fontFamily: FONTS.display,
    color: '#FFFFFF',
  },
  workoutHeaderSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#8E8E93',
    marginTop: 1,
  },
  workoutHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  burnedContainer: {
    alignItems: 'flex-end',
  },
  burnedLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  burnedValue: {
    fontSize: 18,
    fontFamily: FONTS.digital,
    color: '#FFFFFF',
    marginTop: 2,
  },
  caloriesIndicatorBars: {
    flexDirection: 'row',
    gap: 3,
    height: 18,
    alignItems: 'flex-end',
  },
  indicatorBar: {
    width: 3,
    height: 12,
    borderRadius: 1.5,
  },
  pauseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  workoutScroll: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  workoutScrollContent: {
    paddingBottom: 160, // extra padding so we scroll completely past the footer timer panel
  },
  exerciseCardWrapper: {
    marginBottom: 12,
  },
  completeButtonContainer: {
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: BRAND_COLORS.NEON_LIME,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#0A0A0F',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
    gap: 8,
  },
  resetText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  workoutFooterPanel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20, // Sit nicely at the very bottom edge of screen (tab bar is hidden)
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  panelHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 12,
  },
  timerControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  timeStatsColumn: {
    gap: 2,
  },
  timeStatsColumnAlignRight: {
    gap: 2,
    alignItems: 'flex-end',
  },
  timeStatsLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: '#8E8E93',
  },
  timeStatsValue: {
    fontSize: 14,
    fontFamily: FONTS.digital,
    color: '#0A0A0F',
  },
  digitalTimerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerControlsRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallTimerControl: {
    width: 32,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitalTimer: {
    fontSize: 34,
    fontFamily: FONTS.digital,
    color: '#0A0A0F',
    letterSpacing: -1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#8E8E93',
    marginBottom: 20,
  },
  backToDashboardButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
});
