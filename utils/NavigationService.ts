import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import type { RootStackParamList } from '@/Navigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen
 */
export function navigate(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

/**
 * Go back to the previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Replace current screen with a new one
 */
export function replace(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

/**
 * Reset the navigation state to a specific screen
 */
export function resetNavigation(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}
