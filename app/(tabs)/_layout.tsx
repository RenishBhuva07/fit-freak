import { Tabs } from 'expo-router';
import { Dumbbell, Grid3X3, Zap, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { StyleSheet, View, Text } from 'react-native';
import { useStreak } from '@/hooks/useStreak';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { streakMeta } = useStreak();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark
            ? 'rgba(20, 20, 40, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.05)',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 24,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ size, color, focused }) => (
            focused ? (
              <View style={styles.activeIconContainer}>
                <LinearGradient
                  colors={[colors.accent, '#764ba2']}
                  style={styles.activeIconGradient}
                >
                  <Dumbbell size={size} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
            ) : (
              <Dumbbell size={size} color={color} strokeWidth={2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ size, color, focused }) => (
            focused ? (
              <View style={styles.activeIconContainer}>
                <LinearGradient
                  colors={[colors.accent, '#764ba2']}
                  style={styles.activeIconGradient}
                >
                  <Grid3X3 size={size} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
            ) : (
              <Grid3X3 size={size} color={color} strokeWidth={2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: '/today',
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color, focused }) => {
            const bgColor = isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.04)';
            return (
              <View style={[styles.todayIconContainer, focused && styles.todayIconActive]}>
                <LinearGradient
                  colors={focused ? [colors.accent, '#764ba2'] : [bgColor, bgColor]}
                  style={styles.todayIconGradient}
                >
                  <Zap
                    size={focused ? size : size}
                    color={focused ? '#FFFFFF' : color}
                    strokeWidth={2.5}
                  />
                  {streakMeta.currentStreak > 0 && (
                    <View style={[styles.streakBadge, { backgroundColor: '#FF6B6B' }]}>
                      <Text style={styles.streakBadgeText}>
                        {streakMeta.currentStreak}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ size, color, focused }) => (
            focused ? (
              <View style={styles.activeIconContainer}>
                <LinearGradient
                  colors={[colors.accent, '#764ba2']}
                  style={styles.activeIconGradient}
                >
                  <BarChart3 size={size} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </View>
            ) : (
              <BarChart3 size={size} color={color} strokeWidth={2} />
            )
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    position: 'relative',
    top: -4,
  },
  activeIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayIconContainer: {
    position: 'relative',
    top: -2,
  },
  todayIconActive: {
    top: -6,
  },
  todayIconGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
