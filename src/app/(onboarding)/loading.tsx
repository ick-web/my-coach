import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function OnboardingLoading() {
  const [progress, setProgress] = useState(0);
  const { saveGoalAndGenerateSchedule } = useOnboardingStore();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    saveGoalAndGenerateSchedule((pct) => {
      setProgress(pct);
    }).then((result) => {
      if (result === 'success') {
        router.replace('/complete');
      } else {
        // 에러 시 step3으로 돌아가 재시도 가능하게 함
        router.replace('/step3');
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AI가 스케줄을 만들고 있어요</Text>
      <Text style={[Typography.subtext, styles.subtitle]}>잠시만 기다려주세요...</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.percent}>{progress}%</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenMargin,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.sectionTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: Spacing.section,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusBg.skipped,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  percent: {
    ...Typography.statValue,
    marginTop: Spacing.sm,
    color: Colors.primary,
  },
});
