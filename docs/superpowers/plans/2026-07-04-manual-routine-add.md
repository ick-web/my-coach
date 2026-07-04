# 직접 루틴 추가하기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `home.tsx`/`schedule.tsx`의 미구현 "직접 루틴 추가하기" CTA를 실제로 동작하게 만든다 — 바텀시트 모달에서 할 일/시간/소요시간을 입력하면 오늘 스케줄에 루틴이 추가된다.

**Architecture:** `scheduleStore`에 `addBlock` 액션을 추가해 Supabase에 insert(필요 시 `daily_schedules` 선-생성 후 `routine_blocks` insert) → 로컬 상태 낙관적 갱신. 새 모달 화면 `(modals)/add-routine.tsx`가 이 액션을 호출하고, `home.tsx`/`schedule.tsx`의 기존 CTA에서 라우팅으로 연결한다.

**Tech Stack:** React Native / Expo Router v4, Zustand 5, @supabase/supabase-js 2, TypeScript. 이 프로젝트에는 Jest/테스트 러너가 설정되어 있지 않으므로(기존 기능들도 전부 수동/curl/DB 검증 방식) 각 태스크의 검증은 `npx tsc --noEmit` 타입체크 + Supabase 데이터 직접 조회 + Expo 웹 실행 후 수동 클릭 테스트로 한다.

## Global Constraints

- DB 스키마는 변경하지 않는다 — `routine_blocks.time`은 `text`("HH:MM" 형식), `duration_minutes`는 `integer > 0`, `status`는 `'todo'|'active'|'done'|'delayed'|'skipped'` 중 신규 루틴은 항상 `'todo'` (마이그레이션: `supabase/migrations/20260618000000_initial_schema.sql:34-47`).
- 기존 디자인 토큰만 사용한다: `Colors`/`Typography`/`Radius`/`Spacing` (`src/constants/theme.ts`). 새 색상/치수 값을 하드코딩하지 않는다.
- 기존 모달 패턴(`src/app/(modals)/checkin.tsx`)의 오버레이+시트 구조, 스테퍼 UI 패턴을 그대로 재사용한다.
- 새 화면은 `_layout.tsx`의 `Stack`에 `presentation: 'modal'`로 등록해야 슬라이드업 표시된다.
- 커밋 메시지는 한국어로 작성한다.

---

### Task 1: `scheduleStore`에 `addBlock` 액션 추가

**Files:**
- Modify: `mobile/src/stores/scheduleStore.ts:8-22` (타입에 액션 추가), `mobile/src/stores/scheduleStore.ts:131-145` 이후에 액션 구현 추가

**Interfaces:**
- Consumes: 기존 `ScheduleState`의 `date`, `scheduleId`, `blocks`, `set`, `get` (동일 파일 내 기존 패턴)
- Produces: `addBlock: (time: string, task: string, durationMinutes: number) => Promise<void>` — Task 3(모달 UI)이 이 시그니처로 호출한다.

- [ ] **Step 1: `ScheduleState` 타입에 액션 선언 추가**

`mobile/src/stores/scheduleStore.ts`의 `ScheduleState` 타입(8~22번 줄) 마지막에 추가:

```typescript
  // 루틴 직접 추가
  addBlock: (time: string, task: string, durationMinutes: number) => Promise<void>;
```

- [ ] **Step 2: `addBlock` 구현 추가**

`mobile/src/stores/scheduleStore.ts`의 `reorderBlocks` 액션(131~144번 줄) 바로 뒤, 객체를 닫는 `}))` 앞에 추가:

```typescript
  addBlock: async (time, task, durationMinutes) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let scheduleId = get().scheduleId;
    const date = get().date;

    if (!scheduleId) {
      const { data: newSchedule, error: createErr } = await supabase
        .from('daily_schedules')
        .insert({ user_id: user.id, date })
        .select('id')
        .single();

      if (createErr || !newSchedule) return;
      scheduleId = newSchedule.id;
    }

    const durationLabel = `${durationMinutes}분`;
    const sortOrder = get().blocks.length;

    const { data: row, error: insertErr } = await supabase
      .from('routine_blocks')
      .insert({
        schedule_id: scheduleId,
        user_id: user.id,
        time,
        task,
        duration_label: durationLabel,
        duration_minutes: durationMinutes,
        status: 'todo',
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertErr || !row) return;

    set((s) => ({
      scheduleId,
      loadStatus: 'idle',
      blocks: [
        ...s.blocks,
        {
          id: row.id,
          time: row.time,
          task: row.task,
          duration: row.duration_label,
          durationMinutes: row.duration_minutes,
          status: row.status as RoutineStatus,
        },
      ],
    }));
  },
```

- [ ] **Step 3: 타입체크로 검증**

Run: `cd mobile && npx tsc --noEmit`
Expected: 에러 없음 (기존 에러가 있었다면 그 개수에서 늘어나지 않아야 함)

- [ ] **Step 4: Supabase에서 스키마 재확인 (선택 방어 확인)**

Run (mobile 디렉토리에서, 이미 설정된 `.env`의 프로젝트 기준):
```bash
cd mobile && grep -A2 "create table public.routine_blocks" supabase/migrations/20260618000000_initial_schema.sql
```
Expected: `time text not null`, `duration_minutes integer not null check (duration_minutes > 0)`, `status ... default 'todo'` — Step 2 코드의 insert 페이로드와 컬럼명/타입이 일치하는지 육안 확인.

- [ ] **Step 5: 커밋**

```bash
cd mobile && git add src/stores/scheduleStore.ts
git commit -m "$(cat <<'EOF'
scheduleStore에 addBlock 액션 추가

루틴 직접 추가 기능을 위한 DB insert 로직. 오늘 스케줄이 없으면
daily_schedules를 먼저 생성한 뒤 routine_blocks를 추가한다.
EOF
)"
```

---

### Task 2: "직접 루틴 추가" 바텀시트 모달 화면 작성

**Files:**
- Create: `mobile/src/app/(modals)/add-routine.tsx`

**Interfaces:**
- Consumes: `useScheduleStore().addBlock(time, task, durationMinutes)` (Task 1에서 정의한 시그니처), `Button`(`@/components/ui/Button`), `Input`(`@/components/ui/Input`), `Colors`/`Radius`/`Spacing`/`Typography`(`@/constants/theme`)
- Produces: 라우트 `/add-routine` — Task 3에서 `router.push('/add-routine')`으로 진입한다.

- [ ] **Step 1: 모달 파일 작성**

`mobile/src/app/(modals)/add-routine.tsx` 전체 내용:

```typescript
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useScheduleStore } from '@/stores/scheduleStore';

const MINUTE_STEPS = [0, 10, 20, 30, 40, 50];

export default function AddRoutineModal() {
  const addBlock = useScheduleStore((s) => s.addBlock);

  const [task, setTask] = useState('');
  const [hour, setHour] = useState(9);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [duration, setDuration] = useState(30);

  const close = () => router.back();

  const handleSubmit = () => {
    const time = `${String(hour).padStart(2, '0')}:${String(MINUTE_STEPS[minuteIndex]).padStart(2, '0')}`;
    addBlock(time, task.trim(), duration);
    close();
  };

  const canSubmit = task.trim().length > 0;

  return (
    <Pressable style={styles.overlay} onPress={close}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.handle} />

        <Text style={Typography.sectionTitle}>직접 루틴 추가하기</Text>

        <Input
          label="할 일"
          placeholder="예: 포트폴리오 작업"
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>시작 시간</Text>
          <View style={styles.timeRow}>
            <Stepper
              value={`${String(hour).padStart(2, '0')}시`}
              onDecrease={() => setHour((h) => (h + 23) % 24)}
              onIncrease={() => setHour((h) => (h + 1) % 24)}
            />
            <Stepper
              value={`${String(MINUTE_STEPS[minuteIndex]).padStart(2, '0')}분`}
              onDecrease={() => setMinuteIndex((i) => (i + MINUTE_STEPS.length - 1) % MINUTE_STEPS.length)}
              onIncrease={() => setMinuteIndex((i) => (i + 1) % MINUTE_STEPS.length)}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>소요 시간</Text>
          <Stepper
            value={`${duration}분`}
            onDecrease={() => setDuration((d) => Math.max(5, d - 5))}
            onIncrease={() => setDuration((d) => d + 5)}
            fullWidth
          />
        </View>

        <View style={styles.actions}>
          <Button label="추가하기" fullWidth disabled={!canSubmit} onPress={handleSubmit} />
          <Button label="취소" variant="ghost" fullWidth onPress={close} />
        </View>
      </Pressable>
    </Pressable>
  );
}

function Stepper({
  value,
  onDecrease,
  onIncrease,
  fullWidth,
}: {
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.stepper, fullWidth && styles.stepperFullWidth]}>
      <Pressable style={styles.stepperButton} onPress={onDecrease}>
        <Text style={styles.stepperButtonText}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable style={styles.stepperButton} onPress={onIncrease}>
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: Radius.cardLg,
    borderTopRightRadius: Radius.cardLg,
    padding: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  stepperFullWidth: {
    width: '100%',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.statusBg.skipped,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    ...Typography.sectionTitle,
    color: Colors.navy,
  },
  stepperValue: {
    ...Typography.statValue,
    color: Colors.text,
  },
  actions: {
    gap: Spacing.md,
  },
});
```

- [ ] **Step 2: 타입체크로 검증**

Run: `cd mobile && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
cd mobile && git add src/app/\(modals\)/add-routine.tsx
git commit -m "$(cat <<'EOF'
직접 루틴 추가 바텀시트 모달 화면 추가

할 일 이름 + 시/분 스테퍼 + 소요시간 스테퍼로 루틴을 입력받아
scheduleStore.addBlock을 호출한다.
EOF
)"
```

---

### Task 3: 모달 라우트 등록 + 두 진입점 연결

**Files:**
- Modify: `mobile/src/app/_layout.tsx:39-42`
- Modify: `mobile/src/app/(tabs)/home.tsx:100-106` (EmptyState 내부 `addRoutineRow`)
- Modify: `mobile/src/app/(tabs)/schedule.tsx:66`

**Interfaces:**
- Consumes: Task 2에서 만든 라우트 `/add-routine`

- [ ] **Step 1: `_layout.tsx`에 모달 스택 등록**

`mobile/src/app/_layout.tsx`의 기존 `Stack.Screen` 목록(현재 39~42번 줄):

```typescript
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(modals)/checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modals)/reflection" options={{ presentation: 'modal' }} />
      </Stack>
```

를 다음으로 교체:

```typescript
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(modals)/checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modals)/reflection" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modals)/add-routine" options={{ presentation: 'modal' }} />
      </Stack>
```

- [ ] **Step 2: `schedule.tsx`의 CTA 버튼 연결**

`mobile/src/app/(tabs)/schedule.tsx` 66번째 줄:

```typescript
        <Button label="+ 직접 루틴 추가하기" variant="ghost" fullWidth onPress={() => {}} />
```

를 다음으로 교체:

```typescript
        <Button
          label="+ 직접 루틴 추가하기"
          variant="ghost"
          fullWidth
          onPress={() => router.push('/add-routine')}
        />
```

이 파일 상단 import에 `router`가 없으므로, 1번째 줄:

```typescript
import { useFocusEffect } from 'expo-router';
```

을 다음으로 교체:

```typescript
import { router, useFocusEffect } from 'expo-router';
```

- [ ] **Step 3: `home.tsx`의 EmptyState CTA를 탭 가능하게 변경**

`mobile/src/app/(tabs)/home.tsx`의 `EmptyState` 함수(92~109번 줄) 중 `addRoutineRow` 부분(100~105번 줄):

```typescript
        <View style={styles.addRoutineRow}>
          <PlusIcon />
          <Text style={styles.addRoutineText}>직접 루틴 추가하기</Text>
        </View>
```

를 다음으로 교체:

```typescript
        <Pressable style={styles.addRoutineRow} onPress={() => router.push('/add-routine')}>
          <PlusIcon />
          <Text style={styles.addRoutineText}>직접 루틴 추가하기</Text>
        </Pressable>
```

(`home.tsx`는 이미 3번째 줄에서 `Pressable`을 import하고 있고, 1번째 줄에서 `router`도 이미 import하고 있으므로 import 수정은 불필요 — 각각 38, 48번 줄에서 이미 사용 중임을 확인.)

- [ ] **Step 4: 타입체크로 검증**

Run: `cd mobile && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 5: Expo 웹으로 수동 동작 확인**

Run: `cd mobile && npx expo start --port 8081 --clear` (백그라운드 실행 후 브라우저에서 `w` 또는 `http://localhost:8081` 접속)

확인 항목:
1. 오늘 등록된 루틴이 없는 계정으로 홈 화면 진입 → "직접 루틴 추가하기" 탭 → 모달이 슬라이드업으로 열리는지
2. 할 일 이름을 비워둔 채로는 "추가하기" 버튼이 비활성(회색)인지
3. 할 일 이름 입력 + 시/분/소요시간 스테퍼 조작 후 "추가하기" 탭 → 모달이 닫히고 홈 화면에 새 루틴이 목록에 나타나는지 (todo 상태 아이콘으로)
4. 스케줄 수정 탭(`/schedule`)에서도 동일하게 "+ 직접 루틴 추가하기" 버튼으로 같은 모달이 열리고, 추가 후 목록 맨 아래에 반영되는지
5. 오버레이 배경(시트 바깥) 탭 시 "취소"와 동일하게 저장 없이 닫히는지

Expected: 위 5가지 모두 통과. 실패 시 systematic-debugging 스킬로 원인 파악.

- [ ] **Step 6: 커밋**

```bash
cd mobile && git add src/app/_layout.tsx "src/app/(tabs)/home.tsx" "src/app/(tabs)/schedule.tsx"
git commit -m "$(cat <<'EOF'
직접 루틴 추가 모달을 홈/스케줄 화면 CTA에 연결

빈 함수였던 onPress를 라우팅으로 교체하고 _layout.tsx에 모달 스택 등록.
EOF
)"
```

---

### Task 4: `NewHuman/mobile/CLAUDE.md` 문서 갱신

**Files:**
- Modify: `NewHuman/mobile/CLAUDE.md` "다음 확인 필요" 섹션

**Interfaces:** 없음 (문서만 갱신)

- [ ] **Step 1: "다음 확인 필요" 섹션에서 완료 항목 반영**

`NewHuman/mobile/CLAUDE.md`의 다음 줄을 찾는다:

```markdown
- [ ] `schedule.tsx`/`home.tsx`의 "+ 직접 루틴 추가하기" — 버튼은 있지만 `onPress`가 빈 함수라 미구현
      상태 (SCR-10c/10d 화면 정의에는 있는 CTA이나 폼/모달/DB insert 로직 없음)
```

이를 다음으로 교체:

```markdown
- [x] `schedule.tsx`/`home.tsx`의 "+ 직접 루틴 추가하기" — `(modals)/add-routine.tsx` 바텀시트 +
      `scheduleStore.addBlock`으로 구현 완료 (2026-07-04)
```

- [ ] **Step 2: 커밋**

```bash
cd mobile && git add CLAUDE.md
git commit -m "$(cat <<'EOF'
CLAUDE.md에 루틴 직접 추가 기능 완료 반영
EOF
)"
```
