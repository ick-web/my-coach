# MyCoach 모바일 앱 개발 현황

> 마지막 업데이트: 2026-06-21

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
| SCR-05 저녁 회고 모달 | `(modals)/reflection.tsx` | 이모지+레이블 기분 평가(선택 상태 배경), 메모 입력, "기록 완료" |

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

## 다음 단계

- [ ] Apple OAuth 설정 (Supabase Dashboard) — 보류, Apple Developer Program 가입 필요
- [ ] 카카오 로그인 — 네이티브 빌드(iOS/Android) 테스트 시 Redirect URI 추가 등록
- [ ] FastAPI 서버 개발 — `POST /generate-schedule` (Claude API 호출), `POST /feedback`
- [ ] iOS/Android 스탠드얼론 빌드용 Google Client ID 추가 (`.env`)
- [ ] FCM 푸시 알림 연동
- [ ] SCR-06 대시보드 실제 통계 데이터 연동 (현재 하드코딩)
