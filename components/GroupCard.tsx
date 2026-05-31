import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Grid, Clock, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react-native';
import { WorkoutGroup, Exercise } from '@/types/data';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MUSCLE_GROUP_COLORS, FONTS, BRAND_COLORS } from '@/constants';

interface GroupCardProps {
  group: WorkoutGroup;
  exercises: Exercise[];
  estimatedDuration: number;
  onPress?: () => void;
  expanded?: boolean;
}

export function GroupCard({
  group,
  exercises,
  estimatedDuration,
  onPress,
  expanded: externalExpanded,
}: GroupCardProps) {
  const { colors, isDark } = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;

  return (
    <TouchableOpacity
      onPress={() => {
        setInternalExpanded(!internalExpanded);
        onPress?.();
      }}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: Platform.OS === 'android'
              ? (isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff')
              : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)'),
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(255, 255, 255, 0.5)',
            elevation: Platform.OS === 'android' ? 2 : 0,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.leftContent}>
              <LinearGradient
                colors={[group.color, `${group.color}cc`]}
                style={styles.colorBar}
              />
              <View style={styles.titleContainer}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {group.name}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Dumbbell size={14} color={colors.textTertiary} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      {exercises.length} exercises
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={colors.textTertiary} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      ~{estimatedDuration} min
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.rightContent}>
              <View style={styles.daysContainer}>
                {group.days.slice(0, 3).map((day) => (
                  <View
                    key={day}
                    style={[
                      styles.dayBadge,
                      {
                        backgroundColor: `${group.color}25`,
                        borderColor: group.color,
                      },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: group.color }]}>{day}</Text>
                  </View>
                ))}
                {group.days.length > 3 && (
                  <View
                    style={[
                      styles.dayBadge,
                      {
                        backgroundColor: `${group.color}15`,
                        borderColor: group.color,
                      },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: group.color }]}>
                      +{group.days.length - 3}
                    </Text>
                  </View>
                )}
              </View>
              {expanded ? (
                <ChevronUp size={20} color={colors.textTertiary} strokeWidth={2} />
              ) : (
                <ChevronDown size={20} color={colors.textTertiary} strokeWidth={2} />
              )}
            </View>
          </View>

          {expanded && exercises.length > 0 && (
            <View
              style={[
                styles.exerciseList,
                {
                  borderTopColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              {exercises.map((ex, index) => (
                <View key={ex.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseNumberContainer}>
                    <LinearGradient
                      colors={[group.color, `${group.color}cc`]}
                      style={styles.exerciseNumberGradient}
                    >
                      <Text style={styles.exerciseNumber}>{index + 1}</Text>
                    </LinearGradient>
                  </View>
                  <Text
                    style={[styles.exerciseName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {ex.name}
                  </Text>
                  <View
                    style={[
                      styles.exerciseSetsBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}
                  >
                    <Text style={[styles.exerciseSets, { color: colors.textSecondary }]}>
                      {ex.sets}×{ex.reps}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  colorBar: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: 14,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: FONTS.display,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  exerciseList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  exerciseNumberContainer: {
    marginRight: 12,
  },
  exerciseNumberGradient: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  exerciseSetsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseSets: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});
