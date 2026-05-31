import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Play, Pause, ChevronLeft, ChevronRight, RefreshCw, ChevronRight as ChevronRightIcon } from 'lucide-react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { useStreak } from '@/hooks/useStreak';
import { ExerciseCard } from '@/components/ExerciseCard';
import { CelebrationScreen } from '@/components/CelebrationScreen';
import { GradientBackground } from '@/components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BRAND_COLORS, FONTS } from '@/constants';

const { width, height } = Dimensions.get('window');

// Format date calendar values
const getCalendarDays = () => {
  const days = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday

  // Calculate start of the week (Monday)
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    days.push({
      label: labels[i],
      dateNum: dayDate.getDate(),
      isToday: dayDate.toDateString() === today.toDateString(),
    });
  }
  return days;
};

export default function TodayScreen() {
  const { colors, isDark } = useTheme();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { groups, loading: groupsLoading } = useGroups(exercises);
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

  const navigation = useNavigation<any>();
  const currentMonthYear = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const handleChallengePress = () => {
    if (todaysGroups.length > 0) {
      // Prioritize the first group that actually has exercises, falling back to the first group
      const activeGroup = todaysGroups.find(g => g.exerciseIds.length > 0) || todaysGroups[0];
      if (activeGroup.exerciseIds.length === 0) {
        Alert.alert(
          `${activeGroup.name}`,
          `Your "${activeGroup.name}" doesn't have any exercises yet! Add exercises to this group under the Groups tab first.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Groups',
              onPress: () => {
                navigation.navigate('Groups');
              },
            },
          ]
        );
      } else {
        handleStartWorkout(activeGroup.id);
      }
    } else {
      Alert.alert(
        "No Workout Group",
        `There are no workout groups scheduled for today (${todayDayName}). Would you like to create one under the Groups tab?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Groups',
            onPress: () => {
              navigation.navigate('Groups');
            },
          },
        ]
      );
    }
  };

  const [activeTab, setActiveTab] = useState<'All' | 'Running' | 'Cycling'>('All');
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90); // 1:30 initial
  const calendarDays = getCalendarDays();

  const loading = exercisesLoading || groupsLoading || todayLoading;
  const todaysExercises = getTodaysExercises();
  const progress = getProgress();
  const hasActiveWorkout = todayCompletion && todayCompletion.groupId;
  const activeWorkoutGroup = groups.find(g => g.id === todayCompletion?.groupId);

  // Active workout countdown timer logic
  useEffect(() => {
    let interval: any = null;
    if (hasActiveWorkout && !workoutPaused && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      // Auto loop timer or complete alert
    }
    return () => clearInterval(interval);
  }, [hasActiveWorkout, workoutPaused, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartWorkout = async (groupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startWorkout(groupId);
    setTimerSeconds(90); // reset standard workout resting countdown
    setWorkoutPaused(false);
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

  // Render "Your Workout" State (Third Phone Screen in Reference)
  if (hasActiveWorkout && activeWorkoutGroup) {
    return (
      <View style={styles.workoutContainer}>
        <StatusBar style="light" />

        {/* Full Screen Background Graphic of Exercise */}
        <LinearGradient
          colors={['rgba(10, 10, 15, 0.4)', 'rgba(10, 10, 15, 0.95)']}
          style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
        />

        <View style={styles.workoutBgPlaceholder}>
          {/* Stylized background lines mimicking the reference squat photo context */}
          <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Path d="M0,0 L100,0 L100,100 L0,100 Z" fill="#131317" />
            <Circle cx="50" cy="40" r="30" fill="none" stroke="#25252b" strokeWidth="0.5" />
            <Circle cx="50" cy="40" r="40" fill="none" stroke="#25252b" strokeWidth="0.2" />
            <Path d="M20,10 L80,90 M80,10 L20,90" stroke="#25252b" strokeWidth="0.1" />
          </Svg>

          <View style={styles.squatTrainerTextContainer}>
            <Text style={styles.trainerOverlayWord}>FITNESS</Text>
          </View>
        </View>

        {/* Top Header */}
        <View style={[styles.workoutHeader, { zIndex: 10 }]}>
          <View>
            <Text style={styles.workoutHeaderTitle}>Your Workout</Text>
            <Text style={styles.workoutHeaderSubtitle}>{activeWorkoutGroup.name}</Text>
          </View>

          <View style={styles.workoutHeaderRight}>
            <View style={styles.burnedContainer}>
              <Text style={styles.burnedLabel}>Kcal Burned</Text>
              <Text style={styles.burnedValue}>328</Text>
            </View>
            <View style={styles.caloriesIndicatorBars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.indicatorBar,
                    i <= 3 ? { backgroundColor: '#E2D2FF' } : { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWorkoutPaused(!workoutPaused);
              }}
            >
              {workoutPaused ? <Play size={20} color="#000000" fill="#000" /> : <Pause size={20} color="#000000" fill="#000" />}
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
              <Animated.View
                key={exercise.id}
                entering={FadeInDown.delay(index * 80).duration(400)}
                style={styles.exerciseCardWrapper}
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
            style={[styles.resetButton, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}
            onPress={handleResetWorkout}
            activeOpacity={0.7}
          >
            <RefreshCw size={18} color="#FF6B6B" strokeWidth={2} />
            <Text style={[styles.resetText, { color: '#FF6B6B' }]}>
              Reset Workout Session
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Premium white curved timer overlay panel */}
        <View style={[styles.workoutFooterPanel, { zIndex: 15 }]}>
          <View style={styles.panelHandle} />

          <View style={styles.timerControlRow}>
            <View style={styles.timeStatsColumn}>
              <Text style={styles.timeStatsLabel}>Elapsed</Text>
              <Text style={styles.timeStatsValue}>04:30</Text>
            </View>

            <View style={styles.digitalTimerContainer}>
              <Text style={styles.digitalTimer}>{formatTimer(timerSeconds)}</Text>
            </View>

            <View style={styles.timeStatsColumnAlignRight}>
              <Text style={styles.timeStatsLabel}>Set</Text>
              <Text style={styles.timeStatsValue}>2/5</Text>
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
          onDismiss={dismissCelebration}
        />
      </View>
    );
  }

  // Render "Your Activity" Dashboard Screen (First Phone Screen in Reference)
  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Your Activity */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Your Activity</Text>
            <View style={styles.monthSelector}>
              <Text style={styles.monthText}>{currentMonthYear}</Text>
              <View style={styles.monthArrows}>
                <TouchableOpacity style={styles.monthArrowBtn}>
                  <ChevronLeft size={14} color="#0A0A0F" strokeWidth={2.5} />
                </TouchableOpacity>
                <View style={styles.monthArrowDivider} />
                <TouchableOpacity style={styles.monthArrowBtn}>
                  <ChevronRight size={14} color="#0A0A0F" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Dynamic 7-Day calendar Strip */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.calendarStrip}>
            {calendarDays.map((day, i) => (
              <View key={i} style={styles.calendarDayColumn}>
                <Text style={styles.calendarDayOfWeek}>{day.label}</Text>
                <View style={[
                  styles.calendarDateCircle,
                  day.isToday && { backgroundColor: BRAND_COLORS.NEON_LIME }
                ]}>
                  <Text style={[
                    styles.calendarDateNum,
                    day.isToday ? { color: '#0A0A0F' } : { color: '#A5A5AF' }
                  ]}>
                    {day.dateNum}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* "Today's Challenge" Banner Card */}
          <Animated.View entering={FadeInDown.delay(150).duration(450)}>
            <TouchableOpacity
              style={styles.challengeCardShadow}
              activeOpacity={0.95}
              onPress={handleChallengePress}
            >
              <View style={styles.challengeCardInner}>
                {/* Graphic background lines in SVG */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <Path d="M-10,110 C20,90 30,50 110,60" fill="none" stroke="#c0e54b" strokeWidth="8" />
                    <Path d="M-10,110 C20,90 30,50 110,60" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="12" />
                    <Circle cx="80" cy="30" r="10" fill="none" stroke="#cFFF04" strokeWidth="1" />
                    <Circle cx="80" cy="30" r="15" fill="none" stroke="#cFFF04" strokeWidth="0.5" />
                  </Svg>
                </View>

                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>{todayDayName}'s Challenge</Text>
                  <Text style={styles.challengeText}>Do your plan before 9:00 AM</Text>
                </View>

                {/* Running Silhouette SVG Cutout */}
                <View style={styles.runnerVectorContainer}>
                  <Svg width="54" height="72" viewBox="0 0 24 24" fill="none">
                    <G opacity="0.95">
                      {/* Circle head */}
                      <Circle cx="13" cy="4" r="2.5" fill="#0A0A0F" />
                      {/* Running torso & limbs */}
                      <Path
                        d="M10,8 L13,11 L12,15 L9,19 M13,11 L16,8 L19,9 M8,10 L10,8 L12,9 L14,7 M12,15 L15,18 L18,17"
                        stroke="#0A0A0F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </G>
                  </Svg>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Filter selectors Chips */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.chipsRow}>
            {(['All', 'Running', 'Cycling'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterChip,
                  activeTab === tab
                    ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
                    : { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.1)' }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
              >
                <Text style={[
                  styles.filterChipText,
                  activeTab === tab ? { color: '#0A0A0F' } : { color: '#8E8E93' }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Grid Metrics Cards */}
          <View style={styles.gridContainer}>
            {/* Steps Card (Pink/Purple) */}
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              style={[styles.gridCard, { backgroundColor: '#E6CFFF' }]}
            >
              <View style={styles.gridCardHeader}>
                <Text style={styles.gridCardTitle}>Steps</Text>
                {/* Steps walking feet SVG icon */}
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Path d="M9,4 C11,6 10,10 8,12 C6,14 4,12 4,10 C4,8 7,5 9,4 Z" fill="#0A0A0F" opacity="0.3" />
                  <Path d="M15,10 C17,12 16,16 14,18 C12,20 10,18 10,16 C10,14 13,11 15,10 Z" fill="#0A0A0F" opacity="0.3" />
                </Svg>
              </View>
              <View style={styles.stepMetricContainer}>
                <Text style={styles.stepMetricNum}>1840</Text>
                <Text style={styles.stepMetricUnit}>Steps</Text>
              </View>
            </Animated.View>

            {/* My Goals Card (Blue/Purple) */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={[styles.gridCard, { backgroundColor: '#C4D6FF' }]}
            >
              <View style={styles.gridCardHeader}>
                <Text style={styles.gridCardTitle}>My Goals</Text>
              </View>

              <Text style={styles.goalsCardSubtext}>
                Keep it up, you can achieve your goals.
              </Text>

              <View style={styles.radialContainer}>
                {/* Custom inline progress arc SVG */}
                <Svg width="54" height="54" viewBox="0 0 36 36">
                  <Circle cx="18" cy="18" r="14" fill="none" stroke="rgba(10, 10, 15, 0.08)" strokeWidth="3" />
                  <Circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0A0A0F"
                    strokeWidth="3.5"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * 42) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <SvgText
                    x="18"
                    y="21"
                    fontSize="7"
                    fontFamily={FONTS.digital}
                    fill="#0A0A0F"
                    textAnchor="middle"
                  >
                    42%
                  </SvgText>
                </Svg>
              </View>
            </Animated.View>
          </View>

          {/* Ring Chart Card (Calories Details) */}
          <Animated.View entering={FadeInDown.delay(350).duration(450)}>
            <View style={styles.donutCard}>
              <View style={styles.donutTextSide}>
                {/* List item Target */}
                <View style={styles.donutLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: BRAND_COLORS.NEON_LIME }]} />
                  <Text style={styles.legendText}>
                    <Text style={styles.legendMetric}>1200 </Text>Kcal Target
                  </Text>
                </View>
                {/* List item Burned */}
                <View style={styles.donutLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#E6CFFF' }]} />
                  <Text style={styles.legendText}>
                    <Text style={styles.legendMetric}>328 </Text>Kcal Burned
                  </Text>
                </View>
                {/* List item Remaining */}
                <View style={styles.donutLegendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#C4D6FF' }]} />
                  <Text style={styles.legendText}>
                    <Text style={styles.legendMetric}>872 </Text>Kcal Remaining
                  </Text>
                </View>
              </View>

              <View style={styles.donutChartSide}>
                {/* Beautiful 3-ring concentric SVG Donut chart */}
                <Svg width="110" height="110" viewBox="0 0 40 40">
                  {/* Base Circle */}
                  <Circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="3" />

                  {/* Ring 1 - Remaining (Blue) - Outer */}
                  <Circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#C4D6FF"
                    strokeWidth="2.5"
                    strokeDasharray="100.5"
                    strokeDashoffset={100.5 - (100.5 * 72) / 100} // 72%
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                  {/* Ring 2 - Burned (Pink) - Middle */}
                  <Circle
                    cx="20"
                    cy="20"
                    r="12.5"
                    fill="none"
                    stroke="#E6CFFF"
                    strokeWidth="2.5"
                    strokeDasharray="78.5"
                    strokeDashoffset={78.5 - (78.5 * 27) / 100} // 27%
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                  {/* Ring 3 - Target (Lime) - Inner */}
                  <Circle
                    cx="20"
                    cy="20"
                    r="9"
                    fill="none"
                    stroke={BRAND_COLORS.NEON_LIME}
                    strokeWidth="2.5"
                    strokeDasharray="56.5"
                    strokeDashoffset={56.5 - (56.5 * 42) / 100} // 42%
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />

                  {/* Badges numbers indicating sections overlay */}
                  <G opacity="0.8">
                    <Circle cx="36" cy="12" r="2.5" fill="#FFFFFF" />
                    <SvgText x="36" y="14" fontSize="4.5" fill="#000" fontWeight="900" textAnchor="middle">1</SvgText>

                    <Circle cx="32" cy="27" r="2.5" fill="#FFFFFF" />
                    <SvgText x="32" y="29" fontSize="4.5" fill="#000" fontWeight="900" textAnchor="middle">2</SvgText>

                    <Circle cx="20" cy="29" r="2.5" fill="#FFFFFF" />
                    <SvgText x="20" y="31" fontSize="4.5" fill="#000" fontWeight="900" textAnchor="middle">3</SvgText>
                  </G>
                </Svg>
              </View>
            </View>
          </Animated.View>

          {/* Quick list of routines if available */}
          {todaysGroups.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.startWorkoutSection}>
              <Text style={[styles.startWorkoutTitle, { color: colors.text }]}>Ready to workout?</Text>
              {todaysGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.quickStartRoutineCard,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
                    }
                  ]}
                  onPress={() => handleStartWorkout(group.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickStartLeft}>
                    <Text style={[styles.quickStartRoutineName, { color: colors.text }]}>{group.name}</Text>
                    <Text style={[styles.quickStartRoutineDuration, { color: colors.textSecondary }]}>Estimated: 30 mins</Text>
                  </View>
                  <LinearGradient
                    colors={[BRAND_COLORS.NEON_LIME, '#cFFF04']}
                    style={styles.playButtonIcon}
                  >
                    <ChevronRightIcon size={20} color="#000000" strokeWidth={3} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 72 : 52,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  monthText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#0A0A0F',
    letterSpacing: -0.2,
  },
  monthArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EEFF',
    borderRadius: 14,
    height: 28,
  },
  monthArrowBtn: {
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthArrowDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(10, 10, 15, 0.1)',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  calendarDayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  calendarDayOfWeek: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#646470',
  },
  calendarDateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  calendarDateNum: {
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  challengeCardShadow: {
    backgroundColor: BRAND_COLORS.NEON_LIME,
    borderRadius: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: BRAND_COLORS.NEON_LIME,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  challengeCardInner: {
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 108,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  challengeContent: {
    flex: 1,
    zIndex: 2,
  },
  challengeTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    color: '#0A0A0F',
    marginBottom: 4,
  },
  challengeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: 'rgba(10, 10, 15, 0.7)',
  },
  runnerVectorContainer: {
    position: 'absolute',
    right: 14,
    bottom: 0,
    zIndex: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    minHeight: 148,
    justifyContent: 'space-between',
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
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridCardTitle: {
    fontSize: 15,
    fontFamily: FONTS.display,
    color: '#0A0A0F',
  },
  stepMetricContainer: {
    gap: 2,
  },
  stepMetricNum: {
    fontSize: 32,
    fontFamily: FONTS.digital,
    color: '#0A0A0F',
    letterSpacing: -1,
  },
  stepMetricUnit: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: 'rgba(10, 10, 15, 0.6)',
  },
  goalsCardSubtext: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: 'rgba(10, 10, 15, 0.6)',
    lineHeight: 15,
    marginRight: 6,
  },
  radialContainer: {
    alignSelf: 'flex-start',
  },
  donutCard: {
    backgroundColor: BRAND_COLORS.CHARCOAL_CARD,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  donutTextSide: {
    flex: 1,
    gap: 12,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: '#A5A5AF',
  },
  legendMetric: {
    color: '#FFFFFF',
    fontFamily: FONTS.digital,
  },
  donutChartSide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  startWorkoutSection: {
    gap: 12,
    marginTop: 6,
  },
  startWorkoutTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    color: '#FFFFFF',
  },
  quickStartRoutineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickStartLeft: {
    gap: 4,
  },
  quickStartRoutineName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  quickStartRoutineDuration: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#8E8E93',
  },
  playButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================
  // Active Timer Screen Styles ("Your Workout")
  // ============================================
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
  },
  workoutHeaderTitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    color: '#FFFFFF',
  },
  workoutHeaderSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#8E8E93',
    marginTop: 2,
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
    paddingBottom: 200,
  },
  exerciseCardWrapper: {
    marginBottom: 12,
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
    bottom: Platform.OS === 'ios' ? 100 : 92, // Sits beautifully above the wavy floating dock
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
  digitalTimer: {
    fontSize: 34,
    fontFamily: FONTS.digital,
    color: '#0A0A0F',
    letterSpacing: -1,
  },
});
