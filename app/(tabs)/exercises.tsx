import { useState, useCallback } from 'react';
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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, Filter, Trash2, Edit2, X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/data';
import { MUSCLE_GROUPS } from '@/constants';
import { ExerciseCard } from '@/components/ExerciseCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

  const addSheetRef = useRef<BottomSheetModal>(null);
  const editSheetRef = useRef<BottomSheetModal>(null);
  const editExerciseId = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string>('');
  const [sets, setSets] = useState('4');
  const [reps, setReps] = useState('12');
  const [restSeconds, setRestSeconds] = useState('90');
  const [notes, setNotes] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(255, 255, 255, 0.4)',
          },
        ]}
      >
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
          {section.title}
        </Text>
        <View
          style={[
            styles.sectionCount,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Text style={[styles.sectionCountText, { color: colors.textSecondary }]}>
            {(sections.find(s => s.title === section.title)?.data.length || 0)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderExercise = ({ item, index }: { item: Exercise; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <View style={styles.exerciseRow}>
        <ExerciseCard exercise={item} onPress={() => handleEdit(item)} />
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <Edit2 size={16} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: `${colors.error}15` },
            ]}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Exercises</Text>
          <ThemeToggle />
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(255, 255, 255, 0.6)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.5)',
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedMuscleGroup && {
                backgroundColor: `${colors.accent}20`,
              },
            ]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Filter
              size={18}
              color={selectedMuscleGroup ? colors.accent : colors.textTertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View
              style={[
                styles.filtersContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: !selectedMuscleGroup ? colors.accent : 'transparent',
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => setSelectedMuscleGroup(null)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: !selectedMuscleGroup ? '#FFFFFF' : colors.accent },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        selectedMuscleGroup === group ? colors.accent : 'transparent',
                      borderColor: colors.accent,
                    },
                  ]}
                  onPress={() =>
                    setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group)
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: selectedMuscleGroup === group ? '#FFFFFF' : colors.accent },
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

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
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Exercise</Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: colors.text,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.08)',
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
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        muscleGroup === group
                          ? colors.accent
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.03)',
                      borderColor:
                        muscleGroup === group
                          ? colors.accent
                          : isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  onPress={() => setMuscleGroup(group)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: muscleGroup === group ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sets</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: colors.text,
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
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          }}
          handleIndicatorStyle={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
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
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: colors.text,
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
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        muscleGroup === group
                          ? colors.accent
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.03)',
                      borderColor:
                        muscleGroup === group
                          ? colors.accent
                          : isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                  onPress={() => setMuscleGroup(group)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: muscleGroup === group ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Sets</Text>
                <TextInput
                  style={[
                    styles.inputSmall,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.03)',
                      color: colors.text,
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
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                  color: colors.text,
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
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
    borderRadius: 10,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 120,
  },
  exerciseRow: {
    position: 'relative',
    paddingHorizontal: 20,
  },
  exerciseActions: {
    position: 'absolute',
    right: 36,
    top: 12,
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 15,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
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
    marginTop: 20,
  },
  submitButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
