import { TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

export function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
      <LinearGradient
        colors={isDark ? ['#667eea', '#764ba2'] : ['#FFA500', '#FF6B6B']}
        style={styles.container}
      >
        {isDark ? (
          <Sun size={16} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Moon size={16} color="#FFFFFF" strokeWidth={2.5} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
