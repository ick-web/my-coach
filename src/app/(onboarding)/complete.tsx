import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Spacing, Typography } from '@/constants/theme';

export default function OnboardingComplete() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.illustration}>🎉</Text>
        <Text style={styles.title}>오늘의 루틴이 준비됐어요!</Text>
        <Text style={[Typography.subtext, styles.subtitle]}>
          작은 실천을 하나씩 쌓아가며 목표에 가까워져요.
        </Text>
      </View>

      <View style={styles.actions}>
        {/* UX-004: 완료 축하 화면 소셜 공유 CTA */}
        <Button label="친구에게 공유하기" variant="secondary" fullWidth onPress={() => {}} />
        <Button label="오늘 루틴 시작하기" fullWidth onPress={() => router.replace('/home')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.screenMargin,
    paddingTop: Spacing.section,
    paddingBottom: Spacing.section,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  illustration: {
    fontSize: 64,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.md,
  },
});
