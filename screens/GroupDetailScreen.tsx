import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Clock,
  Dumbbell,
  Play,
  Plus,
  Trash2,
  Edit2,
  Trophy,
  Calendar,
  Flame,
  Zap,
  Star,
  Heart,
  Activity,
  CheckCircle,
} from 'lucide-react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { DayOfWeek, Exercise, WorkoutGroup } from '@/types/data';
import { DAYS_OF_WEEK, MUSCLE_GROUPS, BRAND_COLORS, FONTS } from '@/constants';
import { GradientBackground } from '@/components/GradientBackground';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function GroupDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const { groupId } = route.params;

  const { exercises, loading: exercisesLoading } = useExercises();
  const {
    groups,
    loading: groupsLoading,
    updateGroup,
    deleteGroup,
    getGroupExercises,
    getGroupEstimatedDuration,
  } = useGroups(exercises);

  const { startWorkout } = useToday(exercises, groups);

  const pickerSheetRef = useRef<BottomSheetModal>(null);

  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');

  const group = groups.find((g) => g.id === groupId);

  // Sync selected exercise IDs when group loads
  useEffect(() => {
    if (group) {
      setSelectedExerciseIds(group.exerciseIds);
    }
  }, [group]);

  if (groupsLoading || exercisesLoading) {
    return (
      <GradientBackground>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading routine details...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  if (!group) {
    return (
      <GradientBackground>
        <View style={styles.centerContent}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Routine Not Found
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.accent }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: FONTS.bold }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  const groupExercises = getGroupExercises(group.id);
  const duration = getGroupEstimatedDuration(group.id);

  // Map background watermark icon based on group id/name
  const renderBackgroundIcon = () => {
    const iconSize = 130;
    const iconColor = 'rgba(10, 10, 15, 0.05)'; // Subtle dark watermark for pastels
    const normalizedId = group.id.toLowerCase();

    let IconComponent = Activity;

    if (normalizedId.includes('mon')) IconComponent = Dumbbell;
    else if (normalizedId.includes('tue')) IconComponent = Trophy;
    else if (normalizedId.includes('wed')) IconComponent = Calendar;
    else if (normalizedId.includes('thu')) IconComponent = Flame;
    else if (normalizedId.includes('fri')) IconComponent = Zap;
    else if (normalizedId.includes('sat')) IconComponent = Star;
    else if (normalizedId.includes('sun')) IconComponent = Heart;
    else if (normalizedId.includes('all-days')) IconComponent = Activity;

    return (
      <View style={styles.backgroundIcon} pointerEvents="none">
        <IconComponent size={iconSize} color={iconColor} strokeWidth={1.4} />
      </View>
    );
  };

  const handleStartWorkout = async () => {
    if (group.exerciseIds.length === 0) {
      Alert.alert(
        group.name,
        "Please add some exercises to this group first before starting the workout!"
      );
      return;
    }

    await startWorkout(group.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('ActiveWorkout');
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGroup(group.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleSaveExercises = async () => {
    await updateGroup(group.id, {
      exerciseIds: selectedExerciseIds,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    pickerSheetRef.current?.close();
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Back and Page Header Action Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backIconButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Routine</Text>
          <TouchableOpacity
            style={[
              styles.backIconButton,
              {
                backgroundColor: `${colors.error}15`,
              },
            ]}
            onPress={handleDeleteGroup}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Aesthetic Big Header Card */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[
              styles.bannerCard,
              {
                backgroundColor: group.color,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            ]}
          >
            {renderBackgroundIcon()}

            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {group.name}
              </Text>
              <View style={styles.daysRow}>
                {group.days.map((day) => (
                  <View key={day} style={styles.dayBadge}>
                    <Text style={styles.dayText}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Stats Boxes */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.statsRow}
          >
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
            >
              <Dumbbell size={20} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {group.exerciseIds.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Exercises
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
            >
              <Clock size={20} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {duration} min
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Est. Duration
              </Text>
            </View>
          </Animated.View>

          {/* Exercises Header with Add Button */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(400)}
            style={styles.sectionHeader}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Exercises List
            </Text>
            <TouchableOpacity
              style={[
                styles.addExerciseBtn,
                {
                  borderColor: colors.accent,
                },
              ]}
              onPress={() => pickerSheetRef.current?.present()}
              activeOpacity={0.75}
            >
              <Plus size={16} color={colors.accent} strokeWidth={3} />
              <Text style={[styles.addExerciseText, { color: colors.accent }]}>
                Add Exercises
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Exercises List Display */}
          {groupExercises.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200).duration(450)}
              style={[
                styles.emptyBox,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No exercises in this workout group yet.
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: colors.accent }]}
                onPress={() => pickerSheetRef.current?.present()}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.emptyAddBtnText}>Add First Exercise</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.exerciseListContainer}>
              {groupExercises.map((ex, index) => (
                <Animated.View
                  key={ex.id}
                  entering={FadeInDown.delay(200 + index * 50).duration(400)}
                  style={[
                    styles.exerciseItemCard,
                    {
                      backgroundColor: isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff',
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                >
                  <View style={[styles.indexBadge, { backgroundColor: `${group.color}25` }]}>
                    <Text
                      style={[
                        styles.indexText,
                        {
                          color:
                            group.color === BRAND_COLORS.NEON_LIME && !isDark
                              ? '#556600'
                              : colors.text,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.exerciseInfo}>
                    <Text style={[styles.exerciseName, { color: colors.text }]} numberOfLines={1}>
                      {ex.name}
                    </Text>
                    <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>
                      {ex.muscleGroup}
                    </Text>
                  </View>

                  <View style={[styles.setsBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                    <Text style={[styles.setsText, { color: colors.textSecondary }]}>
                      {ex.sets} × {ex.reps}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}

          {/* Primary Start Workout Action Button */}
          {groupExercises.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(250).duration(400)}
              style={styles.startBtnWrapper}
            >
              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStartWorkout}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    group.color === BRAND_COLORS.NEON_LIME
                      ? [BRAND_COLORS.NEON_LIME, '#cFFF04']
                      : [colors.accent, '#764ba2']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Play
                    size={20}
                    color={group.color === BRAND_COLORS.NEON_LIME ? '#0A0A0F' : '#FFFFFF'}
                    fill={group.color === BRAND_COLORS.NEON_LIME ? '#0A0A0F' : '#FFFFFF'}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.startBtnText,
                      {
                        color:
                          group.color === BRAND_COLORS.NEON_LIME ? '#0A0A0F' : '#FFFFFF',
                      },
                    ]}
                  >
                    Start Workout Session
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>

        {/* Dynamic Exercise Picker Bottom Sheet Modal */}
        <BottomSheetModal
          ref={pickerSheetRef}
          snapPoints={['75%']}
          backgroundStyle={{
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Manage Exercises
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                Toggle exercises in {group.name}
              </Text>
            </View>

            {MUSCLE_GROUPS.map((groupName) => {
              const groupExs = exercises.filter((ex) => ex.muscleGroup === groupName);
              if (groupExs.length === 0) return null;
              return (
                <View key={groupName} style={styles.pickerMuscleGroup}>
                  <Text style={[styles.pickerMuscleName, { color: colors.text }]}>
                    {groupName}
                  </Text>
                  <View style={styles.pickerChipsRow}>
                    {groupExs.map((ex) => {
                      const isSelected = selectedExerciseIds.includes(ex.id);
                      return (
                        <TouchableOpacity
                          key={ex.id}
                          style={[
                            styles.pickerChip,
                            {
                              backgroundColor: isSelected
                                ? colors.accentLight
                                : isDark
                                  ? 'rgba(255, 255, 255, 0.06)'
                                  : 'rgba(0, 0, 0, 0.03)',
                              borderColor: isSelected
                                ? colors.accent
                                : isDark
                                  ? 'rgba(255, 255, 255, 0.1)'
                                  : 'rgba(0, 0, 0, 0.06)',
                            },
                          ]}
                          onPress={() => toggleExercise(ex.id)}
                          activeOpacity={0.7}
                        >
                          {isSelected && (
                            <CheckCircle size={14} color={colors.accent} style={{ marginRight: 6 }} />
                          )}
                          <Text
                            style={[
                              styles.pickerChipText,
                              {
                                color: isSelected ? colors.accent : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Bottom Sheet Actions */}
            <View style={styles.sheetActionsRow}>
              <TouchableOpacity
                style={[
                  styles.sheetActionCancelBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                  },
                ]}
                onPress={() => pickerSheetRef.current?.close()}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetCancelBtnText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetActionSaveBtnContainer}
                onPress={handleSaveExercises}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.accent, '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sheetActionSaveBtn}
                >
                  <Text style={styles.sheetSaveBtnText}>Save Selection</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingBottom: 12,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.display,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 60,
  },
  bannerCard: {
    height: 154,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    opacity: 0.9,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
  bannerContent: {
    padding: 24,
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 26,
    fontFamily: FONTS.display,
    fontWeight: '800',
    color: '#0A0A0F',
    letterSpacing: -0.6,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 10, 15, 0.08)',
  },
  dayText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONTS.digital,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 4,
  },
  addExerciseText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 32,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  exerciseListContainer: {
    gap: 12,
    marginBottom: 30,
  },
  exerciseItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 14,
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 2,
  },
  exerciseMuscle: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  setsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  setsText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  startBtnWrapper: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BRAND_COLORS.NEON_LIME,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  startBtn: {
    width: '100%',
  },
  startGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontFamily: FONTS.display,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  sheetScroll: {
    flex: 1,
  },
  pickerMuscleGroup: {
    marginBottom: 20,
  },
  pickerMuscleName: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  pickerChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerChipText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sheetActionCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  sheetActionSaveBtnContainer: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sheetActionSaveBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
