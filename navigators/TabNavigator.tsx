import React, { useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Dumbbell, Grid3X3, Zap, BarChart3, LayoutDashboard } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/useStreak';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

import ExercisesScreen from '@/screens/ExercisesScreen';
import GroupsScreen from '@/screens/GroupsScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import TodayScreen from '@/screens/TodayScreen';
import StatsScreen from '@/screens/StatsScreen';
import { BRAND_COLORS } from '@/constants';

export type TabParamList = {
  Today: undefined;
  Stats: undefined;
  Dashboard: undefined;
  Exercises: undefined;
  Groups: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const { width } = Dimensions.get('window');

// Custom tab bar button component with spring scaling
interface TabButtonProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: any;
  isDark: boolean;
  streakCount: number;
}

const TabButton = ({
  name,
  isFocused,
  onPress,
  onLongPress,
  colors,
  isDark,
  streakCount,
}: TabButtonProps) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 12, stiffness: 120 })
      );
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Define tab custom personalities: active background + active icon colors
  const getTabColors = () => {
    switch (name) {
      case 'Today':
        return {
          bg: '#161616', // Bold black circle
          icon: BRAND_COLORS.NEON_LIME, // Lime Zap
        };
      case 'Stats':
        return {
          bg: BRAND_COLORS.POWDER_BLUE, // Soft Powder Blue
          icon: '#0A0A0F',
        };
      case 'Dashboard':
        return {
          bg: BRAND_COLORS.SOFT_LAVENDER, // Light Lavender
          icon: '#0A0A0F',
        };
      case 'Exercises':
        return {
          bg: '#E6CFFF', // Soft Purple
          icon: '#0A0A0F',
        };
      case 'Groups':
        return {
          bg: BRAND_COLORS.NEON_LIME, // Sporty Neon Lime
          icon: '#0A0A0F',
        };
      default:
        return {
          bg: '#FFFFFF',
          icon: '#0A0A0F',
        };
    }
  };

  const tabConfig = getTabColors();

  const renderIcon = (focused: boolean, size: number, color: string) => {
    const strokeWidth = focused ? 2.5 : 2;
    switch (name) {
      case 'Today':
        return <Zap size={size} color={color} strokeWidth={strokeWidth} />;
      case 'Stats':
        return <BarChart3 size={size} color={color} strokeWidth={strokeWidth} />;
      case 'Dashboard':
        return <LayoutDashboard size={size} color={color} strokeWidth={strokeWidth} />;
      case 'Exercises':
        return <Dumbbell size={size} color={color} strokeWidth={strokeWidth} />;
      case 'Groups':
        return <Grid3X3 size={size} color={color} strokeWidth={strokeWidth} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.circleContainer,
          animatedStyle,
          isFocused 
            ? { backgroundColor: tabConfig.bg, shadowColor: tabConfig.bg, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } } 
            : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }
        ]}
      >
        {renderIcon(
          isFocused,
          22,
          isFocused ? tabConfig.icon : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)')
        )}

        {name === 'Today' && streakCount > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>{streakCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// The custom premium floating bottom bar
function PremiumWavyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const { streakMeta } = useStreak();

  return (
    <View style={[
      styles.tabBarContainer, 
      { 
        backgroundColor: '#FFFFFF', // Clean high contrast white container
        borderColor: 'rgba(0, 0, 0, 0.02)',
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabButton
            key={route.key}
            name={route.name}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            colors={colors}
            isDark={isDark}
            streakCount={streakMeta.currentStreak}
          />
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <PremiumWavyTabBar {...props} />}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 20,
    right: 20,
    height: 74,
    borderRadius: 37,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  streakBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'SpaceGrotesk-Bold',
  },
});
