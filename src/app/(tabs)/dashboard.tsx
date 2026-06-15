import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoIcon } from '@/components/icons/MiscIcons';
import { KpiCard } from '@/components/ui/Card';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const WEEK_PERCENTS = [80, 60, 100, 40, 90, 70, 33];

const STREAK_DAYS = [
  true, true, true, true, true, true, true,
  true, true, true, true, true, false, false,
];

const GOAL_PROGRESS = {
  title: 'IT 스타트업 PM 취직',
  etaLabel: '예상 달성일 D-87',
  percent: 68,
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={Typography.sectionTitle}>주간 대시보드</Text>
        <Text style={Typography.subtext}>6월 9일 - 6월 15일</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.kpiRow}>
          <KpiCard label="평균 완료율" value="68%" />
          <KpiCard label="연속 스트릭" value="12일" />
          <KpiCard label="목표 달성률" value="65%" />
        </View>

        <View style={styles.chartCard}>
          <Text style={Typography.sectionTitle}>요일별 완료율</Text>
          <Text style={[Typography.subtext, styles.chartSubtitle]}>최근 7일 체크인 기록 기준</Text>
          <View style={styles.chart}>
            {WEEK_PERCENTS.map((percent, i) => (
              <Pressable
                key={WEEK_LABELS[i]}
                style={styles.barColumn}
                onPress={() => router.push('/reflection')}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${percent}%` }]} />
                </View>
                <Text style={Typography.subtext}>{WEEK_LABELS[i]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={Typography.sectionTitle}>스트릭 캘린더</Text>
          <Text style={[Typography.subtext, styles.chartSubtitle]}>최근 2주간 완료 현황</Text>
          <View style={styles.streakGrid}>
            {STREAK_DAYS.map((done, i) => (
              <View
                key={i}
                style={[styles.streakDot, done ? styles.streakDotDone : styles.streakDotEmpty]}
              />
            ))}
          </View>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalTitleRow}>
            <Text style={Typography.sectionTitle}>목표 달성 예측</Text>
            <InfoIcon />
          </View>
          <Text style={[Typography.subtext, styles.chartSubtitle]}>
            {GOAL_PROGRESS.title} · {GOAL_PROGRESS.etaLabel}
          </Text>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${GOAL_PROGRESS.percent}%` }]} />
          </View>
          <Text style={[Typography.statValue, styles.goalPercent]}>{GOAL_PROGRESS.percent}%</Text>
          <Text style={Typography.subtext}>최근 7일 완료율 기준 산출</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={Typography.sectionTitle}>롤모델 인사이트</Text>
          <Text style={[Typography.body, styles.insightBody]}>
            박지성 선수는 매일 아침 같은 시간에 훈련을 시작하는 루틴을 10년 이상 유지했어요.
            이번 주 아침 루틴 완료율이 80%로 가장 높았어요 — 같은 시간대를 꾸준히 유지해보세요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: Spacing.screenMargin,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    gap: 4,
  },
  chartSubtitle: {
    marginBottom: Spacing.sm,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barColumn: {
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  barTrack: {
    width: 16,
    height: 96,
    borderRadius: 8,
    backgroundColor: Colors.statusBg.skipped,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  streakGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  streakDotDone: {
    backgroundColor: Colors.primary,
  },
  streakDotEmpty: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  goalCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    gap: 4,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  goalTrack: {
    marginTop: Spacing.sm,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusBg.skipped,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  goalPercent: {
    marginTop: Spacing.xs,
    color: Colors.navy,
  },
  insightCard: {
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    backgroundColor: Colors.statusBg.active,
    gap: Spacing.xs,
  },
  insightBody: {
    color: Colors.navy,
  },
});
