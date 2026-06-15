import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Spacing, Typography } from '@/constants/theme';

const KEYWORDS = [
  '아침형 인간', '운동', '독서', '미니멀라이프', '집중력', '명상',
  '재테크', '글쓰기', '네트워킹', '영어공부', '사이드프로젝트', '건강식단',
];

export default function OnboardingStep2() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (keyword: string) => {
    setSelected((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
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
              selected={selected.includes(keyword)}
              onPress={() => toggle(keyword)}
            />
          ))}
        </View>
      </View>

      <Button
        label="다음"
        fullWidth
        disabled={selected.length === 0}
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
});
