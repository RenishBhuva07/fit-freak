import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Bell, ArrowUpRight, Dumbbell, Grid3X3, Award, TrendingUp, Zap } from 'lucide-react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { useStreak } from '@/hooks/useStreak';
import { GradientBackground } from '@/components/GradientBackground';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@/navigators/TabNavigator';
import { BRAND_COLORS, FONTS } from '@/constants';

const { width } = Dimensions.get('window');
type NavigationProp = BottomTabNavigationProp<TabParamList>;

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Fetch reactive data
  const { exercises } = useExercises();
  const { groups, getGroupExercises, getGroupEstimatedDuration } = useGroups(exercises);
  const { streakMeta, getStats } = useStreak();
  const { getProgress } = useToday(exercises, groups);

  const stats = getStats();
  const progress = getProgress();
  const [activePlanFilter, setActivePlanFilter] = useState<'All' | 'Lower Body' | 'Upper Body'>('All');

  const handleQuickNav = (tabName: keyof TabParamList) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(tabName);
  };

  // Extract muscles list from exercises in a group
  const getGroupMusclesString = (groupExerciseIds: string[]) => {
    const muscleGroupsSet = new Set<string>();
    groupExerciseIds.forEach((id) => {
      const ex = exercises.find((e) => e.id === id);
      if (ex) muscleGroupsSet.add(ex.muscleGroup);
    });
    const list = Array.from(muscleGroupsSet);
    if (list.length === 0) return 'Cardio / General';
    return list.slice(0, 3).join(' / ');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header HI JAMES (Screen 2 Reference) */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View style={styles.profileRow}>
              {/* Custom SVG Avatar */}
              <View style={styles.avatarContainer}>
                <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <Circle cx="20" cy="20" r="20" fill="#E2D2FF" />
                  <Path d="M20,10 C22.76,10 25,12.24 25,15 C25,17.76 22.76,20 20,20 C17.24,20 15,17.76 15,15 C15,12.24 17.24,10 20,10 Z" fill="#0A0A0F" />
                  <Path d="M10,32 C10,26.48 14.48,22 20,22 C25.52,22 30,26.48 30,32" fill="none" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
              </View>

              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerGreeting}>HI JAMES</Text>
                <View style={styles.subGreetingRow}>
                  <Zap size={10} color={BRAND_COLORS.NEON_LIME} fill={BRAND_COLORS.NEON_LIME} />
                  <Text style={styles.headerSub}>Fitness Freak</Text>
                </View>
              </View>
            </View>

            {/* Notification Bell Circle */}
            <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
              <Bell size={18} color="#FFFFFF" strokeWidth={2.5} />
              <View style={styles.activeNotificationDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* Progress Card (Lime Green Progress Panel) */}
          <Animated.View entering={ZoomIn.delay(100).duration(500)}>
            <View style={styles.progressCard}>
              {/* Concentric Progress Circle SVG in top right */}
              <View style={styles.progressCircleContainer}>
                <Svg width="56" height="56" viewBox="0 0 36 36">
                  <Circle cx="18" cy="18" r="14" fill="none" stroke="rgba(10, 10, 15, 0.08)" strokeWidth="3.5" />
                  <Circle 
                    cx="18" 
                    cy="18" 
                    r="14" 
                    fill="none" 
                    stroke="#0A0A0F" 
                    strokeWidth="3.5" 
                    strokeDasharray="88" 
                    strokeDashoffset={88 - (88 * 72) / 100} // 72%
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <SvgText 
                    x="18" 
                    y="20.5" 
                    fontSize="7" 
                    fontFamily={FONTS.digital} 
                    fontWeight="900" 
                    fill="#0A0A0F" 
                    textAnchor="middle"
                  >
                    72%
                  </SvgText>
                </Svg>
              </View>

              {/* Progress details */}
              <View style={styles.progressTextSection}>
                <Text style={styles.progressMetaTitle}>Progress</Text>
                <Text style={styles.progressWorkoutTitle}>Lower Body</Text>
                <Text style={styles.progressWorkoutSubtitle}>Cardio  10 mins</Text>
              </View>

              {/* Calories Pill & Silhouette graphic overlay in SVG */}
              <View style={styles.progressFooter}>
                <View style={styles.caloriesPill}>
                  <Text style={styles.caloriesText}>538</Text>
                  <Text style={styles.caloriesUnit}>CALORIES</Text>
                </View>
                <View style={styles.arrowIconContainer}>
                  <ArrowUpRight size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* SVG Cutout body builder background illustration */}
              <View style={styles.trainerIllustrationContainer} pointerEvents="none">
                <Svg width="90" height="110" viewBox="0 0 24 24" fill="none">
                  <G opacity="0.12">
                    {/* Stylized muscles outlines */}
                    <Path d="M12,4 L15,7 L14,10 L10,10 L9,7 Z" fill="#000" />
                    <Path d="M4,9 C4,9 6,6 9,7 C9,7 11,8 12,8 C13,8 15,7 15,7 C18,6 20,9 20,9 L21,12 L17,14 L15,11 L9,11 L7,14 L3,12 Z" fill="#000" />
                    <Path d="M9,11 L15,11 L16,16 L12,20 L8,16 Z" fill="#000" />
                  </G>
                </Svg>
              </View>
            </View>
          </Animated.View>

          {/* "Your plan" Header & Filter Chips */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.yourPlanHeader}>
            <Text style={styles.planSectionTitle}>Your plan</Text>
            
            <View style={styles.planChipsRow}>
              {(['All workouts', 'Lower body', 'Upper body'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.planFilterChip,
                    (activePlanFilter === 'All' && filter === 'All workouts') ||
                    (activePlanFilter === 'Lower Body' && filter === 'Lower body') ||
                    (activePlanFilter === 'Upper Body' && filter === 'Upper body')
                      ? { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' }
                      : { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.1)' }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (filter === 'All workouts') setActivePlanFilter('All');
                    else if (filter === 'Lower body') setActivePlanFilter('Lower Body');
                    else setActivePlanFilter('Upper Body');
                  }}
                >
                  <Text style={[
                    styles.planChipText,
                    (activePlanFilter === 'All' && filter === 'All workouts') ||
                    (activePlanFilter === 'Lower Body' && filter === 'Lower body') ||
                    (activePlanFilter === 'Upper Body' && filter === 'Upper body')
                      ? { color: '#0A0A0F', fontWeight: '700' }
                      : { color: '#8E8E93' }
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Workout Routine list cards (Dynamic Routine Generation) */}
          <View style={styles.routinesList}>
            {groups.length === 0 ? (
              // Default Fallback Routines matching exact reference styling if user hasn't added groups yet
              <>
                <Animated.View entering={FadeInDown.delay(250).duration(450)}>
                  <TouchableOpacity 
                    style={[styles.routineCard, { backgroundColor: BRAND_COLORS.POWDER_BLUE }]}
                    onPress={() => handleQuickNav('Today')}
                  >
                    <View style={styles.routineTimeBadge}>
                      <Text style={styles.routineTimeBadgeText}>30 mins</Text>
                    </View>

                    <View style={styles.routineIllustration} pointerEvents="none">
                      <Svg width="76" height="76" viewBox="0 0 24 24" fill="none">
                        <Circle cx="12" cy="5" r="2.5" fill="#0A0A0F" opacity="0.3" />
                        <Path d="M7,10 L12,13 L17,10 M12,13 L12,18 L9,22 M12,18 L15,22" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                      </Svg>
                    </View>

                    <View style={styles.routineDetailsContainer}>
                      <Text style={styles.routineName}>Lower body workout</Text>
                      
                      <View style={styles.routineTagsRow}>
                        <View style={styles.routineBadgeTag}>
                          <Text style={styles.routineBadgeText}>Cardio</Text>
                        </View>
                        <View style={styles.routineBadgeTag}>
                          <Text style={styles.routineBadgeText}>5 exercises</Text>
                        </View>
                      </View>
                      
                      <View style={styles.musclesSummaryPill}>
                        <Text style={styles.musclesSummaryText}>
                          Glutes / Squads / Hamstrings
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(450)}>
                  <TouchableOpacity 
                    style={[styles.routineCard, { backgroundColor: '#E6CFFF' }]}
                    onPress={() => handleQuickNav('Today')}
                  >
                    <View style={styles.routineTimeBadge}>
                      <Text style={styles.routineTimeBadgeText}>20 mins</Text>
                    </View>

                    <View style={styles.routineIllustration} pointerEvents="none">
                      <Svg width="76" height="76" viewBox="0 0 24 24" fill="none">
                        <Circle cx="12" cy="5" r="2.5" fill="#0A0A0F" opacity="0.3" />
                        <Path d="M5,12 L12,9 L19,12 M12,9 L12,19 L7,22 M12,19 L17,22" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
                      </Svg>
                    </View>

                    <View style={styles.routineDetailsContainer}>
                      <Text style={styles.routineName}>Upper body workout</Text>
                      
                      <View style={styles.routineTagsRow}>
                        <View style={styles.routineBadgeTag}>
                          <Text style={styles.routineBadgeText}>Strength</Text>
                        </View>
                        <View style={styles.routineBadgeTag}>
                          <Text style={styles.routineBadgeText}>6 exercises</Text>
                        </View>
                      </View>
                      
                      <View style={styles.musclesSummaryPill}>
                        <Text style={styles.musclesSummaryText}>
                          Chest / Back / Shoulders
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </>
            ) : (
              // Dynamic Workout Routines styled with premium cards
              groups
                .filter((g) => {
                  const label = g.name.toLowerCase();
                  if (activePlanFilter === 'Lower Body') return label.includes('lower') || label.includes('leg');
                  if (activePlanFilter === 'Upper Body') return label.includes('upper') || label.includes('chest') || label.includes('back') || label.includes('arm');
                  return true;
                })
                .map((group, index) => {
                  const groupExs = getGroupExercises(group.id);
                  const duration = getGroupEstimatedDuration(group.id);
                  const musclesList = getGroupMusclesString(group.exerciseIds);
                  const isEven = index % 2 === 0;

                  return (
                    <Animated.View key={group.id} entering={FadeInDown.delay(index * 80 + 200).duration(450)}>
                      <TouchableOpacity
                        style={[
                          styles.routineCard,
                          { backgroundColor: isEven ? BRAND_COLORS.POWDER_BLUE : '#E6CFFF' }
                        ]}
                        onPress={() => handleQuickNav('Today')}
                        activeOpacity={0.9}
                      >
                        <View style={styles.routineTimeBadge}>
                          <Text style={styles.routineTimeBadgeText}>{duration} mins</Text>
                        </View>

                        <View style={styles.routineIllustration} pointerEvents="none">
                          <Svg width="76" height="76" viewBox="0 0 24 24" fill="none">
                            <Circle cx="12" cy="5" r="2.5" fill="#0A0A0F" opacity="0.25" />
                            <Path 
                              d="M6,10 L12,12 L18,10 M12,12 L12,18 L8,22 M12,18 L16,22" 
                              stroke="#0A0A0F" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              opacity="0.25" 
                            />
                          </Svg>
                        </View>

                        <View style={styles.routineDetailsContainer}>
                          <Text style={styles.routineName}>{group.name}</Text>
                          
                          <View style={styles.routineTagsRow}>
                            <View style={styles.routineBadgeTag}>
                              <Text style={styles.routineBadgeText}>Workout</Text>
                            </View>
                            <View style={styles.routineBadgeTag}>
                              <Text style={styles.routineBadgeText}>{groupExs.length} exercises</Text>
                            </View>
                          </View>
                          
                          <View style={styles.musclesSummaryPill}>
                            <Text style={styles.musclesSummaryText}>
                              {musclesList}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerTitleContainer: {
    gap: 2,
  },
  headerGreeting: {
    fontSize: 16,
    fontFamily: 'Syne-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  subGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Medium',
    fontWeight: '600',
    color: '#8E8E93',
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeNotificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
  },
  progressCard: {
    backgroundColor: BRAND_COLORS.NEON_LIME,
    borderRadius: 28,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
    minHeight: 168,
    shadowColor: BRAND_COLORS.NEON_LIME,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  progressCircleContainer: {
    position: 'absolute',
    top: 18,
    right: 18,
  },
  progressTextSection: {
    gap: 4,
    marginTop: 8,
  },
  progressMetaTitle: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Medium',
    fontWeight: '600',
    color: 'rgba(10, 10, 15, 0.6)',
  },
  progressWorkoutTitle: {
    fontSize: 24,
    fontFamily: 'Syne-Bold',
    fontWeight: '800',
    color: '#0A0A0F',
    letterSpacing: -0.5,
  },
  progressWorkoutSubtitle: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Medium',
    fontWeight: '600',
    color: 'rgba(10, 10, 15, 0.6)',
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    zIndex: 3,
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#0A0A0F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 4,
  },
  caloriesText: {
    fontSize: 14,
    fontFamily: 'Orbitron-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
  },
  caloriesUnit: {
    fontSize: 9,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    color: BRAND_COLORS.NEON_LIME,
  },
  arrowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerIllustrationContainer: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    zIndex: 1,
  },
  yourPlanHeader: {
    gap: 14,
    marginBottom: 20,
  },
  planSectionTitle: {
    fontSize: 20,
    fontFamily: 'Syne-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  planFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  planChipText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '600',
  },
  routinesList: {
    gap: 16,
  },
  routineCard: {
    borderRadius: 28,
    padding: 22,
    minHeight: 154,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  routineTimeBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  routineTimeBadgeText: {
    fontSize: 11,
    fontFamily: 'Orbitron-Bold',
    fontWeight: '800',
    color: '#0A0A0F',
  },
  routineIllustration: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  routineDetailsContainer: {
    gap: 8,
    zIndex: 2,
  },
  routineName: {
    fontSize: 20,
    fontFamily: 'Syne-Bold',
    fontWeight: '800',
    color: '#0A0A0F',
    letterSpacing: -0.3,
  },
  routineTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  routineBadgeTag: {
    backgroundColor: 'rgba(10, 10, 15, 0.04)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  routineBadgeText: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Medium',
    fontWeight: '600',
    color: 'rgba(10, 10, 15, 0.7)',
  },
  musclesSummaryPill: {
    backgroundColor: 'rgba(10, 10, 15, 0.07)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  musclesSummaryText: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Bold',
    fontWeight: '700',
    color: '#0A0A0F',
  },
});
