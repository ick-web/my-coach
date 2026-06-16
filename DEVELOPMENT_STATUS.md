# MyCoach 모바일 앱 개발 현황

> 마지막 업데이트: 2026-06-15

## 프로젝트 구조

- **위치**: `/Users/ickhwanyu/Desktop/NewHuman/mobile`
- **스택**: Expo (SDK 56) + Expo Router + TypeScript + react-native-svg
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
| SCR-10a/10b 로딩 (생성 중 → 완료) | `(onboarding)/loading.tsx` | 진행률 애니메이션(0→100%) → 자동 전환 |
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
- ✅ UX-005: SCR-01/08/09 온보딩 — `StepIndicator`에 "Step X / 3" 라벨 + 진행 바 추가 (기존 도트와 함께 표시)
- ✅ UX-006: SCR-02 진척 카드 — `ProgressCard`를 `completed`/`total` 기반으로 재구성, "2 / 6 완료 · 33%"와 "🔥 스트릭 12일째!" 배지를 분리 표시
- ✅ UX-007: SCR-03 — "↕ 길게 눌러 드래그하여 순서를 변경하세요" 안내 텍스트 추가 (기존 6-dot 드래그 핸들과 함께)
- ✅ UX-010: SCR-06 목표 달성 예측 — `InfoIcon` ⓘ 추가 + "최근 7일 완료율 기준 산출" 캡션 표시
- ✅ UX-012: SCR-10c 빈 상태 — 🗓️ 이모지를 `CalendarIcon` SVG로 교체

잔여 Major 이슈 없음 (5건 모두 코드 반영 완료, 2026-06-15)

## 상태 관리 (`src/stores/`)

> 추가일: 2026-06-16 | 패키지: `zustand ^5`, `@react-native-async-storage/async-storage 2.2.0`

| 스토어 | 파일 | 영속화 | 내용 |
|--------|------|--------|------|
| `useScheduleStore` | `stores/scheduleStore.ts` | ✗ (API 연동 시 교체) | 루틴 블록 목록, loadStatus(`idle/loading/empty/error`), streakDays, completeCheckin/skipBlock/reorderBlocks |
| `useOnboardingStore` | `stores/onboardingStore.ts` | ✅ AsyncStorage | goal, rolemodel, lifestyleTags — 온보딩 3단계 간 공유 |
| `useNotificationStore` | `stores/notificationStore.ts` | ✅ AsyncStorage | 토글 7종 + 방해금지 시간 — 앱 재시작 후에도 유지 |

### 타입 (`src/types/index.ts`)

```typescript
type RoutineBlock = {
  id: string; time: string; task: string;
  duration: string;        // 표시용 "15분"
  durationMinutes: number; // 체크인 스테퍼용
  status: RoutineStatus;
};
```

### 화면 연결 현황

| 화면 | 연결된 스토어 | 변경 내용 |
|------|--------------|-----------|
| `home.tsx` | `scheduleStore` | DUMMY_ROUTINES → 스토어 블록, HOME_STATE → loadStatus, 체크인 라우트에 `?id=` 파라미터 추가 |
| `schedule.tsx` | `scheduleStore` | DUMMY_BLOCKS → 스토어 블록, 날짜 포맷 함수 추가 |
| `settings.tsx` | `notificationStore` | 모든 `useState` → 스토어 setter (변경 즉시 AsyncStorage 자동 저장) |
| `step1.tsx` | `onboardingStore` | 로컬 state → 스토어 (뒤로가도 입력값 유지) |
| `step2.tsx` | `onboardingStore` | 로컬 state → 스토어 |
| `checkin.tsx` | `scheduleStore` | `useLocalSearchParams({ id })` → 블록 조회, 완료/건너뜀 시 스토어 업데이트 |

## 검증

- `npx tsc --noEmit` 통과 (타입 에러 없음)
- Expo Web 빌드 + Playwright 스크린샷으로 `final/scr-XX.png`와 구조 대조
  - `/login`, `/home`, `/dashboard`, `/schedule`, `/settings`, `/checkin` 6개 라우트 콘솔 에러 없이 정상 렌더링 확인
  - 시각 검증에서 발견된 폴리시 항목 5개(소셜 아이콘, 진척도 카드 네이비 스타일, 대시보드 스트릭 캘린더/목표 달성 예측, 설정 전체 알림/방해금지 시간, 체크인 모달 소요시간/메모) 전부 반영 완료
  - 2026-06-15: 잔여 Major UX 5건(005/006/007/010/012) 코드 반영 후 `/step1`, `/home`, `/schedule`, `/dashboard` Playwright 스크린샷으로 콘솔 에러 없이 정상 렌더링 확인
- 2026-06-16: 상태 관리 도입 후 `npx tsc --noEmit` 통과

## 다음 단계

- 인증(소셜 로그인 실제 연동)
- AI 스케줄 생성 API 연동 (Claude API) — `onboardingStore`의 goal/rolemodel/lifestyleTags를 페이로드로 사용
- 백엔드 API 연동 — `scheduleStore.setBlocks()`를 API 응답으로 채움
