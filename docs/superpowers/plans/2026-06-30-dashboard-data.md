# 대시보드 실데이터 연동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SCR-06 대시보드 화면의 하드코딩 상수 5종을 Supabase 실데이터로 교체한다.

**Architecture:** `dashboardStore.ts`를 신규 생성해 Supabase 쿼리·계산 로직을 담고, `dashboard.tsx`는 하드코딩 상수를 제거하고 스토어를 구독한다. 스크린 포커스 시 `fetchDashboard()`를 호출해 항상 최신 데이터를 표시한다.

**Tech Stack:** React Native / Expo SDK 56, Zustand 5, @supabase/supabase-js 2, expo-router (useFocusEffect)

## Global Constraints

- TypeScript strict mode — 암묵적 `any` 금지, 모든 타입 명시
- Zustand 5 패턴 유지 — `create<T>()((set, get) => ...)` 형식
- 외부 패키지 추가 금지 — 이미 설치된 것만 사용
- `@/` 절대 경로 import 사용 (tsconfig paths)
- 컬러/스타일은 `@/constants/theme`의 `Colors`, `Typography`, `Radius`, `Spacing` 토큰만 사용
- `user_streaks` 뷰 컬럼: `total_completed_days` (scheduleStore와 동일)
- 기존 `WEEK_LABELS = ['월','화','수','목','금','토','일']` 유지 (static 레이블)
- weekPercents[i]는 이번 주 월(i=0)~일(i=6) 완료율, 미래 날짜는 0
- avgCompletionRate는 데이터가 있는 날(오늘 이전 포함)만의 평균

---

## 파일 목록

| 파일 | 유형 | 역할 |
|------|------|------|
| `src/stores/dashboardStore.ts` | 신규 생성 | 날짜 헬퍼, 계산 로직, Supabase 쿼리, Zustand 스토어 |
| `src/app/(tabs)/dashboard.tsx` | 수정 | 하드코딩 제거, 스토어 연결, 로딩·에러 상태 UI |

---

### Task 1: dashboardStore.ts 생성

**Files:**
- Create: `src/stores/dashboardStore.ts`

**Interfaces:**
- Produces:
  ```typescript
  export const useDashboardStore: () => DashboardState
  // DashboardState.weekLabel: string
  // DashboardState.weekPercents: number[]   (length 7)
  // DashboardState.streakDays14: boolean[]  (length 14)
  // DashboardState.kpi: { avgCompletionRate: number; streakDays: number; goalCompletionRate: number }
  // DashboardState.goal: { title: string; rolemodel: string; etaDays: number; percent: number } | null
  // DashboardState.insightText: string
  // DashboardState.loadStatus: 'idle' | 'loading' | 'error'
  // DashboardState.fetchDashboard: () => Promise<void>
  ```

- [ ] **Step 1: 파일 생성 및 타입 정의**

`src/stores/dashboardStore.ts`를 아래 내용으로 생성한다.

```typescript
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

// ─── 날짜 헬퍼 ────────────────────────────────────────────────

function getThisWeekMonday(): Date {
  const today = new Date();
  const day = today.getDay(); // 0=일, 1=월
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

function getWeekLabel(): string {
  const monday = getThisWeekMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.getMonth() + 1}월 ${monday.getDate()}일 - ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

// ─── 타입 ─────────────────────────────────────────────────────

type DashboardKpi = {
  avgCompletionRate: number;
  streakDays: number;
  goalCompletionRate: number;
};

type DashboardGoal = {
  title: string;
  rolemodel: string;
  etaDays: number;
  percent: number;
};

type DashboardState = {
  weekLabel: string;
  weekPercents: number[];
  streakDays14: boolean[];
  kpi: DashboardKpi;
  goal: DashboardGoal | null;
  insightText: string;
  loadStatus: 'idle' | 'loading' | 'error';
  fetchDashboard: () => Promise<void>;
};

// ─── 스토어 ───────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()((set) => ({
  weekLabel: '',
  weekPercents: Array(7).fill(0) as number[],
  streakDays14: Array(14).fill(false) as boolean[],
  kpi: { avgCompletionRate: 0, streakDays: 0, goalCompletionRate: 0 },
  goal: null,
  insightText: '',
  loadStatus: 'idle',

  fetchDashboard: async () => {
    set({ loadStatus: 'loading' });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loadStatus: 'error' });
      return;
    }

    try {
      const monday = getThisWeekMonday();
      const fourteenDaysAgo = daysAgo(13);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // 최근 14일 루틴 데이터 (이번 주 포함)
      const { data: scheduleData, error: schedError } = await supabase
        .from('daily_schedules')
        .select('date, routine_blocks(status)')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo)
        .order('date', { ascending: true });

      if (schedError) throw schedError;

      // 목표 정보
      const { data: goalData } = await supabase
        .from('goals')
        .select('title, rolemodel')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // 연속 스트릭
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('total_completed_days')
        .eq('user_id', user.id)
        .maybeSingle();

      // 날짜별 Map 구성
      type Block = { status: string };
      const byDate = new Map<string, Block[]>(
        (scheduleData ?? []).map((s) => [
          s.date,
          (s.routine_blocks as Block[] | null) ?? [],
        ])
      );

      // 이번 주 월(i=0)~일(i=6) 완료율, 미래 날짜는 0
      const weekPercents = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d > today) return 0;
        const date = toDateStr(d);
        const blocks = byDate.get(date) ?? [];
        if (blocks.length === 0) return 0;
        const done = blocks.filter((b) => b.status === 'done').length;
        return Math.round((done / blocks.length) * 100);
      });

      // 최근 14일 스트릭 캘린더 (rolling)
      const streakDays14 = Array.from({ length: 14 }, (_, i) => {
        const date = daysAgo(13 - i);
        const blocks = byDate.get(date) ?? [];
        return blocks.some((b) => b.status === 'done');
      });

      // 오늘까지 지난 날만으로 평균 계산
      const passedPercents = weekPercents.filter((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d <= today;
      });
      const avgCompletionRate =
        passedPercents.length === 0
          ? 0
          : Math.round(
              passedPercents.reduce((sum, p) => sum + p, 0) /
                passedPercents.length
            );

      const streakDays = streakData?.total_completed_days ?? 0;

      // D-N 추정 (avg=0이면 -1 → 화면에서 "분석 중..." 표시)
      const etaDays =
        avgCompletionRate === 0
          ? -1
          : Math.ceil(((100 - avgCompletionRate) / avgCompletionRate) * 7);

      // 인사이트 텍스트
      const maxPct = Math.max(...weekPercents);
      const bestIdx = weekPercents.indexOf(maxPct);
      const bestDay = DAY_NAMES[bestIdx];
      const rolemodel = goalData?.rolemodel ?? '롤모델';
      const insightText =
        maxPct === 0
          ? `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 첫 루틴을 체크인해 보세요!`
          : `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 ${bestDay}요일 완료율이 ${maxPct}%로 가장 높았어요.`;

      set({
        weekLabel: getWeekLabel(),
        weekPercents,
        streakDays14,
        kpi: {
          avgCompletionRate,
          streakDays,
          goalCompletionRate: avgCompletionRate,
        },
        goal: goalData
          ? {
              title: goalData.title,
              rolemodel: goalData.rolemodel,
              etaDays,
              percent: avgCompletionRate,
            }
          : null,
        insightText,
        loadStatus: 'idle',
      });
    } catch {
      set({ loadStatus: 'error' });
    }
  },
}));
```

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

기대 결과: 에러 없음. 에러가 있으면 타입 오류 수정 후 재실행.

- [ ] **Step 3: 커밋**

```bash
git add src/stores/dashboardStore.ts
git commit -m "feat: add dashboardStore with Supabase queries and computation"
```

---

### Task 2: dashboard.tsx 실데이터 연결

**Files:**
- Modify: `src/app/(tabs)/dashboard.tsx`

**Interfaces:**
- Consumes:
  ```typescript
  import { useDashboardStore } from '@/stores/dashboardStore';
  // weekLabel, weekPercents, streakDays14, kpi, goal, insightText, loadStatus, fetchDashboard
  ```

- [ ] **Step 1: dashboard.tsx 전체 교체**

기존 파일을 아래로 완전히 대체한다.

```typescript
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
```

주의: 요일별 완료율 차트에서 기존 `<Pressable onPress={() => router.push('/reflection')}>` 를 `<View>`로 교체했다. 대시보드에서 요일 탭을 눌러 회고로 이동하는 기능은 스펙 범위 밖이므로 제거한다.

- [ ] **Step 2: TypeScript 컴파일 확인**

```bash
npx tsc --noEmit
```

기대 결과: 에러 없음. `Spacing.screenMargin`, `Spacing.base`, `Spacing.section` 등 토큰이 없으면 `theme.ts`에서 실제 토큰명으로 교체.

- [ ] **Step 3: 앱에서 시각적 확인**

Metro 서버 시작:
```bash
npx expo start --port 8081 --clear
```

브라우저(웹)에서 `http://localhost:8081` 접속 → 대시보드 탭 이동.

확인 항목:
1. 헤더에 "X월 X일 - X월 X일" 형식의 날짜가 표시된다
2. KPI 카드 3개에 실제 수치가 표시된다 (로그인 후 기록 없으면 0%/0일도 정상)
3. 요일별 바 차트가 7개 렌더링된다
4. 스트릭 캘린더 점이 14개 렌더링된다
5. 목표가 있으면 목표 달성 예측 카드가 표시된다, 없으면 숨겨진다
6. 인사이트 카드가 표시된다

- [ ] **Step 4: 커밋**

```bash
git add src/app/(tabs)/dashboard.tsx
git commit -m "feat: connect dashboard screen to real Supabase data"
```
