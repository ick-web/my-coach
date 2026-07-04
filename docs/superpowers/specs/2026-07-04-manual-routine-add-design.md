# 직접 루틴 추가하기 — 설계

날짜: 2026-07-04

## 배경

`home.tsx`(빈 상태)와 `schedule.tsx`에 "직접 루틴 추가하기" CTA가 이미 존재하지만 `onPress`가 빈 함수라
아무 동작도 하지 않는다. `scheduleStore`에도 루틴을 새로 만드는 액션이 없다. 사용자가 AI 생성에 의존하지
않고 오늘의 루틴을 수동으로 추가할 수 있어야 한다.

## 범위

- 루틴 1건을 수동으로 입력해 오늘 스케줄에 추가하는 기능만 다룬다.
- 드래그 순서 변경, 기존 루틴 수정/삭제는 범위 밖(기존 미구현 상태 유지).

## 화면 설계

새 바텀시트 모달 `(modals)/add-routine.tsx` (`checkin.tsx`와 동일한 오버레이 + 시트 패턴).

**필드**
- 할 일 이름: `Input` 텍스트 필드, 필수
- 시작 시간: 시(0~23) 스테퍼 + 분(0/10/20/30/40/50) 스테퍼, 기본값 09:00
- 소요 시간: 5분 단위 +/- 스테퍼(`checkin.tsx` 소요시간 스테퍼와 동일 톤), 기본값 30분

**액션**
- "추가하기" 버튼 — 할 일 이름이 공백일 때 disabled
- "취소" — 배경 탭 또는 스와이프 다운으로 닫힘 (기존 모달 패턴)

## 데이터 흐름

`scheduleStore`에 `addBlock(time: string, task: string, durationMinutes: number)` 액션 신규 추가.

1. 오늘 `scheduleId`가 없으면(빈 상태) `daily_schedules`에 `{ user_id, date }` insert 후 id 확보
2. `routine_blocks`에 `{ schedule_id, user_id, time, task, duration_label: '${durationMinutes}분', duration_minutes, status: 'todo', sort_order: 현재 blocks.length }` insert
3. 성공 시 로컬 `blocks` 배열에 즉시 append, `loadStatus: 'idle'`로 갱신
4. 실패 시 별도 에러 UI 없이 조용히 무시(기존 스토어의 다른 액션들과 동일한 수준의 에러 처리 — 낙관적 업데이트 후 실패 시 별도 롤백 로직 없음)

새로 추가된 루틴은 시간순 정렬 없이 목록 맨 뒤에 붙는다. 순서 조정은 기존에도 미구현인
드래그 기능의 범위이므로 이번 작업에서 다루지 않는다.

## 진입점 연결

- `home.tsx` EmptyState의 "직접 루틴 추가하기" 텍스트 행을 `Pressable`로 감싸 `router.push('/add-routine')`
- `schedule.tsx`의 "+ 직접 루틴 추가하기" 버튼 `onPress`를 `router.push('/add-routine')`로 연결
- `_layout.tsx`의 `Stack`에 `(modals)/add-routine`을 `presentation: 'modal'`로 등록
- 제출 성공 시 `router.back()` — 돌아간 화면은 기존 `useFocusEffect`로 자동 재조회됨

## 테스트 관점

- 오늘 스케줄이 없는 상태(빈 상태)에서 추가 → `daily_schedules` + `routine_blocks` 모두 새로 생성되는지
- 오늘 스케줄이 이미 있는 상태에서 추가 → 기존 `schedule_id`에 `routine_blocks`만 추가되는지
- 할 일 이름 공백 시 제출 버튼이 비활성화되는지
