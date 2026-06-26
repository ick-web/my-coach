# MyCoach — Mobile App

AI 기반 개인화 라이프스타일 코칭 앱. 직업 목표·롤모델·라이프스타일을 입력하면 Claude AI가 맞춤형 하루 스케줄을 자동 생성하고, 알림·진척 관리·AI 피드백으로 습관 형성을 지원합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React Native / Expo SDK 56 |
| 라우팅 | Expo Router v4 (파일 기반) |
| 언어 | TypeScript 6 |
| 상태 관리 | Zustand 5 |
| 백엔드/DB | Supabase (Auth + PostgreSQL + Edge Functions) |
| AI 엔진 | Anthropic Claude API (FastAPI 서버 경유) |
| 그래픽 | react-native-svg |
| 애니메이션 | react-native-reanimated 4 |

---

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
EXPO_PUBLIC_SUPABASE_URL=https://nswfgdyjpaorxfqbdnhv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<Supabase Dashboard에서 확인>
EXPO_PUBLIC_AI_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=432177357591-ed5t2s30skii29slp85vm5gub2ini5kr.apps.googleusercontent.com
EXPO_PUBLIC_KAKAO_REST_API_KEY=<카카오 Developers에서 확인>
```

> Supabase Edge Function 시크릿(`KAKAO_REST_API_KEY`, `KAKAO_CLIENT_SECRET`)은 Supabase Dashboard → Edge Functions → Secrets에 별도 등록 필요. 클라이언트 `.env`에는 Client Secret을 절대 넣지 않을 것.

### 3. 앱 실행

```bash
# 개발 서버 시작 (Expo Go / 웹)
npm start

# 웹 브라우저
npm run web

# Android 에뮬레이터
npm run android

# iOS 시뮬레이터 (아래 별도 안내 참고)
npm run ios
```

---

## iOS 시뮬레이터 실행 (코드 사이닝 없이)

`expo run:ios`는 코드 사이닝 인증서가 없으면 실행 불가. 아래 방법으로 우회합니다.

**1단계 — Xcode에서 최초 빌드 (1회만)**

`ios/mobile.xcworkspace`를 Xcode로 열고 Signing & Capabilities 탭에서:
- Automatically manage signing 체크
- Team 선택
- Bundle ID: `com.mycoach.app` 입력

`⌘B`로 빌드 (DerivedData에 `.app` 생성됨)

**2단계 — 시뮬레이터에 설치 및 실행**

```bash
xcrun simctl install 6B4E3CA6-6F0F-4630-83F2-43A323BBF027 \
  "$(find ~/Library/Developer/Xcode/DerivedData -name 'mobile.app' -path '*iphonesimulator*' | head -1)"

xcrun simctl launch 6B4E3CA6-6F0F-4630-83F2-43A323BBF027 com.mycoach.app
```

**3단계 — Metro 번들러 시작**

```bash
npx expo start --port 8081 --clear
```

---

## 프로젝트 구조

```
mobile/
├── src/
│   ├── app/                      # Expo Router 라우트
│   │   ├── _layout.tsx           # AuthGuard + 세션 복원
│   │   ├── (auth)/
│   │   │   └── login.tsx         # SCR-00 로그인/회원가입
│   │   ├── (onboarding)/
│   │   │   ├── step1.tsx         # SCR-01 직업목표·롤모델 입력
│   │   │   ├── step2.tsx         # SCR-08 라이프스타일 키워드 선택
│   │   │   ├── step3.tsx         # SCR-09 AI 스케줄 생성 확인
│   │   │   ├── loading.tsx       # SCR-10a/10b 로딩 (진행률 표시)
│   │   │   └── complete.tsx      # SCR-11 완료 축하 + 소셜 공유
│   │   ├── (tabs)/
│   │   │   ├── home.tsx          # SCR-02 홈 (루틴 리스트 + 진척도)
│   │   │   ├── schedule.tsx      # SCR-03 스케줄 수정
│   │   │   ├── dashboard.tsx     # SCR-06 주간 대시보드
│   │   │   └── settings.tsx      # SCR-07 알림 설정
│   │   └── (modals)/
│   │       ├── checkin.tsx       # SCR-04 체크인 모달
│   │       └── reflection.tsx    # SCR-05 저녁 회고 모달
│   ├── components/
│   │   ├── icons/
│   │   │   ├── TabBarIcons.tsx   # 탭바 아이콘 (홈/스케줄/대시보드/설정)
│   │   │   ├── RoutineStatusIcons.tsx  # 루틴 상태 아이콘 (완료/진행중/예정/지연/건너뜀)
│   │   │   ├── MiscIcons.tsx     # 벨/설정/sparkle/plus/refresh/warning
│   │   │   └── SocialIcons.tsx   # 카카오/Google/Apple 브랜드 로고
│   │   ├── onboarding/
│   │   │   └── StepIndicator.tsx # 단계 표시 도트 + 진행 바
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Tag.tsx
│   │       ├── Toggle.tsx
│   │       ├── Card.tsx          # ProgressCard / KPICard / AIBannerCard
│   │       └── RoutineItem.tsx   # 5종 상태 루틴 항목
│   ├── constants/
│   │   └── theme.ts              # 컬러·타이포·radius·spacing 토큰
│   ├── lib/
│   │   ├── supabase.ts           # Supabase 클라이언트 (SecureStore 세션)
│   │   ├── database.types.ts     # DB 테이블 TypeScript 타입
│   │   └── ws-noop.js            # React Native 환경 ws 스텁
│   ├── stores/
│   │   ├── authStore.ts          # 세션 복원 + onAuthStateChange
│   │   ├── scheduleStore.ts      # 루틴 CRUD (낙관적 업데이트)
│   │   ├── onboardingStore.ts    # Goal 저장 + AI 스케줄 생성 호출
│   │   └── notificationStore.ts  # 알림 토글 (AsyncStorage 영속화)
│   └── types/
│       └── index.ts              # 공통 타입 정의
├── supabase/
│   ├── functions/
│   │   └── auth-kakao/           # 카카오 OAuth Edge Function
│   │       └── index.ts
│   └── migrations/
│       └── 20260618000000_initial_schema.sql
├── app.json
├── metro.config.js
└── tsconfig.json
```

---

## 화면 목록

| 화면 ID | 경로 | 설명 |
|---------|------|------|
| SCR-00 | `(auth)/login` | 로그인/회원가입 — 소셜 3종 + 이메일 |
| SCR-01 | `(onboarding)/step1` | 온보딩 Step 1 — 직업목표·롤모델 |
| SCR-08 | `(onboarding)/step2` | 온보딩 Step 2 — 라이프스타일 키워드 |
| SCR-09 | `(onboarding)/step3` | 온보딩 Step 3 — AI 스케줄 생성 확인 |
| SCR-10a/10b | `(onboarding)/loading` | 로딩 — 진행률 스피너 → 완료 전환 |
| SCR-11 | `(onboarding)/complete` | 완료 축하 + 소셜 공유 |
| SCR-02 | `(tabs)/home` | 홈 — 오늘 루틴 리스트 + 진척도 카드 |
| SCR-03 | `(tabs)/schedule` | 스케줄 수정 — 드래그 재정렬 + 루틴 추가 |
| SCR-06 | `(tabs)/dashboard` | 주간 대시보드 — KPI·완료율 차트·스트릭 캘린더 |
| SCR-07 | `(tabs)/settings` | 알림 설정 — 방해금지 시간 + 개별 토글 |
| SCR-04 | `(modals)/checkin` | 체크인 모달 — 완료/건너뜀 + 소요 시간 |
| SCR-05 | `(modals)/reflection` | 저녁 회고 — 기분 평가 + 메모 |
| SCR-10c | (home 내 분기) | 빈 상태 — 오늘 등록된 루틴 없음 |
| SCR-10d | (home 내 분기) | 에러 상태 — 일정 로드/생성 실패 |

---

## Supabase 데이터베이스 스키마

```
profiles         id(uuid), email, name, subscription_tier, created_at
goals            id, user_id, title, rolemodel, lifestyle_tags[], is_active
daily_schedules  id, user_id, date  (unique: user_id + date)
routine_blocks   id, schedule_id, user_id, time, task, duration_label,
                 duration_minutes, status, sort_order
checkins         id, block_id, user_id, actual_duration, note, completed_at
feedbacks        id, user_id, date, ai_summary, score, next_schedule_preview(jsonb)

뷰: user_streaks — 유저별 루틴 완료일 수 집계
```

모든 테이블에 Row Level Security(RLS) 활성화 — 본인 데이터만 접근 가능.

---

## 인증 설정 현황

| 프로바이더 | 상태 | 비고 |
|----------|------|------|
| Google | ✅ 완료 | `signInWithOAuth` — 웹 리다이렉트 + 네이티브 `openAuthSessionAsync` |
| 카카오 | ✅ 완료 | `auth-kakao` Edge Function 배포 완료, 웹 로그인 테스트 완료 |
| Apple | ⬜ 미설정 | Apple Developer Program(연 $99) 가입 필요 |

### 카카오 로그인 플로우

1. 클라이언트가 카카오 인가 코드 + `redirectUri` → `auth-kakao` Edge Function 전달
2. Edge Function이 카카오 액세스 토큰 교환 → 사용자 정보 조회
3. `admin.generateLink({ type: 'magiclink' })`로 Supabase 매직링크 토큰 발급
4. `verifyOtp({ type: 'email', token_hash })`로 세션 토큰 교환 후 클라이언트에 반환
5. 클라이언트가 `supabase.auth.setSession()` 호출

> `verifyOtp`의 `type`은 `'magiclink'`가 아닌 **`'email'`**을 사용해야 함 (기존 유저 재로그인 시 토큰 검증 실패 방지).

---

## 남은 작업

- [ ] Apple OAuth 설정 — Apple Developer Program 가입 후 진행
- [ ] 카카오 로그인 네이티브 빌드 테스트 — 카카오 콘솔 Redirect URI에 `mobile://` 추가 필요
- [ ] Google 로그인 네이티브 빌드 테스트 — Supabase Redirect URLs에 `mobile://` 추가 필요
- [ ] FastAPI 서버 개발 — `POST /generate-schedule`, `POST /feedback` (Claude API 연동)
- [ ] FCM 푸시 알림 연동
- [ ] SCR-06 대시보드 실제 통계 데이터 연동 (현재 하드코딩)
- [ ] iOS/Android 스탠드얼론 빌드용 Google Client ID 추가

---

## 관련 문서

| 문서 | 경로 |
|------|------|
| 개발 현황 상세 | `DEVELOPMENT_STATUS.md` |
| Figma 디자인 | [NewHuman](https://www.figma.com/design/gCMlFaYYSMBNf80fSRpg2R/NewHuman) |
| PRD | `/mnt/project/MyCoach_PRD_v0_1.docx` |
| 화면정의서 | `/mnt/project/MyCoach_화면정의서_v0_1.docx` |

---

*v1.0 출시 목표: 2026년 11월 초 | 플랫폼: iOS / Android / Web*
