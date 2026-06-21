import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoutineStatusIcon } from '@/components/icons/RoutineStatusIcons';
import { Button } from '@/components/ui/Button';
import { AiBannerCard } from '@/components/ui/Card';
import { Colors, Radius, Sizes, Spacing, Typography } from '@/constants/theme';
import { useScheduleStore } from '@/stores/scheduleStore';

function DragHandle() {
  return (
    <View style={styles.dragHandle}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.dragDot} />
      ))}
    </View>
  );
}

export default function ScheduleScreen() {
  const { blocks, date, fetchToday } = useScheduleStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={Typography.sectionTitle}>스케줄 수정</Text>
          <Text style={Typography.subtext}>{formatDate(date)}</Text>
        </View>
        <Button label="초기화" variant="small-secondary" onPress={fetchToday} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AiBannerCard title="AI 제안" description="포트폴리오 작업을 오전으로 옮기면 집중도가 높아져요." />

        <Text style={[Typography.subtext, styles.dragHint]}>
          ↕ 길게 눌러 드래그하여 순서를 변경하세요
        </Text>

        <View style={styles.list}>
          {blocks.map((block) => {
            const StatusIcon = RoutineStatusIcon[block.status];
            return (
              <View key={block.id} style={styles.row}>
                <StatusIcon size={24} />
                <View style={styles.middle}>
                  <Text style={styles.task}>{block.task}</Text>
                  <Text style={Typography.subtext}>
                    {block.time} · {block.duration}
                  </Text>
                </View>
                <DragHandle />
              </View>
            );
          })}
        </View>

        <Button label="+ 직접 루틴 추가하기" variant="ghost" fullWidth onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenMargin,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
    alignItems: 'center',
  },
  dragHint: {
    width: '100%',
    textAlign: 'left',
  },
  list: {
    width: '100%',
    gap: Spacing.sm,
  },
  row: {
    width: Sizes.routineItem.width,
    minHeight: Sizes.routineItem.minHeight,
    borderRadius: Radius.cardSm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  task: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  dragHandle: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tabInactive,
  },
});
