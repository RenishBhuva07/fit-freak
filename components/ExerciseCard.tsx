import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Dumbbell, Check, Clock, Edit2, Trash2, Award } from 'lucide-react-native';
import { Exercise } from '@/types/data';
import { MUSCLE_GROUP_COLORS, FONTS, BRAND_COLORS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onComplete?: () => void;
  isComplete?: boolean;
  showCompleteButton?: boolean;
  highlighted?: boolean;
  showBadge?: boolean;
  reserveActionSpace?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Curated high-quality remote gym animations corresponding to muscle groups
// Easily customizable to local JSON files when the user adds them later
const LOTTIE_URLS: Record<string, string> = {
  Chest: 'https://assets5.lottiefiles.com/packages/lf20_gjmecwqa.json',
  Back: 'https://assets5.lottiefiles.com/packages/lf20_sf95uq12.json',
  Biceps: 'https://assets5.lottiefiles.com/packages/lf20_gjmecwqa.json',
  Triceps: 'https://assets5.lottiefiles.com/packages/lf20_gjmecwqa.json',
  Quads: 'https://assets5.lottiefiles.com/packages/lf20_m59m1gpe.json',
  Hamstrings: 'https://assets5.lottiefiles.com/packages/lf20_m59m1gpe.json',
  Calves: 'https://assets5.lottiefiles.com/packages/lf20_m59m1gpe.json',
  Shoulders: 'https://assets5.lottiefiles.com/packages/lf20_sf95uq12.json',
  Abs: 'https://assets5.lottiefiles.com/packages/lf20_sf95uq12.json',
  Glutes: 'https://assets5.lottiefiles.com/packages/lf20_m59m1gpe.json',
  Cardio: 'https://assets5.lottiefiles.com/packages/lf20_5n8ybb.json',
};

// Sleek fallback custom Svg Barbell component
const BarbellSvg = ({ color }: { color: string }) => (
  <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    {/* Barbell shaft */}
    <Path d="M6 12h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Inner plates */}
    <Path d="M6 8v8M18 8v8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Outer plates */}
    <Path d="M4 9v6M20 9v6" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Collars */}
    <Path d="M2 11v2M22 11v2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export function ExerciseCard({
  exercise,
  onPress,
  onComplete,
  isComplete = false,
  showCompleteButton = false,
  highlighted = false,
  showBadge = true,
  reserveActionSpace = false,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
  const { colors, isDark } = useTheme();
  const muscleColor = MUSCLE_GROUP_COLORS[exercise.muscleGroup] || colors.accent;
  
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const [lottieLoaded, setLottieLoaded] = useState(false);

  // Setup breathing scale animation for completion status
  useEffect(() => {
    if (isComplete) {
      scale.value = withSpring(0.97);
    } else {
      scale.value = withSpring(1);
    }
  }, [isComplete]);

  // Setup infinite gentle pulse for the preview frame/dumbbell fallback
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400 }),
        withTiming(1.0, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isComplete ? 0.65 : 1,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const lottieUrl = LOTTIE_URLS[exercise.muscleGroup];

  return (
    <Animated.View entering={FadeIn.duration(350)} style={[animatedStyle, { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={isComplete && showCompleteButton}
        style={[
          styles.shadowContainer,
          {
            backgroundColor: Platform.OS === 'android'
              ? (isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff')
              : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)'),
            ...Platform.select({
              ios: {
                shadowColor: highlighted ? colors.accent : '#000000',
                shadowOpacity: highlighted ? 0.18 : 0.04,
                shadowRadius: highlighted ? 12 : 8,
                shadowOffset: { width: 0, height: highlighted ? 6 : 4 },
              },
              android: {
                elevation: highlighted ? 4 : 2,
              },
            }),
          },
        ]}
      >
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: Platform.OS === 'android'
                ? (isDark ? BRAND_COLORS.CHARCOAL_CARD : '#ffffff')
                : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)'),
              borderColor: highlighted
                ? colors.accent
                : isDark
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          {/* Main Card Content Layout */}
          <View style={styles.topRow}>
            
            {/* 1. Left Side: Visual Showcase Container with glowing neon border */}
            <View style={styles.visualContainer}>
              <Animated.View
                style={[
                  styles.visualFrame,
                  pulseStyle,
                  {
                    borderColor: highlighted
                      ? colors.accent
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)',
                  },
                ]}
              >
                {/* Glow Background Circle */}
                <View
                  style={[
                    styles.visualGlow,
                    { backgroundColor: `${muscleColor}15` },
                  ]}
                />

                {/* Animated Dumbbell Fallback (rendered behind Lottie or while loading) */}
                <View style={[styles.fallbackIcon, lottieLoaded && { opacity: 0.15 }]}>
                  <BarbellSvg color={muscleColor} />
                </View>

                {/* Lottie Animation (loads remote gym loops perfectly) */}
                {lottieUrl && !isComplete && (
                  <LottieView
                    source={{ uri: lottieUrl }}
                    style={styles.lottie}
                    autoPlay
                    loop
                    onAnimationLoaded={() => setLottieLoaded(true)}
                  />
                )}
              </Animated.View>
            </View>

            {/* 2. Middle: Premium Typography Details */}
            <View style={[styles.detailsContainer, reserveActionSpace && { marginRight: 70 }]}>
              {/* Muscle Group Badge & Custom tag */}
              <View style={styles.headerBadgeRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isDark
                        ? `${muscleColor}18`
                        : `${muscleColor}10`,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: muscleColor }]}>
                    {exercise.muscleGroup.toUpperCase()}
                  </Text>
                </View>
                {exercise.isCustom && (
                  <View style={[styles.customBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text style={[styles.customBadgeText, { color: colors.textSecondary }]}>CUSTOM</Text>
                  </View>
                )}
              </View>

              {/* Exercise Name */}
              <Text
                style={[styles.name, { color: colors.text }]}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>

              {/* Set/Reps & Rest Stats */}
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)',
                    },
                  ]}
                >
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {exercise.sets} <Text style={styles.statLabel}>SETS</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.03)',
                    },
                  ]}
                >
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {exercise.reps} <Text style={styles.statLabel}>REPS</Text>
                  </Text>
                </View>

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

            {/* 3. Right Side: Premium Circular Actions */}
            {onEdit && onDelete ? (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.03)',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Edit2 size={13} color={colors.textSecondary} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: `${colors.error}12`,
                      borderColor: `${colors.error}25`,
                    },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={colors.error} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            ) : showBadge && !reserveActionSpace && !showCompleteButton ? (
              <View style={styles.chevronPlaceholder}>
                {isComplete ? (
                  <View style={[styles.miniCheckCircle, { backgroundColor: colors.success }]}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* 4. Notes Section - Styled like a premium glassmorphic quote bar */}
          {exercise.notes && (
            <View
              style={[
                styles.notesContainer,
                {
                  borderTopColor: isDark
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'rgba(0, 0, 0, 0.03)',
                },
              ]}
            >
              <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
                “{exercise.notes}”
              </Text>
            </View>
          )}

          {/* 5. Complete Button Slider (Upgrade to sleek horizontal gradients) */}
          {showCompleteButton && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onComplete?.();
              }}
              activeOpacity={0.85}
              style={styles.completeButtonWrapper}
            >
              <LinearGradient
                colors={isComplete ? [colors.success, '#2ec866'] : [colors.accent, '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeButton}
              >
                {isComplete ? (
                  <Animated.View entering={ZoomIn.duration(250)} style={styles.completeButtonIcon}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3.5} />
                  </Animated.View>
                ) : (
                  <View style={styles.completeButtonIcon}>
                    <Award size={16} color="#FFFFFF" strokeWidth={2} />
                  </View>
                )}
                <Text style={styles.completeButtonText}>
                  {isComplete ? 'WORKOUT DONE' : 'MARK COMPLETED'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: 24,
    marginBottom: 12,
  },
  innerContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visualContainer: {
    marginRight: 14,
  },
  visualFrame: {
    width: 76,
    height: 76,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  fallbackIcon: {
    position: 'absolute',
    zIndex: 1,
  },
  lottie: {
    width: 70,
    height: 70,
    zIndex: 2,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  customBadgeText: {
    fontSize: 8,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 12,
    fontFamily: FONTS.digital,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FONTS.medium,
    opacity: 0.5,
  },
  restContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    gap: 4,
  },
  restText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronPlaceholder: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  notesText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  completeButtonWrapper: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeButton: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
