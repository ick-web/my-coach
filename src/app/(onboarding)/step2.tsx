import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const KEYWORDS = [
  '아침형 인간', '운동', '독서', '미니멀라이프', '집중력', '명상',
  '재테크', '글쓰기', '네트워킹', '영어공부', '사이드프로젝트', '건강식단',
];

// 30분 단위 시간 슬롯 00:00 ~ 23:30
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

function prevTime(time: string): string {
  const idx = TIME_SLOTS.indexOf(time);
  return TIME_SLOTS[Math.max(0, idx - 1)];
}

function nextTime(time: string): string {
  const idx = TIME_SLOTS.indexOf(time);
  return TIME_SLOTS[Math.min(TIME_SLOTS.length - 1, idx + 1)];
}

export default function OnboardingStep2() {
  const { lifestyleTags, setLifestyleTags, wakeTime, sleepTime, setWakeTime, setSleepTime } =
    useOnboardingStore();

  const toggle = (keyword: string) => {
    const next = lifestyleTags.includes(keyword)
      ? lifestyleTags.filter((k) => k !== keyword)
      : [...lifestyleTags, keyword];
    setLifestyleTags(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator step={2} total={3} />
        <Text style={styles.title}>라이프스타일을 선택해주세요</Text>
        <Text style={[Typography.subtext, styles.subtitle]}>
          관심 있는 키워드를 모두 선택해주세요. (복수 선택 가능)
        </Text>

        <View style={styles.tagGrid}>
          {KEYWORDS.map((keyword) => (
            <Tag
              key={keyword}
              label={keyword}
              selected={lifestyleTags.includes(keyword)}
              onPress={() => toggle(keyword)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.timeTitle}>하루 시간대를 알려주세요</Text>
        <View style={styles.timeRow}>
          <View style={styles.timePicker}>
            <Text style={styles.timeLabel}>기상 시간</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setWakeTime(prevTime(wakeTime))}
              >
                <Text style={styles.stepperArrow}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>{wakeTime}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setWakeTime(nextTime(wakeTime))}
              >
                <Text style={styles.stepperArrow}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timePicker}>
            <Text style={styles.timeLabel}>취침 시간</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setSleepTime(prevTime(sleepTime))}
              >
                <Text style={styles.stepperArrow}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.timeValue}>{sleepTime}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setSleepTime(nextTime(sleepTime))}
              >
                <Text style={styles.stepperArrow}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Button
        label="다음"
        fullWidth
        disabled={lifestyleTags.length === 0 || wakeTime >= sleepTime}
        onPress={() => router.push('/step3')}
      />
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
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.section,
  },
  timeTitle: {
    ...Typography.sectionTitle,
    fontSize: 16,
    marginBottom: Spacing.base,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  timePicker: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.statusBg.skipped,
    borderRadius: Radius.cardSm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  timeLabel: {
    ...Typography.subtext,
    marginBottom: Spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperArrow: {
    fontSize: 16,
    color: Colors.primary,
  },
  timeValue: {
    ...Typography.statValue,
    fontSize: 18,
    color: Colors.navy,
    minWidth: 60,
    textAlign: 'center',
  },
});
