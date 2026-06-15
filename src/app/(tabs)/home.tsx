import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoutineStatus } from '@/components/icons/RoutineStatusIcons';
import { BellIcon, CalendarIcon, GearIcon, PlusIcon, RefreshIcon, WarningIcon } from '@/components/icons/MiscIcons';
import { Button } from '@/components/ui/Button';
import { AiBannerCard, ProgressCard } from '@/components/ui/Card';
import { RoutineItem } from '@/components/ui/RoutineItem';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

// 데이터 연동 전 화면 상태 확인용 (default | empty | error)
const HOME_STATE: 'default' | 'empty' | 'error' = 'default';

const DUMMY_ROUTINES: { time: string; task: string; duration: string; status: RoutineStatus }[] = [
  { time: '07:00', task: '아침 스트레칭', duration: '15분', status: 'done' },
  { time: '08:00', task: '영어 회화 공부', duration: '30분', status: 'done' },
  { time: '10:00', task: '포트폴리오 작업', duration: '90분', status: 'active' },
  { time: '14:00', task: '이력서 첨삭', duration: '40분', status: 'delayed' },
  { time: '18:00', task: '저녁 운동', duration: '30분', status: 'todo' },
  { time: '21:00', task: '독서', duration: '20분', status: 'skipped' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>안녕하세요, 이준혁님</Text>
        <View style={styles.headerIcons}>
          <View style={styles.iconCircle}>
            <BellIcon />
          </View>
          {/* ⚙️ 아이콘 탭 → SCR-07 알림 설정 */}
          <Pressable style={styles.iconCircle} onPress={() => router.push('/settings')}>
            <GearIcon />
          </Pressable>
        </View>
      </View>

      {HOME_STATE === 'error' && <ErrorState />}
      {HOME_STATE === 'empty' && <EmptyState />}
      {HOME_STATE === 'default' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 진척률 카드 탭 → SCR-06 주간 대시보드 */}
          <Pressable onPress={() => router.push('/dashboard')}>
            <ProgressCard
              title="오늘 진척도"
              completed={DUMMY_ROUTINES.filter((r) => r.status === 'done').length}
              total={DUMMY_ROUTINES.length}
              streakDays={12}
            />
          </Pressable>

          <AiBannerCard title="AI 추천" description="오전 집중 시간에 맞춰 루틴을 재배치해보세요." />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={Typography.sectionTitle}>오늘의 루틴</Text>
              {/* 편집 버튼 → SCR-03 스케줄 수정 */}
              <Button label="편집" variant="small-secondary" onPress={() => router.push('/schedule')} />
            </View>
            <View style={styles.routineList}>
              {/* 루틴 항목 탭 → SCR-04 체크인 모달 */}
              {DUMMY_ROUTINES.map((routine) => (
                <RoutineItem key={routine.time} {...routine} onPress={() => router.push('/checkin')} />
              ))}
            </View>
          </View>

          {/* 저녁회고 항목 탭 → SCR-05 저녁 회고 카드 */}
          <Pressable style={styles.reflectionRow} onPress={() => router.push('/reflection')}>
            <Text style={styles.reflectionLabel}>오늘 하루 회고 작성하기</Text>
            <Text style={Typography.subtext}>이번 주 3회 중 1회 작성됨</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** SCR-10c: 빈 상태 (오늘 루틴 없음) */
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

/** SCR-10d: 에러 상태 (일정 로드/생성 실패) */
function ErrorState() {
  return (
    <View style={styles.centerState}>
      <WarningIcon />
      <Text style={Typography.sectionTitle}>일정을 불러오지 못했어요</Text>
      <Text style={[Typography.subtext, styles.centerSubtitle]}>
        네트워크 상태를 확인한 뒤 다시 시도해주세요.
      </Text>
      <View style={styles.retryRow}>
        <RefreshIcon />
        <Text style={styles.retryText}>다시 시도하기</Text>
      </View>
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
