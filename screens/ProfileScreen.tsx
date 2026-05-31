import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, User, Bell, Dumbbell, Shield, Sparkles, Trophy, Zap, Sun, Moon } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { useStreak } from '@/hooks/useStreak';
import { GradientBackground } from '@/components/GradientBackground';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/Navigator';
import * as Haptics from 'expo-haptics';
import { BRAND_COLORS, FONTS } from '@/constants';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { streakMeta } = useStreak();

  // Settings states
  const [name, setName] = useState('James');
  const [email, setEmail] = useState('james.freak@fitness.com');
  const [weight, setWeight] = useState('78');
  const [height, setHeight] = useState('178');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* 1. Header Row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. Premium 3D Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileHeaderInner}>
              {/* Custom SVG Avatar */}
              <View style={styles.avatarWrapper}>
                <Svg width="80" height="80" viewBox="0 0 40 40" fill="none">
                  <Circle cx="20" cy="20" r="20" fill="#E2D2FF" />
                  <Path d="M20,10 C22.76,10 25,12.24 25,15 C25,17.76 22.76,20 20,20 C17.24,20 15,17.76 15,15 C15,12.24 17.24,10 20,10 Z" fill="#0A0A0F" />
                  <Path d="M10,32 C10,26.48 14.48,22 20,22 C25.52,22 30,26.48 30,32" fill="none" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
                <View style={styles.avatarEditBadge}>
                  <Sparkles size={10} color="#0A0A0F" fill="#0A0A0F" />
                </View>
              </View>

              <Text style={[styles.profileName, { color: colors.text }]}>{name.toUpperCase()}</Text>

              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }]}>
                  <Zap size={12} color={BRAND_COLORS.NEON_LIME} fill={BRAND_COLORS.NEON_LIME} />
                  <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    {streakMeta.currentStreak} Day Streak
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)' }]}>
                  <Trophy size={12} color="#FFE66D" fill="#FFE66D" />
                  <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                    Best: {streakMeta.bestStreak}d
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 3. Section: Account Info */}
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Info</Text>

            <View style={styles.cardShadow}>
              <View
                style={[
                  styles.cardInner,
                  {
                    backgroundColor: BRAND_COLORS.POWDER_BLUE,
                    borderColor: 'transparent'
                  }
                ]}
              >
                {/* Field: Full Name */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <User size={14} color={colors.textSecondary} />
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                {/* Field: Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <Shield size={14} color={colors.textSecondary} />
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, { color: colors.text, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Fields: Height & Weight */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                      value={height}
                      onChangeText={setHeight}
                      placeholder="178"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="75"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 4. Section: Preferences */}
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Preferences</Text>

            <View style={styles.cardShadow}>
              <View
                style={[
                  styles.cardInner,
                  {
                    backgroundColor: '#E6CFFF',
                    borderColor: 'transparent'
                  }
                ]}
              >
                {/* Switch: Dark Theme */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    {isDark ? <Moon size={16} color={colors.textSecondary} /> : <Sun size={16} color={colors.textSecondary} />}
                    <Text style={[styles.switchLabel, { color: colors.text }]}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleTheme();
                    }}
                    trackColor={{ false: 'rgba(0,0,0,0.1)', true: BRAND_COLORS.NEON_LIME }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  />
                </View>

                {/* Switch: Push Notifications */}
                <View style={styles.switchRow}>
                  <View style={styles.switchLabelContainer}>
                    <Bell size={16} color={colors.textSecondary} />
                    <Text style={[styles.switchLabel, { color: colors.text }]}>Push Notifications</Text>
                  </View>
                  <Switch
                    value={pushEnabled}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPushEnabled(val);
                    }}
                    trackColor={{ false: 'rgba(0,0,0,0.1)', true: BRAND_COLORS.NEON_LIME }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  />
                </View>

                {/* Switch: Sound Effects */}
                <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={styles.switchLabelContainer}>
                    <Dumbbell size={16} color={colors.textSecondary} />
                    <Text style={[styles.switchLabel, { color: colors.text }]}>Workout Sound FX</Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={(val) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSoundEnabled(val);
                    }}
                    trackColor={{ false: 'rgba(0,0,0,0.1)', true: BRAND_COLORS.NEON_LIME }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.display,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileHeader: {
    width: '100%',
    marginBottom: 24,
  },
  profileHeaderInner: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardShadow: {
    borderRadius: 28,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileCardInner: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.NEON_LIME,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.display,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  cardShadow: {
    borderRadius: 22,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardInner: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  textInput: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});
