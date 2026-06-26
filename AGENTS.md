# AGENTS.md — MyCoach Mobile

AI 에이전트가 이 프로젝트에서 코드를 작성하기 전에 반드시 읽어야 하는 운영 가이드입니다.

---

## 필수 선행 작업

### 1. Expo SDK 56 문서 확인

Expo API는 버전마다 크게 바뀝니다. 코드 작성 전 **반드시** 정확한 버전 문서를 먼저 확인하세요:

```
https://docs.expo.dev/versions/v56.0.0/
```

훈련 데이터의 Expo 지식은 구버전일 수 있습니다. 추측하지 말고 문서를 읽으세요.

### 2. 환경 확인

```bash
# 타입 에러 확인
npx tsc --noEmit

# 개발 서버 (웹)
npx expo start --web

# 린트
npm run lint
```

---

## 프로젝트 컨텍스트

- **CLAUDE.md** — 디자인 토큰, Figma 노드 ID, Supabase 스키마, known gotchas 전체 포함. 작업 전 읽을 것.
- **DEVELOPMENT_STATUS.md** — 화면별 구현 현황, 스토어 연결 상태, UX 감사 반영 내역.
- **src/constants/theme.ts** — 모든 색상·타이포·간격 값의 단일 소스. 인라인 하드코딩 금지.

---

## 코드 규칙

### 임포트 경로

`tsconfig.json`의 path alias 사용:

```typescript
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useScheduleStore } from '@/stores/scheduleStore';
```

### 디자인 토큰 사용

스타일에 색상·크기를 직접 쓰지 말고 항상 `theme.ts` 토큰 참조:

```typescript
// ❌ 금지
color: '#2563EB'

// ✅ 올바름
color: Colors.primary
```

### 아이콘

모든 아이콘은 `src/components/icons/` 내 SVG 컴포넌트 사용. 이모지로 UI 아이콘을 대체하지 말 것.

```
TabBarIcons.tsx       — 탭바 4종
RoutineStatusIcons.tsx — 루틴 상태 5종
MiscIcons.tsx         — 벨/설정/sparkle/plus/refresh/warning
SocialIcons.tsx       — 카카오/Google/Apple
```

### 상태 관리

화면에서 Supabase를 직접 호출하지 말 것 (로그인 제외). 반드시 스토어를 경유:

```typescript
// ❌ 금지 — 화면에서 직접 호출
const { data } = await supabase.from('routine_blocks').select('*');

// ✅ 올바름 — 스토어 사용
const { blocks, fetchToday } = useScheduleStore();
```

예외: `(auth)/login.tsx`는 `supabase` 직접 사용 (인증 플로우 특성상).

---

## 절대 변경 금지

| 파일 | 이유 |
|------|------|
| `metro.config.js` | `ws` 모듈 스텁 처리 — 건드리면 RN 번들 크래시 |
| `src/lib/ws-noop.js` | `ws` no-op 스텁 — 삭제 금지 |
| `supabase.ts`의 동적 `require('ws')` | 정적 `import ws from 'ws'`로 변경하면 Metro 번들 오류 |
| `supabase.ts`의 `detectSessionInUrl` 로직 | `Platform.OS === 'web'`만 true — 변경 시 네이티브 세션 복원 실패 |
| `auth-kakao` Edge Function의 `verifyOtp({ type: 'email' })` | `'magiclink'`로 바꾸면 기존 유저 재로그인 실패 |

---

## 라우트 그룹 구조

```
(auth)         — 비인증 화면 (login)
(onboarding)   — 최초 온보딩 플로우 (step1~3, loading, complete)
(tabs)         — 메인 탭 화면 (home, schedule, dashboard, settings)
(modals)       — 모달 오버레이 (checkin, reflection)
```

`_layout.tsx`의 `AuthGuard`가 세션 유무에 따라 `(auth)` ↔ `(tabs)` 를 전환.
온보딩 완료 여부는 `goals` 테이블에 `is_active = true` 레코드 존재 여부로 판단.

---

## 새 화면 추가 시 체크리스트

- [ ] 해당 SCR 번호의 Figma 노드 ID 확인 (CLAUDE.md 참조)
- [ ] 올바른 라우트 그룹 `(auth)` / `(onboarding)` / `(tabs)` / `(modals)` 에 파일 배치
- [ ] `theme.ts` 토큰만 사용 (인라인 색상·크기 금지)
- [ ] 필요한 데이터는 스토어를 통해서만 접근
- [ ] `npx tsc --noEmit` 통과 확인

## 새 스토어 추가 시 체크리스트

- [ ] Zustand 5 문법 사용 (`create` + TypeScript)
- [ ] 영속화 필요 시: 네이티브는 SecureStore / 웹은 AsyncStorage 분기 처리
- [ ] 낙관적 업데이트 패턴 — UI 먼저 반영 후 DB 동기화

---

## Supabase CLI 명령어

```bash
# Edge Function 로컬 테스트
supabase functions serve auth-kakao --env-file .env.local

# Edge Function 배포
supabase functions deploy auth-kakao

# DB 마이그레이션 적용
supabase db push

# TypeScript 타입 재생성
supabase gen types typescript --project-id nswfgdyjpaorxfqbdnhv > src/lib/database.types.ts
```

---

## iOS 시뮬레이터 (코드 사이닝 없이)

```bash
# 1. Xcode에서 최초 1회 빌드 (Signing & Capabilities 설정 후 ⌘B)

# 2. 시뮬레이터에 설치 및 실행
xcrun simctl install 6B4E3CA6-6F0F-4630-83F2-43A323BBF027 \
  "$(find ~/Library/Developer/Xcode/DerivedData -name 'mobile.app' -path '*iphonesimulator*' | head -1)"
xcrun simctl launch 6B4E3CA6-6F0F-4630-83F2-43A323BBF027 com.mycoach.app

# 3. Metro 번들러
npx expo start --port 8081 --clear
```
