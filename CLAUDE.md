# CLAUDE.md — MyCoach Mobile

> React Native / Expo SDK 56 기반 AI 코칭 앱. 이 파일을 먼저 읽고 작업하세요.

---

## 프로젝트 개요

사용자가 직업 목표·롤모델·라이프스타일을 입력하면 Claude AI가 하루 스케줄을 자동 생성하고, 체크인·회고·알림으로 습관 형성을 돕는 앱.

- **플랫폼:** iOS / Android / Web (단일 코드베이스)
- **라우팅:** Expo Router v4 (파일 기반, `src/app/` 디렉토리)
- **출시 목표:** 2026-11 v1.0 (한국어 전용, 18세 이상)

---

## 기술 스택

| 역할 | 패키지 |
|------|--------|
| 프레임워크 | Expo SDK 56, React Native 0.85 |
| 라우팅 | expo-router 56.2 |
| 언어 | TypeScript 6 |
| 상태 관리 | Zustand 5 |
| 백엔드/인증/DB | @supabase/supabase-js 2 |
| AI 스케줄 생성 | FastAPI → Anthropic Claude API |
| 그래픽 | react-native-svg 15 |
| 애니메이션 | react-native-reanimated 4 |
| 세션 저장 | expo-secure-store (네이티브), AsyncStorage (웹) |
| 알림 | Firebase Cloud Messaging (FCM) — 미연동 |

> **Expo SDK 56 중요:** API가 이전 버전과 다릅니다. 코드 작성 전 반드시 https://docs.expo.dev/versions/v56.0.0/ 에서 최신 API를 확인하세요.

---

## 디렉토리 구조 (핵심 경로)

```
src/
├── app/
│   ├── _layout.tsx              # 루트 레이아웃 — AuthGuard + authStore.initialize()
│   ├── index.tsx                # 진입점 — 인증 상태에 따라 리다이렉트
│   ├── (auth)/login.tsx         # SCR-00 로그인
│   ├── (onboarding)/
│   │   ├── step1.tsx            # SCR-01 직업목표·롤모델
│   │   ├── step2.tsx            # SCR-08 라이프스타일 태그
│   │   ├── step3.tsx            # SCR-09 AI 생성 확인
│   │   ├── loading.tsx          # SCR-10a/10b 로딩
│   │   └── complete.tsx         # SCR-11 완료
│   ├── (tabs)/
│   │   ├── home.tsx             # SCR-02 홈 (+ SCR-10c/10d 분기)
│   │   ├── schedule.tsx         # SCR-03 스케줄 수정
│   │   ├── dashboard.tsx        # SCR-06 대시보드
│   │   └── settings.tsx         # SCR-07 알림 설정
│   └── (modals)/
│       ├── checkin.tsx          # SCR-04 체크인
│       └── reflection.tsx       # SCR-05 저녁 회고
├── components/
│   ├── icons/
│   │   ├── TabBarIcons.tsx      # 탭바 4종 (active=#2563EB / inactive=#9CA3AF)
│   │   ├── RoutineStatusIcons.tsx  # 루틴 상태 5종 SVG
│   │   ├── MiscIcons.tsx        # 벨/설정/sparkle/plus/refresh/warning
│   │   └── SocialIcons.tsx      # 카카오/Google/Apple 브랜드 로고
│   ├── onboarding/
│   │   └── StepIndicator.tsx    # "Step X / 3" 라벨 + 진행 바 + 도트
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx             # ProgressCard / KPICard / AIBannerCard
│       ├── Input.tsx
│       ├── RoutineItem.tsx      # 5종 상태 루틴 항목 (One-Tap 체크인)
│       ├── Tag.tsx
│       └── Toggle.tsx
├── constants/theme.ts           # 디자인 토큰 (Colors / Typography / Radius / Spacing)
├── lib/
│   ├── supabase.ts              # Supabase 클라이언트
│   ├── database.types.ts        # DB 테이블 TypeScript 타입
│   └── ws-noop.js               # Metro에서 ws 모듈을 no-op으로 대체 (RN 환경 크래시 방지)
├── stores/
│   ├── authStore.ts             # 세션 복원 + onAuthStateChange
│   ├── scheduleStore.ts         # 루틴 CRUD (낙관적 업데이트 → DB 동기화)
│   ├── onboardingStore.ts       # goal 저장 + FastAPI 스케줄 생성 호출
│   └── notificationStore.ts     # 알림 토글 (AsyncStorage 영속화)
└── types/index.ts
```

---

## 디자인 토큰 (`src/constants/theme.ts`)

### Colors

```typescript
primary:    '#2563EB'   // CTA 버튼, 강조
navy:       '#1E3A5F'   // 헤더, 제목
orange:     '#F97316'   // 경고, 스트릭

// 루틴 상태 배경
statusBg.done:    '#DCFCE7'
statusBg.active:  '#DBEAFE'
statusBg.skipped: '#F3F4F6'
statusBg.delayed: '#FEF3C7'
statusBg.todo:    '#FFFFFF'

// 루틴 상태 아이콘 색상
statusIcon.done:    '#16A34A'   // 초록 원 + 체크
statusIcon.active:  '#FFFFFF'   // 흰 도트
statusIcon.todo:    '#D1D5DB'   // 회색 원 외곽선
statusIcon.delayed: '#D97706'   // 주황 원 + 느낌표
statusIcon.skipped: '#9CA3AF'   // 회색 원 + 마이너스

// 탭바
tabActive:   '#2563EB'
tabInactive: '#9CA3AF'
```

### Typography

| 토큰 | fontSize | fontWeight | 용도 |
|------|----------|------------|------|
| body | 14 | 400 | 본문 기본 |
| sectionTitle | 18 | 700 | 섹션 제목 |
| statValue | 22 | 700 | 수치/강조 |
| subtext | 12 | 400 | 서브텍스트 (#6B7280) |
| button | 15 | 700 | 버튼 텍스트 |
| tabLabel | 11 | 500 | 탭바 레이블 (최소 크기) |

### Radius / Spacing

```typescript
Radius.cardSm = 12  Radius.cardLg = 20
Radius.buttonPrimary = 16  Radius.buttonGhost = 8

Spacing: xs=4, sm=8, md=12, lg=16, xl=24, xxl=32
```

---

## Figma 화면 노드 ID

| 화면 | 노드 ID | 설명 |
|------|--------|------|
| SCR-00 | `55:141` | 로그인/회원가입 |
| SCR-01 | `21:472` | 온보딩 Step1 |
| SCR-02 | `21:509` | 홈 |
| SCR-03 | `22:551` | 스케줄 수정 |
| SCR-04 | `23:583` | 체크인 모달 |
| SCR-05 | `23:604` | 저녁 회고 |
| SCR-06 | `23:629` | 대시보드 |
| SCR-07 | `25:680` | 알림 설정 |
| SCR-08 | `25:717` | 온보딩 Step2 |
| SCR-09 | `25:763` | 온보딩 Step3 |
| SCR-10a | `25:797` | 로딩 (생성 중) |
| SCR-10b | `34:6` | 로딩 완료 → 홈 전환 |
| SCR-10c | `48:132` | 빈 상태 (루틴 없음) |
| SCR-10d | `55:12` | 에러 상태 |
| SCR-11 | `25:855` | 완료 축하 |

Figma 파일: `https://www.figma.com/design/gCMlFaYYSMBNf80fSRpg2R/NewHuman` (Hi-Fi 작업 페이지)

---

## Supabase

### 프로젝트 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | `nswfgdyjpaorxfqbdnhv` |
| URL | `https://nswfgdyjpaorxfqbdnhv.supabase.co` |
| 리전 | ap-northeast-2 (서울) |
| 초기 마이그레이션 | `supabase/migrations/20260618000000_initial_schema.sql` |

### 테이블 스키마

```
profiles        id(uuid), email, name, subscription_tier, created_at
goals           id, user_id, title, rolemodel, lifestyle_tags[], is_active,
                wake_time, sleep_time
daily_schedules id, user_id, date  (unique: user_id + date)
routine_blocks  id, schedule_id, user_id, time, task, duration_label,
                duration_minutes, status, sort_order
checkins        id, block_id, user_id, actual_duration, note, completed_at
feedbacks       id, user_id, date, ai_summary, score, mood, next_schedule_preview(jsonb)

뷰: user_streaks — 유저별 루틴 완료일 수 집계
```

> 참고(2026-07-03): `goals.wake_time`/`sleep_time`(text, default `07:00`/`23:00`), `feedbacks.mood`(text,
> check `bad|meh|okay|good|great`) 컬럼 추가 — 마이그레이션 `20260703000000_feedback_mood_wake_sleep.sql`.

모든 테이블에 RLS 활성화 — 본인 데이터만 접근 가능.

### 인증 현황

| 프로바이더 | 상태 |
|----------|------|
| Google | ✅ 완료 (`signInWithOAuth`, 웹 리다이렉트 + 네이티브 `openAuthSessionAsync`) |
| 카카오 | ✅ 완료 (`auth-kakao` Edge Function, 웹 테스트 완료) |
| Apple | ⬜ 미설정 (Apple Developer Program 가입 필요) |

### 환경 변수 (`.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://nswfgdyjpaorxfqbdnhv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<Dashboard에서 확인>
EXPO_PUBLIC_AI_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=432177357591-ed5t2s30skii29slp85vm5gub2ini5kr.apps.googleusercontent.com
EXPO_PUBLIC_KAKAO_REST_API_KEY=<카카오 Developers에서 확인>
```

> Edge Function 시크릿(`KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`)은 Supabase Dashboard → Edge Functions → Secrets에만 등록. `.env`에 Client Secret 절대 포함 금지.

---

## 알려진 함정 (Known Gotchas)

### 1. `ws` 모듈 — Metro 번들 크래시

`ws` 패키지는 Node.js 전용이라 React Native 번들에 포함되면 `stream`/`zlib` 에러 발생.
`metro.config.js`에서 `ws`/`ws/*` 요청을 `src/lib/ws-noop.js`로 대체 처리 완료.
`supabase.ts`에서 `ws`는 `require('ws')` 동적 import로만 사용 (정적 import 금지).

### 2. SecureStore 2KB 한도

`expo-secure-store`는 값당 2KB 한도 존재. Supabase 세션 전체를 저장하면 초과 가능.
`supabase.ts`에 `ExpoSecureStoreAdapter` 패턴으로 처리 완료 (토큰만 SecureStore, 나머지 AsyncStorage).

### 3. 웹(SSR) 환경 스토리지

`window`가 없는 SSR 환경에서 AsyncStorage / SecureStore 호출 시 크래시.
`supabase.ts`의 `NoopStorage`로 우회 처리 완료.

### 4. Google OAuth — `id_token` 없는 문제

`expo-auth-session/providers/google` implicit flow는 웹에서 `access_token`만 반환 (`id_token` 없음).
`signInWithOAuth` 방식으로 교체 완료. 이 방식으로 되돌리지 말 것.

### 5. 카카오 `verifyOtp` type

카카오 Edge Function에서 `admin.generateLink({ type: 'magiclink' })`로 발급한 토큰을
`verifyOtp`로 검증할 때 `type: 'email'`을 사용해야 함 (`'magiclink'` 사용 시 기존 유저 재로그인 실패).

### 6. iOS 시뮬레이터 코드 사이닝

`expo run:ios`는 코드 사이닝 인증서 없이 실행 불가.
Xcode에서 직접 빌드 후 `xcrun simctl`로 설치하는 방법 사용 (README 참고).

### 7. `handle_new_user` 트리거는 기존 계정에 소급 적용 안 됨

`on_auth_user_created`는 `AFTER INSERT ON auth.users`로만 동작하므로, 트리거가 생기기 이전부터
있던 `auth.users` 계정에는 `profiles` 행이 자동 생성되지 않는다. 이 경우 온보딩에서
`goals` insert 시 `goals_user_id_fkey` FK 위반(`23503`)이 발생한다(2026-07-03 실사용 중 발견).
신규 가입 계정은 트리거가 정상 동작하므로 문제없음 — 문제가 재발하면 `auth.users`와 `profiles`를
`left join`해 `profiles.id is null`인 계정을 찾아 동일 COALESCE 로직으로 백필하면 된다.

### 8. `useFocusEffect` 없이는 화면이 자동으로 데이터를 불러오지 않음

`home.tsx`/`schedule.tsx`는 한동안 `scheduleStore.fetchToday()`를 호출하는 코드가 전혀 없어서,
DB에는 `routine_blocks`가 정상 생성돼도 화면에는 아무 것도 표시되지 않는 문제가 있었다
(2026-07-03 실사용 중 발견, 수정 완료). 새 화면을 추가할 때는 `dashboard.tsx`처럼
`useFocusEffect(useCallback(() => { fetchX(); }, [fetchX]))` 패턴을 반드시 연결할 것.

---

## 상태 관리 패턴

### 스토어 구조

| 스토어 | 영속화 | 주요 역할 |
|--------|--------|----------|
| `authStore` | Supabase Auth (SecureStore) | `initialize()` — 세션 복원, `onAuthStateChange` 구독, `userName` (`profiles.name`) 조회 |
| `scheduleStore` | Supabase DB | `fetchToday` / `completeCheckin` / `skipBlock` / `reorderBlocks` — 낙관적 업데이트 |
| `onboardingStore` | Supabase DB | goal 저장(+ wake_time/sleep_time) + `supabase.functions.invoke('generate-schedule')` → `routine_blocks` 저장 |
| `dashboardStore` | Supabase DB | `fetchDashboard` — 이번 주 완료율·스트릭·D-N 추정·인사이트 텍스트 |
| `feedbackStore` | Supabase DB | `loadToday`(오늘/어제 완료율 계산 + 기존 회고 조회) / `submitMood`(`generate-feedback` 호출 → 내일 스케줄 저장 + `feedbacks` insert) |
| `notificationStore` | AsyncStorage | 알림 토글 7종 + 방해금지 시간 |

### 화면-스토어 연결

| 화면 | 스토어 |
|------|--------|
| `_layout.tsx` | `authStore.initialize()` |
| `(auth)/login.tsx` | `supabase` 직접 (signInWithOAuth / setSession) |
| `(onboarding)/loading.tsx` | `onboardingStore.saveGoalAndGenerateSchedule` |
| `(tabs)/home.tsx` | `scheduleStore.fetchToday`(useFocusEffect), `authStore.userName` |
| `(tabs)/schedule.tsx` | `scheduleStore.fetchToday`(useFocusEffect), `reorderBlocks` |
| `(tabs)/settings.tsx` | `notificationStore` 전체 |
| `(tabs)/dashboard.tsx` | `dashboardStore.fetchDashboard` (useFocusEffect) |
| `(modals)/checkin.tsx` | `scheduleStore.completeCheckin`, `skipBlock` |
| `(modals)/reflection.tsx` | `feedbackStore.loadToday`, `submitMood` |

---

## UX 원칙 (코드 구현 시 준수)

- **One-Tap Check-in**: 루틴 완료 체크는 최대 1탭. `RoutineItem`에서 체크인 버튼은 `active` 상태인 항목에만 표시.
- **Calm Technology**: 알림은 행동 유도하되 압박감 없이. 회고는 주 3회 트리거.
- **Progress Visibility**: 작은 수치로 성취감 제공. `ProgressCard`의 `completed`/`total` 표시.
- **WCAG 2.1 AA**: 최소 폰트 `tabLabel` 11px (탭바), 나머지는 최소 14px.

---

## 미완료 작업

- [ ] Apple OAuth (Apple Developer Program 필요)
- [ ] 카카오 로그인 네이티브 빌드 Redirect URI 등록
- [x] `POST /feedback` — 저녁 회고 AI 피드백 (`generate-feedback` Edge Function으로 구현 완료, 2026-07-03)
- [ ] FCM 푸시 알림 연동
- [x] SCR-06 대시보드 실제 통계 연동 (2026-06-30 완료)
- [ ] Google 로그인 네이티브 빌드 Redirect URI 등록
- [ ] 저녁 회고 주 3회 트리거를 서버 측에서 강제하는 로직 (현재는 홈 화면 월/수/금 배지 UI만, 실제 작성 제한 없음)

---

## 저녁 회고 AI 피드백 구현 현황 (2026-07-03)

`(modals)/reflection.tsx`를 Figma SCR-05 디자인(완료율 카드 + AI 코치 피드백 카드 + 내일 루틴 미리보기 카드 +
무드 선택)에 맞게 전면 재작성하고, 백엔드까지 완전히 연동 완료.

- **DB**: `goals.wake_time`/`sleep_time`, `feedbacks.mood` 컬럼 추가 (마이그레이션 적용 완료)
- **Edge Function**: `generate-feedback` 신규 배포. 오늘 완료/건너뜀 루틴 + 완료율 + 무드 + 목표를 받아 Claude
  1회 호출로 AI 코치 피드백(`ai_summary`)과 내일 루틴(`next_blocks`)을 동시 생성. `score`는 AI가 아니라
  클라이언트가 계산한 완료율을 그대로 사용(환각 방지, 응답도 `{ai_summary, next_blocks}`만 명시적으로 반환).
- **스토어**: `feedbackStore.loadToday`가 오늘/어제 완료율 계산 + 오늘자 `feedbacks` 존재 여부 확인(있으면
  읽기 전용으로 즉시 표시, 재생성 안 함). `submitMood`가 Edge Function 호출 → 내일 `daily_schedules`/
  `routine_blocks` 저장 → `feedbacks` insert까지 한 번에 처리.
- **UX**: 무드 선택이 AI 호출을 트리거하는 One-Tap 흐름. 무드 선택 후에는 재탭으로 중복 제출되지 않도록
  버튼 비활성화 처리.
- **홈 화면**: "오늘 하루 회고 작성하기" 행에 월/수/금에만 강조 배지 표시(수동 진입은 요일 무관 항상 가능).
- 스펙: `docs/superpowers/specs/2026-07-03-evening-reflection-ai-feedback-design.md`
- 플랜: `docs/superpowers/plans/2026-07-03-evening-reflection-ai-feedback.md`

---

## 실사용 테스트 중 발견·수정한 버그 (2026-07-03)

저녁 회고 기능 배포 후 실제 계정(Google 로그인)으로 온보딩부터 테스트하며 발견한 문제 3건, 전부 수정 완료
후 `main`에 push됨(`c1512d2..b164817`).

1. **온보딩 목표 저장 FK 오류** (`23503`, `goals_user_id_fkey`) — 원인은 위 "알려진 함정 #7"과 동일.
   기존 두 테스트 계정(구글/카카오)의 `profiles` 행을 SQL로 백필해 해결(데이터 수정, 코드 변경 없음).
2. **홈/스케줄 화면에 오늘 스케줄이 안 보임** — 원인은 위 "알려진 함정 #8"과 동일.
   `home.tsx`/`schedule.tsx`에 `useFocusEffect` 연결.
3. **체크인 모달에서 긴 루틴명이 잘림 + 배경 탭으로 안 닫힘** — `checkin.tsx`의 제목 텍스트 wrapper에
   `flex: 1` 누락(→ `RoutineItem`/`Card`와 동일 패턴 적용), `overlay`/`sheet`를 `Pressable`로 바꿔
   배경 탭 시 닫히도록 추가.

## 다음 확인 필요

- [ ] 저녁 회고(reflection) 화면을 실제 계정으로 끝까지 눌러보기 (무드 선택 → AI 피드백/내일 스케줄 카드
      표시까지) — DB 레벨 시뮬레이션과 curl 테스트만 통과한 상태, 실제 클릭 테스트는 아직
- [x] `schedule.tsx`/`home.tsx`의 "+ 직접 루틴 추가하기" — `(modals)/add-routine.tsx` 바텀시트 +
      `scheduleStore.addBlock`으로 구현 완료 (2026-07-04)

---

*마지막 업데이트: 2026-07-03 | Expo SDK 56 | 프로젝트 루트: `/Users/ickhwanyu/Desktop/design-portfolio/NewHuman/mobile`*
