import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography } from '@/constants/theme';

export default function OnboardingStep3() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator step={3} total={3} />
        <View style={styles.hero}>
          <Text style={styles.illustration}>✨</Text>
          <Text style={styles.title}>이제 AI가 맞춤 스케줄을 만들어드릴게요</Text>
          <Text style={[Typography.subtext, styles.subtitle]}>
            입력한 목표와 라이프스타일을 기반으로 오늘 실천할 루틴을 생성합니다.
          </Text>
        </View>
      </View>

      <Button label="AI로 스케줄 생성하기" fullWidth onPress={() => router.push('/loading')} />
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
  content: {
    flex: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.section,
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
});
