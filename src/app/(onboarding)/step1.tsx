import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spacing, Typography } from '@/constants/theme';

export default function OnboardingStep1() {
  const [goal, setGoal] = useState('');
  const [rolemodel, setRolemodel] = useState('');

  const canProceed = goal.trim().length > 0 && rolemodel.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator step={1} total={3} />
        <Text style={styles.title}>어떤 목표를 향해 가고 있나요?</Text>
        <Text style={[Typography.subtext, styles.subtitle]}>
          목표 직업과 롤모델을 알려주시면 맞춤 루틴을 만들어드려요.
        </Text>

        <View style={styles.form}>
          <Input label="목표 직업" placeholder="예: IT 스타트업 PM" value={goal} onChangeText={setGoal} />
          <Input label="롤모델" placeholder="예: 박지성" value={rolemodel} onChangeText={setRolemodel} />
        </View>
      </View>

      <Button label="다음" fullWidth disabled={!canProceed} onPress={() => router.push('/step2')} />
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
  title: {
    ...Typography.sectionTitle,
    fontSize: 22,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.section,
  },
  form: {
    gap: Spacing.base,
  },
});
