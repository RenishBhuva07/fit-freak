import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';

import { navigationRef } from '@/utils/NavigationService';
import TabNavigator from '@/navigators/TabNavigator';

import ProfileScreen from '@/screens/ProfileScreen';
import GroupDetailScreen from '@/screens/GroupDetailScreen';
import ActiveWorkoutScreen from '@/screens/ActiveWorkoutScreen';

// ─────────────────────────────────────────────────────────────────────────────
// Route param list — extend this as you add modal / auth screens
// ─────────────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  /** Bottom tabs (Exercises, Groups, Today, Stats) */
  MainTabs: undefined;
  Profile: undefined;
  GroupDetail: { groupId: string };
  ActiveWorkout: undefined;
  // Add modal screens here, e.g.:
  // ExerciseDetail: { exerciseId: string };
  // Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Shared options applied to every stack screen
const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: 'transparent' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Navigator
//
// Usage — rendered inside App.tsx, which wraps it with NavigationContainer.
// Call navigate / goBack / replace / resetNavigation from anywhere via
// NavigationService without needing to thread the navigation prop.
// ─────────────────────────────────────────────────────────────────────────────
export default function Navigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={defaultScreenOptions}
      >
        {/* Main tab bar */}
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        
        {/* Profile Details */}
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Group Details */}
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />

        {/* Active Workout Screen */}
        <Stack.Screen
          name="ActiveWorkout"
          component={ActiveWorkoutScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/*
         * ── Add modal / stack screens below ──────────────────────────────────
         *
         * import ExerciseDetailScreen from '@/screens/ExerciseDetailScreen';
         * <Stack.Screen
         *   name="ExerciseDetail"
         *   component={ExerciseDetailScreen}
         *   options={{ animation: 'slide_from_bottom' }}
         * />
         */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
