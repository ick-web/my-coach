import { StyleSheet, Text, View } from 'react-native';

import { SparkleIcon } from '@/components/icons/MiscIcons';
import { Colors, Radius, Sizes, Spacing, Typography } from '@/constants/theme';

type ProgressCardProps = {
  title: string;
  completed: number;
  total: number;
  streakDays?: number;
};

export function ProgressCard({ title, completed, total, streakDays }: ProgressCardProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <View style={[styles.card, styles.progressCard]}>
      <View style={styles.progressHeader}>
        <Text style={[Typography.subtext, styles.progressLabel]}>{title}</Text>
        {streakDays != null && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 스트릭 {streakDays}일째!</Text>
          </View>
        )}
      </View>
      <View style={styles.progressMain}>
        <Text style={[Typography.statValue, styles.countText]}>
          {completed} / {total}
        </Text>
        <Text style={[Typography.body, styles.percentText]}>완료 · {percent}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
      </View>
    </View>
  );
}

type KpiCardProps = {
  label: string;
  value: string;
};

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <View style={[styles.card, styles.kpiCard]}>
      <Text style={Typography.subtext}>{label}</Text>
      <Text style={[Typography.statValue, styles.kpiValue]}>{value}</Text>
    </View>
  );
}

type AiBannerCardProps = {
  title: string;
  description: string;
};

export function AiBannerCard({ title, description }: AiBannerCardProps) {
  return (
    <View style={[styles.card, styles.aiBanner]}>
      <SparkleIcon color={Colors.primary} size={20} />
      <View style={styles.aiBannerText}>
        <Text style={styles.aiBannerTitle}>{title}</Text>
        <Text style={Typography.subtext}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressCard: {
    width: Sizes.cardProgress.width,
    minHeight: Sizes.cardProgress.minHeight,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#93C5FD',
  },
  streakBadge: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  streakText: {
    ...Typography.subtext,
    color: Colors.orange,
    fontWeight: '700',
  },
  progressMain: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  countText: {
    color: '#fff',
  },
  percentText: {
    color: '#DBEAFE',
  },
  progressTrack: {
    marginTop: Spacing.sm,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  kpiCard: {
    width: Sizes.cardKpi.width,
    height: Sizes.cardKpi.height,
    borderRadius: Radius.cardLg,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  kpiValue: {
    color: Colors.navy,
  },
  aiBanner: {
    width: Sizes.cardProgress.width,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.statusBg.active,
    borderColor: Colors.statusBg.active,
  },
  aiBannerText: {
    flex: 1,
    gap: 2,
  },
  aiBannerTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.navy,
  },
});
