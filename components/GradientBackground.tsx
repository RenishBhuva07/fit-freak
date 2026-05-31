import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { ReactNode } from 'react';

interface GradientBackgroundProps {
  children: ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  const { isDark } = useTheme();

  const colors = isDark
    ? (['#0B0B0B', '#0F0F12', '#141418', '#0B0B0B'] as const)
    : (['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'] as const);

  return (
    <LinearGradient
      colors={colors}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

export function GlassCard({ children, style }: { children: ReactNode; style?: any }) {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.glassCard,
        {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.7)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.5)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
