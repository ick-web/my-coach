import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleIcon, GoogleIcon, KakaoIcon } from '@/components/icons/SocialIcons';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/constants/theme';

const SOCIAL_PROVIDERS = [
  { key: 'kakao', label: '카카오로 계속하기', bg: '#FEE500', textColor: '#191600', Icon: KakaoIcon },
  { key: 'google', label: 'Google로 계속하기', bg: '#fff', textColor: Colors.text, border: true, Icon: GoogleIcon },
  { key: 'apple', label: 'Apple로 계속하기', bg: '#000', textColor: '#fff', Icon: AppleIcon },
] as const;

export default function LoginScreen() {
  const goToOnboarding = () => router.push('/step1');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>MyCoach</Text>
        <Text style={Typography.subtext}>막연한 목표를, 오늘의 루틴으로</Text>
      </View>

      <View style={styles.actions}>
        {SOCIAL_PROVIDERS.map((p) => (
          <Pressable
            key={p.key}
            onPress={goToOnboarding}
            style={[
              styles.socialButton,
              { backgroundColor: p.bg },
              'border' in p && p.border && styles.socialButtonBorder,
            ]}>
            <View style={styles.socialIcon}>
              <p.Icon size={20} />
            </View>
            <Text style={[styles.socialLabel, { color: p.textColor }]}>{p.label}</Text>
          </Pressable>
        ))}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={Typography.subtext}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button label="이메일로 계속하기" variant="secondary" fullWidth onPress={goToOnboarding} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.screenMargin,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.navy,
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.section,
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  socialButtonBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    ...Typography.button,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
});
