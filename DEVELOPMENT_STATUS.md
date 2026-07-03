# MyCoach 모바일 앱 개발 현황

> 마지막 업데이트: 2026-07-03

## 프로젝트 구조

- **위치**: `/Users/ickhwanyu/Desktop/NewHuman/mobile`
- **스택**: Expo (SDK 56) + Expo Router + TypeScript + react-native-svg + Supabase
- **라우팅**: `src/app` (route groups: `(auth)`, `(onboarding)`, `(tabs)`, `(modals)`)

## 디자인 시스템 (`src/constants/theme.ts`)

CLAUDE.md 디자인 토큰 전체 반영:

- 컬러: Primary `#2563EB`, Navy `#1E3A5F`, Orange `#F97316`, 루틴 상태별 배경/아이콘 색상
- Typography: body/sectionTitle/statValue/subtext/button
- Radius, Spacing, Sizes (컴포넌트별 치수)

## 컴포넌트

| 분류 | 위치 | 내용 |
|---|---|---|
| 아이콘 - 탭바 | `components/icons/TabBarIcons.tsx` | 홈/스케줄/대시보드/설정 (active/inactive) |
| 아이콘 - 루틴 상태 | `components/icons/RoutineStatusIcons.tsx` | 완료/진행중/예정/지연/건너뜀 |
| 아이콘 - 기타 | `components/icons/MiscIcons.tsx` | 벨/설정/sparkle/plus/refresh/warning |
| 아이콘 - 소셜 로그인 | `components/icons/SocialIcons.tsx` | 카카오/Google/Apple 브랜드 로고 |
| UI | `components/ui/*.tsx` | Button, Input, Tag, Toggle, Card(Progress/KPI/AI Banner), RoutineItem |
| 온보딩 | `components/onboarding/StepIndicator.tsx` | 단계 표시 도트 |

## 화면 구현 현황 (SCR-00 ~ SCR-11)

| 화면 | 경로 | 상태 |
|---|---|---|
| SCR-00 로그인/회원가입 | `(auth)/login.tsx` | 소셜 로그인 3종(카카오/Google/Apple, 브랜드 아이콘 적용) + 이메일 진입 |
| SCR-01/08/09 온보딩 1~3단계 | `(onboarding)/step1~3.tsx` | Step indicator 포함 입력 폼 placeholder |
| SCR-10a/10b 로딩 (생성 중 → 완료) | `(onboarding)/loading.tsx` | 실제 AI 스케줄 생성 API 호출 + 진행률 표시 |
| SCR-11 완료 축하 | `(onboarding)/complete.tsx` | 소셜 공유 CTA 포함 (UX-004) |
| SCR-02 홈 | `(tabs)/home.tsx` | 네이비 배경 진척도 카드, AI 추천 배너, 루틴 리스트(5종 상태), empty/error 상태(SCR-10c/10d) 분기 |
| SCR-03 스케줄 수정 | `(tabs)/schedule.tsx` | AI 배너 + 드래그 핸들 리스트 + "직접 루틴 추가" CTA |
| SCR-06 주간 대시보드 | `(tabs)/dashboard.tsx` | KPI 카드 3종, 요일별 완료율 차트, **스트릭 캘린더**, **목표 달성 예측** 카드, 롤모델 인사이트 |
| SCR-07 알림 설정 | `(tabs)/settings.tsx` | **전체 알림 마스터 토글**, **방해 금지 시간**(취침/기상), Android 배너 카드(조건부), 개별 알림 토글 4종 |
| SCR-04 체크인 모달 | `(modals)/checkin.tsx` | One-Tap 완료/오늘만 건너뛰기, 스트릭 경고, **실제 소요 시간 스테퍼(±5분)**, **메모 입력** |
| SCR-05 저녁 회고 모달 | `(modals)/reflection.tsx` | 완료율 카드 + **AI 코치 피드백 카드** + **내일 루틴 미리보기 카드** + 이모지 기분 평가(선택 시 AI 생성 트리거), 기존 기록 있으면 읽기 전용 표시 |

## UX 감사 반영 항목 (CLAUDE.md 기준)

- ✅ UX-001: SCR-09 온보딩 Step3 CTA disabled 처리 + 안내 텍스트
- ✅ UX-003: SCR-07 저장 버튼 탭바 겹침 수정
- ✅ UX-004: SCR-11 소셜 공유 CTA 추가
- ✅ UX-008: SCR-04 '오늘만 건너뛰기' + 스트릭 경고 텍스트
- ✅ UX-009: SCR-05 이모지 감정 평가 + 텍스트 레이블 + 선택 상태 배경
- ✅ UX-011: SCR-07 Android 배너 알림 카드 최상단 배치
- ✅ UX-005: SCR-01/08/09 온보딩 — `StepIndicator`에 "Step X / 3" 라벨 + 진행 바 추가
- ✅ UX-006: SCR-02 진척 카드 — `ProgressCard`를 `completed`/`total` 기반으로 재구성, 스트릭 배지 분리
- ✅ UX-007: SCR-03 — "↕ 길게 눌러 드래그하여 순서를 변경하세요" 안내 텍스트 추가
- ✅ UX-010: SCR-06 목표 달성 예측 — `InfoIcon` ⓘ 추가 + "최근 7일 완료율 기준 산출" 캡션
- ✅ UX-012: SCR-10c 빈 상태 — 🗓️ 이모지를 `CalendarIcon` SVG로 교체

잔여 Major 이슈 없음 (5건 모두 코드 반영 완료, 2026-06-15)

---

## 백엔드 연동 (Supabase) — 2026-06-18

### 패키지

```
@supabase/supabase-js ^2.108.2
```

### 신규 파일

| 파일 | 내용 |
|------|------|
| `src/lib/supabase.ts` | Supabase 클라이언트 (`createClient<Database>`, SecureStore 세션) |
| `src/lib/database.types.ts` | 6개 테이블 + user_streaks 뷰 TypeScript 타입 (Relationships 포함) |
| `supabase/migrations/20260618000000_initial_schema.sql` | 초기 DB 스키마 (테이블·RLS·트리거·뷰) |
| `.env` | Supabase URL/ANON_KEY, Google Web Client ID 입력 완료 |

### Supabase 프로젝트

| 항목 | 값 |
|------|----|
| 프로젝트 ID | `nswfgdyjpaorxfqbdnhv` |
| URL | `https://nswfgdyjpaorxfqbdnhv.supabase.co` |
| 리전 | ap-northeast-2 (서울) |
| DB 테이블 | profiles / goals / daily_schedules / routine_blocks / checkins / feedbacks |
| RLS | 전 테이블 활성화 (본인 데이터만 접근) |

### 인증 설정

| 프로바이더 | 상태 |
|----------|------|
| Google | ✅ 완료 (Web Client ID + Skip nonce checks ON) |
| Apple | ⬜ 미설정 — Apple Developer Program(연 $99) 가입 보류 중 |
| 카카오 | ✅ 완료 (2026-06-21) — `auth-kakao` Edge Function 배포 + 카카오 Developers 설정 + 웹(localhost:8081) 로그인 테스트 성공 |

---

## 카카오 로그인 (`auth-kakao` Edge Function) — 2026-06-21

카카오는 Supabase 기본 제공 OAuth provider가 아니므로, 커스텀 Edge Function으로 직접 세션을 발급한다.

### 플로우
1. 클라이언트(`login.tsx`)가 카카오 인가 코드(`code`) + `redirectUri`를 `auth-kakao` Edge Function에 전달
2. Edge Function이 `code`를 카카오 액세스 토큰으로 교환 (`https://kauth.kakao.com/oauth/token`)
3. 카카오 사용자 정보 조회 (`https://kapi.kakao.com/v2/user/me`)
4. 카카오 고유 id 기반 합성 이메일(`kakao_<id>@kakao.mycoach.internal`)로 `admin.generateLink({ type: 'magiclink' })` 호출 — 신규 유저면 생성, 기존 유저면 토큰만 재발급
5. `anon.auth.verifyOtp({ type: 'email', token_hash })`로 매직링크 토큰을 `access_token`/`refresh_token`으로 교환 후 클라이언트에 반환
6. 클라이언트는 받은 토큰으로 `supabase.auth.setSession()` 호출

### 트러블슈팅 기록
- `client_id [undefined]` (KOE101) → Supabase Edge Function Secrets에 `KAKAO_REST_API_KEY`가 등록 안 돼 있었음. Secrets 탭에 정확한 이름으로 등록 필요.
- `KOE205` (잘못된 요청) → 카카오 콘솔 동의항목에서 `profile_nickname`/`account_email`이 비활성 상태였음. 동의항목 "사용함" 처리로 해결.
- `Email link is invalid or has expired` → `verifyOtp`의 `type`을 `generateLink`와 동일한 `'magiclink'`로 주면 실패. **`type: 'email'`**로 줘야 정상 검증됨 (기존 유저 재로그인 시 내부 토큰 저장 방식 차이로 추정).
- Edge Function 시크릿(`KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`)은 Supabase Dashboard에서만 등록 — 클라이언트 `.env`(`EXPO_PUBLIC_*`)에는 Client Secret을 절대 넣지 않음 (번들에 노출됨).

### 남은 일
- [ ] 네이티브 빌드(iOS/Android) 테스트 시 카카오 콘솔 Redirect URI에 `mobile://` 등 커스텀 스킴 값 추가 등록 (현재는 웹 `http://localhost:8081`만 등록됨)

---

## 상태 관리 (`src/stores/`)

> 2026-06-16 도입 → 2026-06-18 Supabase 연동 완료

| 스토어 | 파일 | 영속화 | 내용 |
|--------|------|--------|------|
| `useAuthStore` | `stores/authStore.ts` | Supabase Auth (SecureStore) | 세션 복원(`initialize`), onAuthStateChange 구독, 로그아웃 |
| `useScheduleStore` | `stores/scheduleStore.ts` | ✗ (Supabase DB) | `fetchToday` / `completeCheckin` / `skipBlock` / `reorderBlocks` — 낙관적 업데이트 후 DB 동기화 |
| `useOnboardingStore` | `stores/onboardingStore.ts` | ✗ (Supabase DB) | goal/rolemodel/lifestyleTags + `saveGoalAndGenerateSchedule` (Goal DB 저장 → FastAPI 호출 → DailySchedule 저장) |
| `useNotificationStore` | `stores/notificationStore.ts` | ✅ AsyncStorage | 토글 7종 + 방해금지 시간 |

### 타입 (`src/types/index.ts`)

```typescript
type RoutineBlock = {
  id: string; time: string; task: string;
  duration: string;        // 표시용 "15분"
  durationMinutes: number; // 체크인 스테퍼용
  status: RoutineStatus;   // 'todo' | 'active' | 'done' | 'delayed' | 'skipped'
};
```

### 화면 연결 현황

| 화면 | 연결된 스토어 | 내용 |
|------|--------------|------|
| `(auth)/login.tsx` | `supabase` 직접 | `signInWithIdToken`(Google/Apple), 카카오 Edge Function 프록시 |
| `app/_layout.tsx` | `authStore` | `initialize()` — 세션 복원 + onAuthStateChange 구독 |
| `(onboarding)/loading.tsx` | `onboardingStore` | `saveGoalAndGenerateSchedule` 실제 API 호출 |
| `(tabs)/home.tsx` | `scheduleStore` | `fetchToday`, ErrorState 재시도 버튼 |
| `(tabs)/schedule.tsx` | `scheduleStore` | `fetchToday`, `reorderBlocks` |
| `(tabs)/settings.tsx` | `notificationStore` | 모든 토글 → 스토어 setter |
| `(modals)/checkin.tsx` | `scheduleStore` | `completeCheckin` / `skipBlock` |

---

## 검증

- `npx tsc --noEmit` 통과 (타입 에러 없음) — 2026-06-18 기준
- Expo Web 빌드 + Playwright 스크린샷으로 `final/scr-XX.png`와 구조 대조 완료 (2026-06-15)
  - `/login`, `/home`, `/dashboard`, `/schedule`, `/settings`, `/checkin` 6개 라우트 콘솔 에러 없이 정상 렌더링 확인

---

## AI 스케줄 생성 연동 (2026-06-30)

### 구현 방식 변경

기존 계획(FastAPI 서버)을 **Supabase Edge Function**으로 전환. 추가 서버 없이 즉시 모바일 접근 가능.

### 신규 파일

| 파일 | 내용 |
|------|------|
| `supabase/functions/generate-schedule/index.ts` | Claude API 호출 Edge Function — `npm:@anthropic-ai/sdk`, CORS, 마크다운 스트리핑, SyntaxError 재시도 1회 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/stores/onboardingStore.ts` | `wakeTime`/`sleepTime` 필드 추가 (기본값 `07:00`/`23:00`), `fetch(localhost)` → `supabase.functions.invoke('generate-schedule')` 교체, 재온보딩 시 `routine_blocks` 중복 방지 (delete → insert), `catch` 에러 로깅 추가 |
| `src/app/(onboarding)/step2.tsx` | 기상/취침 시간 스테퍼 UI 추가 (30분 단위 `◀`/`▶`, 외부 패키지 없음), `wakeTime >= sleepTime` 역전 방지 가드 |

### Supabase Secrets

| 이름 | 등록 여부 |
|------|----------|
| `ANTHROPIC_API_KEY` | ✅ 등록 완료 |

### 동작 확인 (2026-06-30)

curl 테스트 성공 — 목표 "IT 스타트업 PM 취직", 롤모델 "박지성", 기상 07:00/취침 23:00 기준 루틴 7개 생성:

```
07:00 모닝 러닝 (30분)
07:30 샤워 및 아침 식사 준비 (30분)
08:00 PM 직무 관련 독서 (45분)
09:00 PM 취업 준비 포트폴리오/JD 분석 (90분)
14:00 PM 실무 역량 학습 SQL/데이터 분석 (60분)
19:00 저녁 스트레칭 (30분)
21:00 하루 회고 및 내일 할 일 정리 (30분)
```

### 커밋 히스토리

| 커밋 | 내용 |
|------|------|
| `0233c45` | feat: add generate-schedule Supabase Edge Function (Claude API) |
| `20e86aa` | fix: Edge Function retry scope, 400 detail, key guard, markdown strip |
| `09e8394` | feat: add wakeTime/sleepTime to onboardingStore, switch to supabase.functions.invoke |
| `98a645e` | feat: add wake/sleep time stepper to onboarding Step2 |
| `fdbaf4d` | fix: prevent duplicate routine_blocks, add error logging, guard time reversal |

---

---

## 대시보드 실데이터 연동 (2026-06-30)

### 개요

SCR-06 대시보드 화면의 하드코딩 상수 5종을 Supabase 실데이터로 교체.

### 신규 파일

| 파일 | 내용 |
|------|------|
| `src/stores/dashboardStore.ts` | Zustand 스토어 — Supabase 3개 쿼리(daily_schedules+routine_blocks, goals, user_streaks) + 이번 주 완료율·스트릭·D-N 추정·인사이트 텍스트 계산 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/(tabs)/dashboard.tsx` | 하드코딩 상수 5종 제거, `useDashboardStore` 연결, `useFocusEffect`로 포커스 시 자동 새로고침, 로딩/에러 상태 UI 추가, goal=null 시 목표 카드 숨김 |

### 교체된 하드코딩 데이터

| 이전 | 이후 |
|------|------|
| `WEEK_PERCENTS = [80,60,...]` | 이번 주 월~일 Supabase 실제 완료율 |
| `STREAK_DAYS = [true,true,...]` | 최근 14일 rolling 완료 여부 |
| KPI `"68%"`, `"12일"`, `"65%"` | avgCompletionRate / user_streaks / goalCompletionRate |
| 날짜 `"6월 9일 - 6월 15일"` | 오늘 기준 이번 주 월~일 자동 계산 |
| 하드코딩 롤모델 인사이트 | `goals.rolemodel` + 최고 완료 요일 기반 동적 텍스트 |

### 커밋 히스토리

| 커밋 | 내용 |
|------|------|
| `5b2917d` | feat: add dashboardStore with Supabase queries and computation |
| `273d65d` | fix: replace error: any with PostgrestError in dashboardStore |
| `bdce99d` | feat: connect dashboard screen to real Supabase data |

### Deferred 항목 (다음 수정 시 반영)

- `toDateStr()` UTC/KST 시차 오프셋 — `toISOString()` 대신 로컬 날짜 포매터 사용 (00:00~09:00 KST 구간 날짜 불일치)
- `kpi.goalCompletionRate` — 별도 지표 생기면 `avgCompletionRate`와 분리
- `auth.getUser()` try-catch 내부로 이동 (방어적 처리)

---

---

## 홈 화면 유저 이름 연동 (2026-06-30)

하드코딩된 `"안녕하세요, 이준혁님"` → `profiles.name` 실데이터로 교체.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/stores/authStore.ts` | `userName: string` 필드 추가, `initialize()` + `onAuthStateChange` 에서 `profiles.name` 조회 (`fetchUserName`) |
| `src/app/(tabs)/home.tsx` | `useAuthStore`에서 `userName` 구독, 헤더 텍스트 동적 치환 |

### 이름 출처

| 로그인 방식 | 표시 이름 |
|-----------|---------|
| Google | Google 계정 이름 (`full_name`) |
| 카카오 | 카카오 프로필 닉네임 (미동의 시 "카카오 사용자") |
| 이메일 | 이메일 앞부분 (예: `yih000098`) |

`on_auth_user_created` 트리거가 `raw_user_meta_data->>'full_name'` → `'name'` → 이메일 prefix 순으로 `profiles.name`을 자동 채움.

### 커밋

| 커밋 | 내용 |
|------|------|
| `a580076` | feat: show real user name in home screen from profiles table |

---

## 저녁 회고 AI 피드백 연동 (2026-07-03)

### 개요

`(modals)/reflection.tsx`를 이모지+메모 뿐이던 목업에서 Figma SCR-05 디자인(완료율 카드 + AI 코치 피드백
카드 + 내일 루틴 미리보기 카드)대로 전면 재작성하고, `POST /feedback` 백엔드까지 완전히 구현.

### 신규 파일

| 파일 | 내용 |
|------|------|
| `supabase/functions/generate-feedback/index.ts` | Claude API 호출 Edge Function — 오늘 완료/건너뜀 루틴 + 완료율 + 무드 + 목표를 받아 `ai_summary`(AI 코치 피드백)와 `next_blocks`(내일 루틴 5~7개)를 1회 호출로 동시 생성. `generate-schedule`과 동일 컨벤션(CORS, SyntaxError 재시도 1회). 응답은 `{ai_summary, next_blocks}`만 명시적으로 재구성해 반환(AI가 `score` 등 다른 필드를 끼워 넣어도 유출되지 않도록 방어) |
| `src/stores/feedbackStore.ts` | `loadToday`(오늘/어제 완료율 계산, 오늘자 `feedbacks` 존재 시 읽기 전용으로 즉시 표시) / `submitMood`(Edge Function 호출 → 내일 `daily_schedules`/`routine_blocks` 저장 → `feedbacks` insert, 각 insert 에러 체크) |
| `supabase/migrations/20260703000000_feedback_mood_wake_sleep.sql` | `feedbacks.mood`(check `bad|meh|okay|good|great`), `goals.wake_time`/`sleep_time`(default `07:00`/`23:00`) 컬럼 추가 |

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/app/(modals)/reflection.tsx` | 전면 재작성 — 자유입력 노트 제거(Figma에 없음), 무드 라벨을 Figma 문구로 교체(힘들어요/아쉬워요/보통이요/좋아요/완벽해요), 무드 선택이 AI 생성을 트리거하는 One-Tap 흐름, 결과 생성 후 무드 재탭으로 인한 중복 제출 방지 |
| `src/stores/onboardingStore.ts` | goals insert에 `wake_time`/`sleep_time` 추가 — 기존엔 온보딩 입력값이 DB에 저장되지 않고 있었음 |
| `src/app/(tabs)/home.tsx` | "오늘 하루 회고 작성하기" 행에 월/수/금 강조 배지 추가(`isReflectionDay()`), 수동 진입은 요일 무관 항상 가능 |

### 동작 확인 (2026-07-03)

- curl 테스트 성공 — 완료율 86%, 무드 "좋아요" 기준 `ai_summary` + 내일 루틴 7개 생성 확인
- DB 레벨 E2E 검증 — 실제 계정으로 `submitMood`의 전체 쓰기 시퀀스(Edge Function 호출 → `feedbacks` insert →
  내일 `daily_schedules`/`routine_blocks` insert)를 수동 시뮬레이션, `score`가 AI가 아닌 완료율 계산값과
  일치함을 확인, `unique(user_id, date)` 제약으로 재작성 방지(idempotency) 확인 후 테스트 데이터 원복 완료

### 리뷰 중 발견·수정된 이슈

- `generate-feedback` 응답이 raw JSON을 그대로 반환해 AI가 `score` 등 stray 필드를 끼워 넣어도 유출될 수 있던 문제 → 응답 필드 명시적 재구성으로 수정
- 무드 선택 후 결과가 나온 뒤에도 무드 버튼이 계속 활성 상태라 재탭 시 AI 재호출 + 내일 스케줄 재작성이 발생하던 문제 → 결과 존재 시 무드 버튼 비활성화로 수정
- `submitMood`의 `routine_blocks`/`feedbacks` insert 에러를 체크하지 않아 실패해도 성공한 것처럼 보이던 문제 → 에러 체크 후 throw로 수정

### 참고 문서

- 스펙: `docs/superpowers/specs/2026-07-03-evening-reflection-ai-feedback-design.md` (NewHuman 루트)
- 플랜: `docs/superpowers/plans/2026-07-03-evening-reflection-ai-feedback.md` (NewHuman 루트)

---

## 실사용 테스트 중 발견·수정한 버그 (2026-07-03)

저녁 회고 기능을 `main`에 병합한 뒤, 실제 Google 계정으로 온보딩부터 직접 테스트하며 발견한 문제 3건.
전부 수정 후 `main`에 push 완료(`c1512d2..b164817`).

| # | 증상 | 원인 | 조치 |
|---|------|------|------|
| 1 | 온보딩 스텝3 "스케줄 생성하기"에서 `insert or update on table "goals" violates foreign key constraint "goals_user_id_fkey"` (23503) | `handle_new_user` 트리거가 `AFTER INSERT ON auth.users`로만 동작해 트리거 이전부터 있던 두 테스트 계정(구글/카카오)엔 `profiles` 행이 없었음 | 두 계정에 대해 트리거와 동일한 로직으로 `profiles` 행 SQL 백필 (데이터 수정, 코드 변경 없음) |
| 2 | `routine_blocks`는 DB에 정상 생성됐는데 홈 화면에는 아무 것도 안 보임 | `home.tsx`/`schedule.tsx`에 `scheduleStore.fetchToday()`를 호출하는 코드가 전혀 없었음 (재시도 버튼에서만 참조) | `dashboard.tsx`와 동일한 `useFocusEffect(useCallback(() => fetchToday(), [fetchToday]))` 패턴 연결 |
| 3 | 체크인 모달에서 긴 루틴명이 줄바꿈 없이 잘림 + 배경(빈 화면) 탭해도 안 닫힘 | 제목 텍스트를 감싸는 `View`에 `flex: 1` 누락(`RoutineItem`/`Card`엔 있었음); `overlay`/`sheet`가 단순 `View`라 탭 이벤트 없음 | `titleGroup` 스타일에 `flex: 1` 추가; `overlay`/`sheet`를 `Pressable`로 변경(시트 안쪽은 no-op onPress로 전파 차단) |

### 검증 방법

Playwright로 직접 로그인은 불가(OAuth 벽)했기 때문에, 사용자가 실제 세션에서 조작한 결과를
Supabase에서 직접 조회해 교차 검증: `profiles` 1건 생성 확인, `goals`(활성 1건, wake_time/sleep_time
실제 입력값 저장), `daily_schedules`(오늘 1건, 중복 없음) + `routine_blocks` 7건, `routine_blocks` 중 2건이
실제로 `done` 상태로 체크인된 것까지 확인.

---

## 다음 단계

- [ ] Apple OAuth 설정 (Supabase Dashboard) — 보류, Apple Developer Program 가입 필요
- [ ] 카카오 로그인 — 네이티브 빌드(iOS/Android) 테스트 시 Redirect URI 추가 등록
- [x] **`POST /feedback`** — 저녁 회고 AI 피드백 (`generate-feedback` Edge Function으로 구현 완료, 2026-07-03)
- [ ] iOS/Android 스탠드얼론 빌드용 Google Client ID 추가 (`.env`)
- [ ] FCM 푸시 알림 연동
- [ ] 저녁 회고 주 3회 트리거를 서버 측에서 강제하는 로직 (현재는 홈 화면 월/수/금 배지 UI만, 실제 작성 제한 없음)
- [ ] 저녁 회고(reflection) 화면 실제 클릭 테스트 — DB 시뮬레이션/curl만 통과, 무드 선택→AI 카드 표시까지 실제 화면에서는 아직 미확인
- [ ] `schedule.tsx`/`home.tsx`의 "+ 직접 루틴 추가하기" — 버튼 존재하나 `onPress`가 빈 함수, 폼/모달/DB insert 로직 미구현
