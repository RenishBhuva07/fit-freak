import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { Exercise, MuscleGroup } from '@/types/data';
import { MUSCLE_GROUPS, FONTS, MUSCLE_GROUP_COLORS, BRAND_COLORS } from '@/constants';
import { ExerciseCard } from '@/components/ExerciseCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export default function ExercisesScreen() {
  const { colors, isDark } = useTheme();
  const {
    exercisesByGroup,
    loading,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    addExercise,
    updateExercise,
    deleteExercise,
  } = useExercises();

  const { width: screenWidth } = useWindowDimensions();
  const searchProgress = useSharedValue(0);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const toggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextState = !isSearchActive;
    setIsSearchActive(nextState);
    if (!nextState) {
      setSearchQuery('');
    }
  };

  useEffect(() => {
    searchProgress.value = withTiming(isSearchActive ? 1 : 0, { duration: 300 });
  }, [isSearchActive]);

  const animatedSearchStyle = useAnimatedStyle(() => {
    const width = interpolate(searchProgress.value, [0, 1], [0, screenWidth - 40]);
    const height = interpolate(searchProgress.value, [0, 1], [0, 48]);
    const opacity = interpolate(searchProgress.value, [0, 0.3, 1], [0, 0, 1]);
    const marginTop = interpolate(searchProgress.value, [0, 1], [0, 4]);
    const marginBottom = interpolate(searchProgress.value, [0, 1], [0, 8]);
    const paddingHorizontal = interpolate(searchProgress.value, [0, 1], [0, 16]);
    const borderWidth = interpolate(searchProgress.value, [0, 1], [0, 1]);

    return {
      width,
      height,
      opacity,
      marginTop,
      marginBottom,
      paddingHorizontal,
      borderWidth,
    };
  });

  const addSheetRef = useRef<BottomSheetModal>(null);
  const editSheetRef = useRef<BottomSheetModal>(null);
  const editExerciseId = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string>('');
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('12');
  const [restSeconds, setRestSeconds] = useState('90');
  const [notes, setNotes] = useState('');

  const sections = Object.entries(exercisesByGroup).map(([group, exs]) => ({
    title: group as string,
    data: exs,
  }));

  const handleDelete = (exercise: Exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExercise(exercise.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleEdit = (exercise: Exercise) => {
    editExerciseId.current = exercise.id;
    setName(exercise.name);
    setMuscleGroup(exercise.muscleGroup);
    setSets(String(exercise.sets));
    setReps(String(exercise.reps));
    setRestSeconds(String(exercise.restSeconds));
    setNotes(exercise.notes || '');
    editSheetRef.current?.present();
  };

  const resetForm = () => {
    setName('');
    setMuscleGroup('');
    setSets('4');
    setReps('12');
    setRestSeconds('90');
    setNotes('');
  };

  const handleAddExercise = async () => {
    if (!name.trim() || !muscleGroup) {
      Alert.alert('Missing Fields', 'Please enter exercise name and select muscle group');
      return;
    }

    await addExercise(
      name.trim(),
      muscleGroup as any,
      parseInt(sets) || 4,
      parseInt(reps) || 12,
      parseInt(restSeconds) || 90,
      notes.trim() || undefined
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSheetRef.current?.close();
    resetForm();
  };

  const handleUpdateExercise = async () => {
    if (!name.trim() || !muscleGroup || !editExerciseId.current) return;

    await updateExercise(editExerciseId.current, {
      name: name.trim(),
      muscleGroup: muscleGroup as any,
      sets: parseInt(sets) || 4,
      reps: parseInt(reps) || 12,
      restSeconds: parseInt(restSeconds) || 90,
      notes: notes.trim() || undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    editSheetRef.current?.close();
    resetForm();
    editExerciseId.current = null;
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => {
    if (selectedMuscleGroup !== null) {
      return null;
    }
    const sectionColor = MUSCLE_GROUP_COLORS[section.title as MuscleGroup] || colors.accent;
    return (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: isDark
              ? BRAND_COLORS.RICH_BLACK
              : '#ffffff',
            borderBottomColor: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.04)',
          },
        ]}
      >
        <View style={styles.sectionHeaderLeft}>
          <LinearGradient
            colors={[sectionColor, `${sectionColor}99`]}
            style={styles.sectionColorBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
            {section.title}
          </Text>
        </View>
        <View
          style={[
            styles.sectionCount,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.sectionCountText, { color: colors.textSecondary }]}>
            {sections.find((s) => s.title === section.title)?.data.length || 0}
          </Text>
        </View>
      </View>
    );
  };

  const renderExercise = ({ item, index }: { item: Exercise; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
      <View style={styles.exerciseRow}>
        <ExerciseCard
          exercise={item}
          onPress={() => handleEdit(item)}
          showBadge={false}
          reserveActionSpace={false}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      </View>
    </Animated.View>
  );

  return (
    <GradientBackground>
      <View style={[styles.container, { backgroundColor: isDark ? BRAND_COLORS.RICH_BLACK : '#ffffff' }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* 1. Header (Compact vertical spacing) */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Exercises</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleSearch}
              style={[
                styles.headerIconButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              activeOpacity={0.7}
            >
              <Search size={20} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>

        {/* 2. Compact Search Input */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(255, 255, 255, 0.75)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
            },
            animatedSearchStyle,
          ]}
        >
          <Search size={18} color={colors.textTertiary} strokeWidth={2.5} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={isSearchActive}
          />
        </Animated.View>

        {/* 3. Sleek Single-row Horizontal Capsule Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
            style={styles.filtersScrollView}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: !selectedMuscleGroup ? colors.accent : 'transparent',
                  borderColor: colors.accent,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedMuscleGroup(null);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: !selectedMuscleGroup ? (!isDark ? '#FFFFFF' : '#0A0A0F') : colors.accent },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {MUSCLE_GROUPS.map((group) => {
              const muscleColor = MUSCLE_GROUP_COLORS[group] || colors.accent;
              const isSelected = selectedMuscleGroup === group;

              // Dynamically get unselected text/border color for readability
              const getUnselectedTextColor = (hex: string) => {
                if (isDark) return hex;
                const cleaned = hex.replace('#', '');
                let r = parseInt(cleaned.substr(0, 2), 16);
                let g = parseInt(cleaned.substr(2, 2), 16);
                let b = parseInt(cleaned.substr(4, 2), 16);
                const luminance = 0.2126 * (r/255) + 0.7152 * (g/255) + 0.0722 * (b/255);
                if (luminance > 0.6) {
                  r = Math.max(0, Math.floor(r * 0.55));
                  g = Math.max(0, Math.floor(g * 0.55));
                  b = Math.max(0, Math.floor(b * 0.55));
                  return `rgb(${r}, ${g}, ${b})`;
                }
                return hex;
              };

              const activeColor = muscleColor;
              const unselectedColor = getUnselectedTextColor(muscleColor);

              return (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? activeColor : 'transparent',
                      borderColor: unselectedColor,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? '#0A0A0F' : unselectedColor },
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Section List with sticky glass headers */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />

        <FloatingActionButton onPress={() => addSheetRef.current?.present()} />

        {/* Add Exercise Bottom Sheet */}
        <BottomSheetModal
          ref={addSheetRef}
          snapPoints={['80%']}
          backgroundStyle={{
            backgroundColor: isDark ? BRAND_COLORS.RICH_BLACK : '#ffffff',
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Exercise</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              placeholder="Exercise name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Muscle Group
            </Text>
            <View style={styles.chipScroll}>
              {MUSCLE_GROUPS.map((group) => {
                const muscleColor = MUSCLE_GROUP_COLORS[group as MuscleGroup] || colors.accent;
                const isSelected = muscleGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? muscleColor
                          : isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isSelected
                          ? muscleColor
                          : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    ]}
                    onPress={() => setMuscleGroup(group)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#0A0A0F' : colors.text },
                      ]}
                    >
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sets</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="4"
                  placeholderTextColor={colors.textTertiary}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Reps</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="12"
                  placeholderTextColor={colors.textTertiary}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Rest (s)
                </Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="90"
                  placeholderTextColor={colors.textTertiary}
                  value={restSeconds}
                  onChangeText={setRestSeconds}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TextInput
              style={[
                styles.input,
                styles.inputLarge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleAddExercise}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent, '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Add Exercise</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Edit Exercise Bottom Sheet */}
        <BottomSheetModal
          ref={editSheetRef}
          snapPoints={['80%']}
          backgroundStyle={{
            backgroundColor: isDark ? BRAND_COLORS.RICH_BLACK : '#ffffff',
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Edit Exercise
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              placeholder="Exercise name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Muscle Group
            </Text>
            <View style={styles.chipScroll}>
              {MUSCLE_GROUPS.map((group) => {
                const muscleColor = MUSCLE_GROUP_COLORS[group as MuscleGroup] || colors.accent;
                const isSelected = muscleGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? muscleColor
                          : isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isSelected
                          ? muscleColor
                          : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.04)',
                      },
                    ]}
                    onPress={() => setMuscleGroup(group)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#0A0A0F' : colors.text },
                      ]}
                    >
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sets</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="4"
                  placeholderTextColor={colors.textTertiary}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Reps</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="12"
                  placeholderTextColor={colors.textTertiary}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Rest (s)
                </Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.02)',
                      color: colors.text,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  placeholder="90"
                  placeholderTextColor={colors.textTertiary}
                  value={restSeconds}
                  onChangeText={setRestSeconds}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TextInput
              style={[
                styles.input,
                styles.inputLarge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.02)',
                  color: colors.text,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              ]}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleUpdateExercise}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent, '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Update Exercise</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>
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
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 12,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  filtersContainer: {
    marginBottom: 6,
  },
  filtersScrollView: {
    marginBottom: 10,
    marginTop: 4,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionColorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontFamily: FONTS.display,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionCount: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionCountText: {
    fontSize: 11,
    fontFamily: FONTS.digital,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 130,
  },
  exerciseRow: {
    position: 'relative',
    paddingHorizontal: 20,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 24,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 24,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginBottom: 12,
    borderWidth: 1,
  },
  inputLarge: {
    height: 90,
    textAlignVertical: 'top',
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 15,
    fontFamily: FONTS.digital,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  submitButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

