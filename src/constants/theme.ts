/**
 * MyCoach 디자인 토큰
 * 출처: CLAUDE.md "디자인 시스템" 섹션 (컬러 토큰 / 텍스트 스타일 / 컴포넌트 패턴 / Spacing)
 */

export const Colors = {
  primary: '#2563EB',
  navy: '#1E3A5F',
  orange: '#F97316',

  // 루틴 상태 배경
  statusBg: {
    done: '#DCFCE7',
    active: '#DBEAFE',
    skipped: '#F3F4F6',
    delayed: '#FEF3C7',
    todo: '#FFFFFF',
  },
  // 루틴 상태 아이콘 색상
  statusIcon: {
    done: '#16A34A',
    active: '#FFFFFF',
    todo: '#D1D5DB',
    delayed: '#D97706',
    skipped: '#9CA3AF',
  },

  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  background: '#FFFFFF',

  // 탭바
  tabActive: '#2563EB',
  tabInactive: '#9CA3AF',
} as const;

export const Typography = {
  body: { fontSize: 14, fontWeight: '400' as const },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const },
  statValue: { fontSize: 22, fontWeight: '700' as const },
  subtext: { fontSize: 12, fontWeight: '400' as const, color: Colors.subtext },
  button: { fontSize: 15, fontWeight: '700' as const },
  tabLabel: { fontSize: 11, fontWeight: '500' as const },
} as const;

export const Radius = {
  cardSm: 12,
  cardLg: 20,
  buttonPrimary: 16,
  buttonGhost: 8,
  input: 14,
  toggle: 14,
} as const;

// 4px 기준 Spacing 스케일
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  screenMargin: 20,
  section: 24,
  group: 32,
  headerPad: 40,
} as const;

// followup 문서 기준 실측 컴포넌트 치수
export const Sizes = {
  buttonPrimary: { width: 342, height: 56 },
  buttonSecondary: { width: 158, height: 56 },
  buttonSmall: { width: 92, height: 32 },
  input: { width: 342, height: 54 },
  tagDefault: { width: 80, height: 36 },
  tagDuration: { width: 44, height: 22 },
  toggle: { width: 48, height: 28 },
  routineItem: { width: 342, minHeight: 64 },
  cardProgress: { width: 342, minHeight: 100 },
  cardKpi: { width: 104, height: 92 },
  tabBar: { height: 84 },
} as const;
