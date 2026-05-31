import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Trophy, Star, Zap, PartyPopper, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CelebrationScreenProps {
  visible: boolean;
  streakCount: number;
  isNewRecord?: boolean;
  onDismiss: () => void;
}

export function CelebrationScreen({
  visible,
  streakCount,
  isNewRecord = false,
  onDismiss,
}: CelebrationScreenProps) {
  const { colors } = useTheme();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onDismiss}
        activeOpacity={1}
      />

      <Animated.View entering={ZoomIn.delay(200).duration(500)} style={styles.content}>
        {/* Confetti overlay */}
        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          style={styles.confettiOverlay}
        >
          <PartyPopper size={100} color={colors.success} strokeWidth={1} />
          <Sparkles size={60} color={colors.accent} strokeWidth={1.5} style={styles.sparkle1} />
          <Sparkles size={50} color="#FFE66D" strokeWidth={1.5} style={styles.sparkle2} />
        </Animated.View>

        {/* Trophy icon */}
        <Animated.View entering={ZoomIn.delay(300).duration(500)}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.iconContainer}
          >
            <Trophy size={72} color="#FFFFFF" strokeWidth={1.5} />
          </LinearGradient>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(400).duration(400)} style={[styles.title, { color: colors.text }]}>
          Workout Complete!
        </Animated.Text>

        <Animated.View entering={ZoomIn.delay(500).duration(400)} style={styles.streakContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FFE66D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.streakBadge}
          >
            <Star size={24} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.streakText}>
              {streakCount} Day Streak!
            </Text>
            <Zap size={24} color="#FFFFFF" strokeWidth={2} />
          </LinearGradient>
        </Animated.View>

        {isNewRecord && (
          <Animated.View entering={ZoomIn.delay(600).duration(400)} style={styles.recordContainer}>
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              style={styles.recordBadge}
            >
              <Text style={styles.recordText}>New Personal Best!</Text>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <TouchableOpacity onPress={onDismiss} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.accent, '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Keep Going</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 32,
    width: width * 0.88,
  },
  confettiOverlay: {
    position: 'absolute',
    top: -80,
    zIndex: -1,
  },
  sparkle1: {
    position: 'absolute',
    top: -20,
    right: -50,
  },
  sparkle2: {
    position: 'absolute',
    top: 60,
    left: -60,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  streakContainer: {
    marginBottom: 18,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  streakText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  recordContainer: {
    marginBottom: 28,
  },
  recordBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#38ef7d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
