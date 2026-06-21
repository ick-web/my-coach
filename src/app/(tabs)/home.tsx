import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BellIcon, CalendarIcon, GearIcon, PlusIcon, RefreshIcon, WarningIcon } from '@/components/icons/MiscIcons';
import { Button } from '@/components/ui/Button';
import { AiBannerCard, ProgressCard } from '@/components/ui/Card';
import { RoutineItem } from '@/components/ui/RoutineItem';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useScheduleStore } from '@/stores/scheduleStore';

export default function HomeScreen() {
  const { blocks, loadStatus, streakDays } = useScheduleStore();
  const completed = blocks.filter((b) => b.status === 'done').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>안녕하세요, 이준혁님</Text>
        <View style={styles.headerIcons}>
          <View style={styles.iconCircle}>
            <BellIcon />
          </View>
          <Pressable style={styles.iconCircle} onPress={() => router.push('/settings')}>
            <GearIcon />
          </Pressable>
        </View>
      </View>

      {loadStatus === 'error' && <ErrorState />}
      {loadStatus === 'empty' && <EmptyState />}
      {(loadStatus === 'idle' || loadStatus === 'loading') && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable onPress={() => router.push('/dashboard')}>
            <ProgressCard
              title="오늘 진척도"
              completed={completed}
              total={blocks.length}
              streakDays={streakDays}
            />
          </Pressable>

          <AiBannerCard title="AI 추천" description="오전 집중 시간에 맞춰 루틴을 재배치해보세요." />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={Typography.sectionTitle}>오늘의 루틴</Text>
              <Button label="편집" variant="small-secondary" onPress={() => router.push('/schedule')} />
            </View>
            <View style={styles.routineList}>
              {blocks.map((block) => (
                <RoutineItem
                  key={block.id}
                  {...block}
                  onPress={() => router.push(`/checkin?id=${block.id}`)}
                />
              ))}
            </View>
          </View>

          <Pressable style={styles.reflectionRow} onPress={() => router.push('/reflection')}>
            <Text style={styles.reflectionLabel}>오늘 하루 회고 작성하기</Text>
            <Text style={Typography.subtext}>이번 주 3회 중 1회 작성됨</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.centerState}>
      <CalendarIcon />
      <Text style={Typography.sectionTitle}>오늘 등록된 루틴이 없어요</Text>
      <Text style={[Typography.subtext, styles.centerSubtitle]}>
        AI로 루틴을 생성하거나 직접 추가해보세요.
      </Text>
      <View style={styles.emptyActions}>
        <Button label="AI로 루틴 생성하기" fullWidth onPress={() => {}} />
        <View style={styles.addRoutineRow}>
          <PlusIcon />
          <Text style={styles.addRoutineText}>직접 루틴 추가하기</Text>
        </View>
      </View>
    </View>
  );
}

function ErrorState() {
  const fetchToday = useScheduleStore((s) => s.fetchToday);
  return (
    <View style={styles.centerState}>
      <WarningIcon />
      <Text style={Typography.sectionTitle}>일정을 불러오지 못했어요</Text>
      <Text style={[Typography.subtext, styles.centerSubtitle]}>
        네트워크 상태를 확인한 뒤 다시 시도해주세요.
      </Text>
      <Pressable style={styles.retryRow} onPress={fetchToday}>
        <RefreshIcon />
        <Text style={styles.retryText}>다시 시도하기</Text>
      </Pressable>
    </View>
  );
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
  headerTitle: {
    ...Typography.sectionTitle,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.statusBg.skipped,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
    alignItems: 'center',
  },
  section: {
    width: '100%',
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineList: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  reflectionRow: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardSm,
    padding: Spacing.base,
    gap: 4,
  },
  reflectionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.navy,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.section,
    gap: Spacing.sm,
  },
  centerSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  emptyActions: {
    width: '100%',
    gap: Spacing.base,
    alignItems: 'center',
  },
  addRoutineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addRoutineText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.base,
  },
  retryText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
