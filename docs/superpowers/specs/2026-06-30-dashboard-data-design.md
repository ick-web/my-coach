# 설계 문서: SCR-06 대시보드 실데이터 연동

**날짜:** 2026-06-30
**상태:** 승인됨
**범위:** dashboardStore 신규 생성 + dashboard.tsx 하드코딩 제거

---

## 1. 목표

SCR-06 대시보드 화면의 하드코딩 상수 5종(요일별 완료율, 스트릭 캘린더, KPI 3개, 목표 진행률, 인사이트 텍스트)을 Supabase 실데이터로 교체한다.

---

## 2. 아키텍처

```
dashboard.tsx
  └─ useDashboardStore() (신규)
        └─ fetchDashboard()
              ├─ goals 테이블: is_active=true → title, rolemodel
              ├─ daily_schedules + routine_blocks 조인: 최근 14일
              │     └─ 날짜별 done/total 계산
              └─ user_streaks 뷰: 연속 스트릭 일수
```

**변경 파일:**

| 파일 | 유형 | 내용 |
|------|------|------|
| `src/stores/dashboardStore.ts` | 신규 | Supabase 쿼리 + 계산 로직 |
| `src/app/(tabs)/dashboard.tsx` | 수정 | 하드코딩 제거, 스토어 연결 |

---

## 3. 스토어 상태 타입

```typescript
type DashboardState = {
  weekLabel: string;          // "6월 23일 - 6월 29일" (이번 주 월~일)
  weekPercents: number[];     // 최근 7일 요일별 완료율 [월,화,...,일] (0~100)
  streakDays14: boolean[];    // 최근 14일 완료 여부 (오래된 날부터, true=완료)
  kpi: {
    avgCompletionRate: number; // weekPercents 평균 (소수점 없이 반올림)
    streakDays: number;        // user_streaks 뷰의 연속 스트릭
    goalCompletionRate: number; // avgCompletionRate와 동일
  };
  goal: {
    title: string;
    rolemodel: string;
    etaDays: number;           // D-N, -1이면 데이터 부족(avg=0)
    percent: number;           // avgCompletionRate와 동일
  } | null;
  insightText: string;
  loadStatus: 'idle' | 'loading' | 'error';
  fetchDashboard: () => Promise<void>;
};
```

---

## 4. Supabase 쿼리

### 4-1. 최근 14일 루틴 데이터

```typescript
const { data: scheduleData } = await supabase
  .from('daily_schedules')
  .select('date, routine_blocks(status)')
  .eq('user_id', user.id)
  .gte('date', fourteenDaysAgo)   // YYYY-MM-DD 형식
  .order('date', { ascending: true });
```

반환 구조:
```typescript
[{ date: '2026-06-17', routine_blocks: [{ status: 'done' }, { status: 'skipped' }] }]
```

### 4-2. 목표 정보

```typescript
const { data: goalData } = await supabase
  .from('goals')
  .select('title, rolemodel')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();
```

### 4-3. 연속 스트릭

```typescript
const { data: streakData } = await supabase
  .from('user_streaks')
  .select('streak_days')
  .eq('user_id', user.id)
  .single();
```

---

## 5. 계산 로직

### 날짜 헬퍼

```typescript
// 오늘 기준 이번 주 월요일 ~ 일요일
function getWeekLabel(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.getMonth() + 1}월 ${monday.getDate()}일 - ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
}

// 오늘 기준 N일 전 날짜 (YYYY-MM-DD)
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}
```

### 요일별 완료율 (weekPercents)

- 오늘 기준 7일 전부터 오늘까지 (7개 날짜)
- 각 날짜별: `done_count / total_count * 100` (소수점 없이 반올림)
- 해당 날짜 데이터 없으면 0

```typescript
// scheduleData에서 날짜별 Map 생성
const byDate = new Map(scheduleData.map(s => [s.date, s.routine_blocks]));

const weekPercents = Array.from({ length: 7 }, (_, i) => {
  const date = daysAgo(6 - i); // i=0: 6일 전(월), i=6: 오늘(일)
  const blocks = byDate.get(date) ?? [];
  if (blocks.length === 0) return 0;
  const done = blocks.filter(b => b.status === 'done').length;
  return Math.round((done / blocks.length) * 100);
});
```

### 스트릭 캘린더 (streakDays14)

- 최근 14일 각 날짜에 `done` 블록이 1개 이상이면 true

```typescript
const streakDays14 = Array.from({ length: 14 }, (_, i) => {
  const date = daysAgo(13 - i);
  const blocks = byDate.get(date) ?? [];
  return blocks.some(b => b.status === 'done');
});
```

### KPI 계산

```typescript
const avgCompletionRate = Math.round(
  weekPercents.reduce((sum, p) => sum + p, 0) / 7
);
const streakDays = streakData?.streak_days ?? 0;
```

### D-N 계산

```typescript
// 최근 7일 평균 완료율 기반 선형 추정
// avg=0이면 etaDays=-1 (데이터 부족)
const etaDays = avgCompletionRate === 0
  ? -1
  : Math.ceil((100 - avgCompletionRate) / avgCompletionRate * 7);
```

### 인사이트 텍스트

```typescript
const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
const bestIdx = weekPercents.indexOf(Math.max(...weekPercents));
const bestDay = DAY_NAMES[bestIdx];
const bestPct = weekPercents[bestIdx];
const rolemodel = goalData?.rolemodel ?? '롤모델';

const insightText = bestPct === 0
  ? `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 첫 루틴을 체크인해 보세요!`
  : `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 ${bestDay}요일 완료율이 ${bestPct}%로 가장 높았어요.`;
```

---

## 6. 에러 처리

| 상황 | 처리 |
|------|------|
| 비로그인 | `loadStatus: 'error'`, 화면에 "데이터를 불러올 수 없어요" 표시 |
| Supabase 쿼리 실패 | `loadStatus: 'error'` |
| 14일 데이터 0건 | 빈 배열 처리, weekPercents 전체 0, streakDays14 전체 false |
| goal 없음 | `goal: null` → 화면에서 목표 카드 숨김 |
| avg=0 | etaDays=-1 → 화면에서 "분석 중..." 표시 (D-N 숨김) |

---

## 7. dashboard.tsx 변경

- 상단 상수 5개 (`WEEK_PERCENTS`, `WEEK_LABELS`, `STREAK_DAYS`, `GOAL_PROGRESS`) 제거
- `useDashboardStore()` import 추가
- `useFocusEffect` + `useCallback`으로 화면 포커스 시 `fetchDashboard()` 호출
- `loadStatus === 'loading'` 시 화면 중앙에 "로딩 중..." 텍스트
- `loadStatus === 'error'` 시 화면 중앙에 "데이터를 불러올 수 없어요" 텍스트
- 각 UI 컴포넌트를 스토어 값으로 교체:
  - `WEEK_PERCENTS[i]` → `weekPercents[i]`
  - `STREAK_DAYS[i]` → `streakDays14[i]`
  - KPI 값 → `kpi.avgCompletionRate`, `kpi.streakDays`, `kpi.goalCompletionRate`
  - 목표 카드 → `goal.title`, `goal.etaDays`, `goal.percent`
  - 헤더 날짜 → `weekLabel`
  - 인사이트 텍스트 → `insightText`

---

## 8. 제외 범위

- 롤모델 인사이트 Claude API 동적 생성 — `/feedback` 엔드포인트 작업(우선순위 3)에서 처리
- D-N 계산 방법 변경 (고정 목표 기간, ML 예측 등) — v1.1 이후
- 주간 날짜 헤더 탭으로 변경 (오늘/지난주 전환) — v1.1 이후
