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
    ? (['#0a0a0f', '#141428', '#1a1a3e', '#0f0f1e'] as const)
    : (['#ffffff', '#f8fafc', '#eef2f7', '#e8eeef'] as const);

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
