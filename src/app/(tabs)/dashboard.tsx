import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InfoIcon } from '@/components/icons/MiscIcons';
import { KpiCard } from '@/components/ui/Card';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useDashboardStore } from '@/stores/dashboardStore';

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function DashboardScreen() {
  const {
    weekLabel,
    weekPercents,
    streakDays14,
    kpi,
    goal,
    insightText,
    loadStatus,
    fetchDashboard,
  } = useDashboardStore();

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  if (loadStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (loadStatus === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Text style={Typography.subtext}>데이터를 불러올 수 없어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={Typography.sectionTitle}>주간 대시보드</Text>
        <Text style={Typography.subtext}>{weekLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.kpiRow}>
          <KpiCard label="평균 완료율" value={`${kpi.avgCompletionRate}%`} />
          <KpiCard label="연속 스트릭" value={`${kpi.streakDays}일`} />
          <KpiCard label="목표 달성률" value={`${kpi.goalCompletionRate}%`} />
        </View>

        <View style={styles.chartCard}>
          <Text style={Typography.sectionTitle}>요일별 완료율</Text>
          <Text style={[Typography.subtext, styles.chartSubtitle]}>최근 7일 체크인 기록 기준</Text>
          <View style={styles.chart}>
            {weekPercents.map((percent, i) => (
              <View key={WEEK_LABELS[i]} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${percent}%` }]} />
                </View>
                <Text style={Typography.subtext}>{WEEK_LABELS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={Typography.sectionTitle}>스트릭 캘린더</Text>
          <Text style={[Typography.subtext, styles.chartSubtitle]}>최근 2주간 완료 현황</Text>
          <View style={styles.streakGrid}>
            {streakDays14.map((done, i) => (
              <View
                key={i}
                style={[styles.streakDot, done ? styles.streakDotDone : styles.streakDotEmpty]}
              />
            ))}
          </View>
        </View>

        {goal && (
          <View style={styles.goalCard}>
            <View style={styles.goalTitleRow}>
              <Text style={Typography.sectionTitle}>목표 달성 예측</Text>
              <InfoIcon />
            </View>
            <Text style={[Typography.subtext, styles.chartSubtitle]}>
              {goal.title} · {goal.etaDays === -1 ? '분석 중...' : `예상 달성일 D-${goal.etaDays}`}
            </Text>
            <View style={styles.goalTrack}>
              <View style={[styles.goalFill, { width: `${goal.percent}%` }]} />
            </View>
            <Text style={[Typography.statValue, styles.goalPercent]}>{goal.percent}%</Text>
            <Text style={Typography.subtext}>최근 7일 완료율 기준 산출</Text>
          </View>
        )}

        {insightText !== '' && (
          <View style={styles.insightCard}>
            <Text style={Typography.sectionTitle}>롤모델 인사이트</Text>
            <Text style={[Typography.body, styles.insightBody]}>{insightText}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
