import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Trash2, Edit2, Plus, Clock, Dumbbell, Play } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useExercises } from '@/hooks/useExercises';
import { useGroups } from '@/hooks/useGroups';
import { useToday } from '@/hooks/useToday';
import { useNavigation } from '@react-navigation/native';
import { DayOfWeek, Exercise, WorkoutGroup } from '@/types/data';
import { DAYS_OF_WEEK, MUSCLE_GROUPS, GROUP_COLORS, BRAND_COLORS, FONTS } from '@/constants';
import { GroupCard } from '@/components/GroupCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GradientBackground } from '@/components/GradientBackground';
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function GroupsScreen() {
  const { colors, isDark } = useTheme();

  const getReadableTextColor = (hex: string) => {
    const cleaned = hex.replace('#', '');
    const r = parseInt(cleaned.substr(0, 2), 16) / 255;
    const g = parseInt(cleaned.substr(2, 2), 16) / 255;
    const b = parseInt(cleaned.substr(4, 2), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.75 ? '#0A0A0F' : '#FFFFFF';
  };

  const { exercises, loading: exercisesLoading } = useExercises();
  const {
    groups,
    loading: groupsLoading,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupExercises,
    getGroupEstimatedDuration,
  } = useGroups(exercises);

  const navigation = useNavigation<any>();
  const { startWorkout } = useToday(exercises, groups);

  const addSheetRef = useRef<BottomSheetModal>(null);
  const editSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);

  const editGroupId = useRef<string | null>(null);

  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<WorkoutGroup | null>(null);

  const loading = exercisesLoading || groupsLoading;

  const handleDelete = (group: { id: string; name: string }) => {
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
          },
        },
      ]
    );
  };

  const handleEdit = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    editGroupId.current = groupId;
    setName(group.name);
    setSelectedDays(group.days);
    setSelectedExerciseIds(group.exerciseIds);
    setColor(group.color);
    editSheetRef.current?.present();
  };

  const resetForm = () => {
    setName('');
    setSelectedDays([]);
    setSelectedExerciseIds([]);
    setColor(GROUP_COLORS[0]);
    setShowExercisePicker(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleAddGroup = async () => {
    if (!name.trim() || selectedExerciseIds.length === 0 || selectedDays.length === 0) {
      Alert.alert(
        'Missing Fields',
        'Please enter group name, select exercises, and choose days'
      );
      return;
    }

    await addGroup(name.trim(), selectedExerciseIds, selectedDays, color);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addSheetRef.current?.close();
    resetForm();
  };

  const handleUpdateGroup = async () => {
    if (
      !name.trim() ||
      selectedExerciseIds.length === 0 ||
      selectedDays.length === 0 ||
      !editGroupId.current
    ) {
      return;
    }

    await updateGroup(editGroupId.current, {
      name: name.trim(),
      exerciseIds: selectedExerciseIds,
      days: selectedDays,
      color,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    editSheetRef.current?.close();
    resetForm();
    editGroupId.current = null;
  };

  const formatExercises = (exIds: string[]) => {
    const names = exIds
      .map((id) => exercises.find((ex) => ex.id === id)?.name)
      .filter(Boolean);
    if (names.length <= 3) {
      return names.join(', ');
    }
    return `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
  };

  const handleGroupPress = (group: WorkoutGroup) => {
    navigation.navigate('GroupDetail', { groupId: group.id });
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Groups</Text>
          <ThemeToggle />
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading...
            </Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create a workout group to get started
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gridContainer}>
              {groups.map((group, index) => {
                const groupExercises = getGroupExercises(group.id);
                const duration = getGroupEstimatedDuration(group.id);
                return (
                  <Animated.View
                    key={group.id}
                    entering={FadeInDown.delay(index * 40).duration(400)}
                  >
                    <GroupCard
                      group={group}
                      exercises={groupExercises}
                      estimatedDuration={duration}
                      onPress={() => handleGroupPress(group)}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        )}

        <FloatingActionButton onPress={() => addSheetRef.current?.present()} />

        {/* Add Group Bottom Sheet */}
        <BottomSheetModal
          ref={addSheetRef}
          snapPoints={['85%']}
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
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Create Group
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
              placeholder="Group name (e.g., Chest + Biceps)"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
            <FlatList
              data={GROUP_COLORS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingVertical: 8, paddingRight: 8, alignItems: 'center' }}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorChip,
                    {
                      backgroundColor: c,
                      borderColor: color === c ? '#FFFFFF' : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                      borderWidth: color === c ? 3 : 1.5,
                      shadowColor: '#000',
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                      marginRight: 14,
                    },
                  ]}
                  onPress={() => setColor(c)}
                  activeOpacity={0.7}
                />
              )}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Days</Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: selectedDays.includes(day)
                        ? color
                        : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.03)',
                      borderColor: selectedDays.includes(day)
                        ? color
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.12)',
                    },
                  ]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      {
                        color: selectedDays.includes(day)
                          ? getReadableTextColor(color)
                          : colors.text,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Exercises ({selectedExerciseIds.length})</Text>
            <TouchableOpacity
              style={[
                styles.exercisePickerToggle,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                },
              ]}
              onPress={() => setShowExercisePicker(!showExercisePicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.exercisePickerText, { color: colors.text }]}>
                {selectedExerciseIds.length > 0
                  ? formatExercises(selectedExerciseIds)
                  : 'Select exercises'}
              </Text>
              <Text style={[styles.tapText, { color: colors.accent }]}>Tap to edit</Text>
            </TouchableOpacity>

            {showExercisePicker && (
              <View
                style={[
                  styles.exercisePicker,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                {MUSCLE_GROUPS.map((group) => {
                  const groupExercises = exercises.filter(
                    (ex) => ex.muscleGroup === group
                  );
                  if (groupExercises.length === 0) return null;
                  return (
                    <View key={group} style={styles.muscleGroup}>
                      <Text style={[styles.muscleGroupName, { color: colors.text }]}> {group}</Text>
                      {groupExercises.map((ex) => (
                        <TouchableOpacity
                          key={ex.id}
                          style={[
                            styles.exerciseChip,
                            {
                              backgroundColor: selectedExerciseIds.includes(ex.id)
                                ? colors.accent
                                : isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : 'rgba(0, 0, 0, 0.03)',
                              borderColor: isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.06)',
                            },
                          ]}
                          onPress={() => toggleExercise(ex.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.exerciseChipText,
                              {
                                color: selectedExerciseIds.includes(ex.id)
                                  ? '#FFFFFF'
                                  : colors.text,
                              },
                            ]}
                          >
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleAddGroup}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent, '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Create Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Edit Group Bottom Sheet */}
        <BottomSheetModal
          ref={editSheetRef}
          snapPoints={['85%']}
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
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Edit Group</Text>

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
              placeholder="Group name"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Color</Text>
            <FlatList
              data={GROUP_COLORS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingVertical: 12, paddingRight: 8, alignItems: 'center' }}
              renderItem={({ item: c }) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorChip,
                    {
                      backgroundColor: c,
                      borderColor: color === c ? '#FFFFFF' : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                      borderWidth: color === c ? 3 : 1.5,
                      shadowColor: '#000',
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                      marginRight: 14,
                    },
                  ]}
                  onPress={() => setColor(c)}
                  activeOpacity={0.7}
                />
              )}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Days</Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: selectedDays.includes(day)
                        ? color
                        : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.03)',
                      borderColor: selectedDays.includes(day)
                        ? color
                        : isDark
                          ? 'rgba(255,255,255,0.12)'
                          : 'rgba(0,0,0,0.12)',
                    },
                  ]}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      {
                        color: selectedDays.includes(day)
                          ? getReadableTextColor(color)
                          : colors.text,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Exercises ({selectedExerciseIds.length})
            </Text>
            <TouchableOpacity
              style={[
                styles.exercisePickerToggle,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)',
                },
              ]}
              onPress={() => setShowExercisePicker(!showExercisePicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.exercisePickerText, { color: colors.text }]}>
                {selectedExerciseIds.length > 0
                  ? formatExercises(selectedExerciseIds)
                  : 'Select exercises'}
              </Text>
              <Text style={[styles.tapText, { color: colors.accent }]}>Tap to edit</Text>
            </TouchableOpacity>

            {showExercisePicker && (
              <View
                style={[
                  styles.exercisePicker,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                {MUSCLE_GROUPS.map((group) => {
                  const groupExercises = exercises.filter(
                    (ex) => ex.muscleGroup === group
                  );
                  if (groupExercises.length === 0) return null;
                  return (
                    <View key={group} style={styles.muscleGroup}>
                      <Text style={[styles.muscleGroupName, { color: colors.text }]}>
                        {group}
                      </Text>
                      {groupExercises.map((ex) => (
                        <TouchableOpacity
                          key={ex.id}
                          style={[
                            styles.exerciseChip,
                            {
                              backgroundColor: selectedExerciseIds.includes(ex.id)
                                ? colors.accent
                                : isDark
                                  ? 'rgba(255, 255, 255, 0.08)'
                                  : 'rgba(0, 0, 0, 0.03)',
                              borderColor: isDark
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.06)',
                            },
                          ]}
                          onPress={() => toggleExercise(ex.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.exerciseChipText,
                              {
                                color: selectedExerciseIds.includes(ex.id)
                                  ? '#FFFFFF'
                                  : colors.text,
                              },
                            ]}
                          >
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButtonContainer}
              onPress={handleUpdateGroup}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.accent, '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Update Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheetModal>

      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 26,
    fontFamily: FONTS.display,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  groupActions: {
    marginLeft: 12,
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 26,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  colorChip: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  exercisePickerToggle: {
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exercisePickerText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    flex: 1,
    fontWeight: '500',
  },
  tapText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  exercisePicker: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    maxHeight: 280,
  },
  muscleGroup: {
    marginBottom: 16,
  },
  muscleGroupName: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  exerciseChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  exerciseChipText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '600',
  },
  submitButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
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
