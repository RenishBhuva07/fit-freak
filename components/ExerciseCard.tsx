import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Check, Clock, Edit2, Trash2, Award, Dumbbell, Shield, Zap, Flame, Heart, Activity } from 'lucide-react-native';
import { Exercise } from '@/types/data';
import { MUSCLE_GROUP_COLORS, FONTS, BRAND_COLORS } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';

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

const WATERMARK_ICONS: Record<string, any> = {
  Chest: Dumbbell,
  Back: Shield,
  Biceps: Dumbbell,
  Triceps: Dumbbell,
  Quads: Zap,
  Hamstrings: Zap,
  Calves: Zap,
  Shoulders: Shield,
  Abs: Activity,
  Glutes: Heart,
  Cardio: Flame,
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

  const isLightBackground = (() => {
    const cleaned = muscleColor.replace('#', '');
    const r = parseInt(cleaned.substr(0, 2), 16) / 255;
    const g = parseInt(cleaned.substr(2, 2), 16) / 255;
    const b = parseInt(cleaned.substr(4, 2), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.6;
  })();

  const textColor = isLightBackground ? '#0A0A0F' : '#FFFFFF';
  const textSecondaryColor = isLightBackground ? 'rgba(10, 10, 15, 0.65)' : 'rgba(255, 255, 255, 0.7)';
  const textTertiaryColor = isLightBackground ? 'rgba(10, 10, 15, 0.5)' : 'rgba(255, 255, 255, 0.5)';
  const badgeBg = isLightBackground ? 'rgba(10, 10, 15, 0.08)' : 'rgba(255, 255, 255, 0.15)';
  const dividerColor = isLightBackground ? 'rgba(10, 10, 15, 0.08)' : 'rgba(255, 255, 255, 0.15)';
  const innerBg = isLightBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={isComplete && showCompleteButton}
        style={[
          styles.shadowContainer,
          {
            backgroundColor: muscleColor,
            ...Platform.select({
              ios: {
                shadowColor: '#000000',
                shadowOpacity: highlighted ? 0.12 : 0.06,
                shadowRadius: highlighted ? 12 : 10,
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
              backgroundColor: muscleColor,
              borderColor: highlighted
                ? (isLightBackground ? 'rgba(10, 10, 15, 0.4)' : 'rgba(255, 255, 255, 0.6)')
                : dividerColor,
            },
          ]}
        >
          {/* Background watermark icon */}
          {(() => {
            const IconComponent = WATERMARK_ICONS[exercise.muscleGroup] || Activity;
            const watermarkColor = isLightBackground ? 'rgba(10, 10, 15, 0.05)' : 'rgba(255, 255, 255, 0.08)';
            return (
              <View style={styles.backgroundIcon} pointerEvents="none">
                <IconComponent size={96} color={watermarkColor} strokeWidth={1.4} />
              </View>
            );
          })()}

          {/* Main Card Content Layout */}
          <View style={styles.topRow}>

            {/* 1. Left Side: Visual Showcase Container with glowing neon border */}
            <View style={styles.visualContainer}>
              <View
                style={[
                  styles.visualFrame,
                  {
                    borderColor: dividerColor,
                    backgroundColor: innerBg,
                  },
                ]}
              >
                <View style={[styles.visualGlow, { backgroundColor: isLightBackground ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]} />
                <View style={styles.fallbackIcon}>
                  <BarbellSvg color={textColor} />
                </View>
              </View>
            </View>

            {/* 2. Middle: Premium Typography Details */}
            <View style={[styles.detailsContainer, reserveActionSpace && { marginRight: 70 }]}>
              {/* Muscle Group Badge & Custom tag */}
              <View style={styles.headerBadgeRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: badgeBg,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: textColor }]}>
                    {exercise.muscleGroup.toUpperCase()}
                  </Text>
                </View>
                {exercise.isCustom && (
                  <View style={[styles.customBadge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.customBadgeText, { color: textSecondaryColor }]}>CUSTOM</Text>
                  </View>
                )}
              </View>

              {/* Exercise Name */}
              <Text
                style={[styles.name, { color: textColor }]}
                numberOfLines={1}
              >
                {exercise.name}
              </Text>

              {/* Set/Reps & Rest Stats */}
              <View style={styles.statsRow}>
                <View style={[styles.statPill, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {exercise.sets} <Text style={[styles.statLabel, { color: textSecondaryColor }]}>SETS</Text>
                  </Text>
                </View>

                <View style={[styles.statPill, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {exercise.reps} <Text style={[styles.statLabel, { color: textSecondaryColor }]}>REPS</Text>
                  </Text>
                </View>

                {exercise.restSeconds > 0 && (
                  <View style={styles.restContainer}>
                    <Clock size={12} color={textSecondaryColor} strokeWidth={2} />
                    <Text style={[styles.restText, { color: textSecondaryColor }]}>
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
                      backgroundColor: badgeBg,
                      borderColor: dividerColor,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Edit2 size={13} color={textSecondaryColor} strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isLightBackground ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.25)',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={isLightBackground ? '#D01010' : '#FF8080'} strokeWidth={2.5} />
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
                  borderTopColor: dividerColor,
                },
              ]}
            >
              <Text style={[styles.notesText, { color: textSecondaryColor }]} numberOfLines={2}>
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
                  <View style={styles.completeButtonIcon}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: 22,
    marginBottom: 12,
  },
  innerContainer: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
    position: 'relative',
  },
  backgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -12,
    opacity: 0.85,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
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
