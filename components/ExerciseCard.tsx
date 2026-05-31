import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dumbbell, Check, Clock } from 'lucide-react-native';
import { Exercise } from '@/types/data';
import { MUSCLE_GROUP_COLORS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn, useAnimatedStyle, withSpring, useSharedValue, interpolateColor } from 'react-native-reanimated';
import { useEffect } from 'react';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onComplete?: () => void;
  isComplete?: boolean;
  showCompleteButton?: boolean;
  highlighted?: boolean;
}

export function ExerciseCard({
  exercise,
  onPress,
  onComplete,
  isComplete = false,
  showCompleteButton = false,
  highlighted = false,
}: ExerciseCardProps) {
  const { colors, isDark } = useTheme();
  const muscleColor = MUSCLE_GROUP_COLORS[exercise.muscleGroup];
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isComplete) {
      scale.value = withSpring(0.98);
    } else {
      scale.value = withSpring(1);
    }
  }, [isComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isComplete ? 0.6 : 1,
  }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={isComplete && showCompleteButton}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.6)',
              borderColor: highlighted
                ? colors.accent
                : isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.5)',
              shadowColor: highlighted ? colors.accent : '#000',
              shadowOpacity: highlighted ? 0.3 : 0.08,
            },
          ]}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[muscleColor, `${muscleColor}cc`]}
                  style={styles.iconGradient}
                >
                  <Dumbbell size={16} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              </View>
              <View style={styles.titleContainer}>
                <Text
                  style={[styles.name, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {exercise.name}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    {exercise.sets} × {exercise.reps}
                  </Text>
                  {exercise.restSeconds > 0 && (
                    <View style={styles.restContainer}>
                      <Clock size={12} color={colors.textTertiary} strokeWidth={2} />
                      <Text style={[styles.restText, { color: colors.textTertiary }]}>
                        {exercise.restSeconds}s
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark
                      ? `${muscleColor}20`
                      : `${muscleColor}15`,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: muscleColor }]} numberOfLines={1}>
                  {exercise.muscleGroup}
                </Text>
              </View>
            </View>

            {exercise.notes && (
              <Text style={[styles.notes, { color: colors.textTertiary }]} numberOfLines={2}>
                {exercise.notes}
              </Text>
            )}

            {showCompleteButton && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onComplete?.();
                }}
                activeOpacity={0.8}
                style={styles.completeButtonContainer}
              >
                <LinearGradient
                  colors={isComplete ? [colors.success, '#38ef7d'] : [colors.accent, '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completeButton}
                >
                  {isComplete ? (
                    <Animated.View entering={ZoomIn.duration(300)}>
                      <Check size={20} color="#FFFFFF" strokeWidth={3} />
                    </Animated.View>
                  ) : null}
                  <Text style={styles.completeButtonText}>
                    {isComplete ? 'Done' : 'Mark Complete'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 18,
  },
  completeButtonContainer: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  completeButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
