import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Dumbbell, Trophy, Calendar, Flame, Zap, Star, Heart, Activity } from 'lucide-react-native';
import { WorkoutGroup, Exercise } from '@/types/data';
import { useTheme } from '@/hooks/useTheme';
import { FONTS } from '@/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 54) / 2;

interface GroupCardProps {
  group: WorkoutGroup;
  exercises: Exercise[];
  estimatedDuration: number;
  onPress?: () => void;
}

export function GroupCard({
  group,
  exercises,
  estimatedDuration,
  onPress,
}: GroupCardProps) {
  const { colors, isDark } = useTheme();

  // Map background watermark icon based on group id/name
  const renderBackgroundIcon = () => {
    const iconSize = 88;
    const iconColor = 'rgba(10, 10, 15, 0.06)'; // Subtle dark watermark for pastels
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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.cardWrapper}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: group.color,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        ]}
      >
        {/* Background watermark icon */}
        {renderBackgroundIcon()}

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {group.name}
          </Text>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {exercises.length} exercises
            </Text>
            <Text style={styles.statsText}>
              •  ~{estimatedDuration} min
            </Text>
          </View>

          <View style={styles.daysContainer}>
            {group.days.slice(0, 3).map((day) => (
              <View key={day} style={styles.dayBadge}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
            {group.days.length > 3 && (
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>+{group.days.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  container: {
    height: 132,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    padding: 16,
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: FONTS.display,
    fontWeight: '800',
    color: '#0A0A0F', // Legible rich black text on light pastel card backgrounds
    letterSpacing: -0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  statsText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '600',
    color: 'rgba(10, 10, 15, 0.65)',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 10, 15, 0.08)',
  },
  dayText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: '#0A0A0F',
  },
  backgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -12,
    opacity: 0.85,
    transform: [{ rotate: '-15deg' }],
    zIndex: 0,
  },
});
