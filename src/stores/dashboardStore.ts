import { create } from 'zustand';
import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

// ─── 날짜 헬퍼 ────────────────────────────────────────────────

function getThisWeekMonday(): Date {
  const today = new Date();
  const day = today.getDay(); // 0=일, 1=월
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

function getWeekLabel(): string {
  const monday = getThisWeekMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.getMonth() + 1}월 ${monday.getDate()}일 - ${sunday.getMonth() + 1}월 ${sunday.getDate()}일`;
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

// ─── 타입 ─────────────────────────────────────────────────────

type DashboardKpi = {
  avgCompletionRate: number;
  streakDays: number;
  goalCompletionRate: number;
};

type DashboardGoal = {
  title: string;
  rolemodel: string;
  etaDays: number;
  percent: number;
};

type DashboardState = {
  weekLabel: string;
  weekPercents: number[];
  streakDays14: boolean[];
  kpi: DashboardKpi;
  goal: DashboardGoal | null;
  insightText: string;
  loadStatus: 'idle' | 'loading' | 'error';
  fetchDashboard: () => Promise<void>;
};

// ─── 스토어 ───────────────────────────────────────────────────

export const useDashboardStore = create<DashboardState>()((set) => ({
  weekLabel: '',
  weekPercents: Array(7).fill(0) as number[],
  streakDays14: Array(14).fill(false) as boolean[],
  kpi: { avgCompletionRate: 0, streakDays: 0, goalCompletionRate: 0 },
  goal: null,
  insightText: '',
  loadStatus: 'idle',

  fetchDashboard: async () => {
    set({ loadStatus: 'loading' });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ loadStatus: 'error' });
      return;
    }

    try {
      const monday = getThisWeekMonday();
      const fourteenDaysAgo = daysAgo(13);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // 최근 14일 루틴 데이터 (이번 주 포함)
      type ScheduleRow = {
        date: string;
        routine_blocks: Array<{ status: string }> | null;
      };

      const { data: scheduleData, error: schedError } = (await supabase
        .from('daily_schedules')
        .select('date, routine_blocks(status)')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo)
        .order('date', { ascending: true })) as { data: ScheduleRow[] | null; error: PostgrestError | null };

      if (schedError) throw schedError;

      // 목표 정보
      const { data: goalData } = await supabase
        .from('goals')
        .select('title, rolemodel')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // 연속 스트릭
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('total_completed_days')
        .eq('user_id', user.id)
        .maybeSingle();

      // 날짜별 Map 구성
      type Block = { status: string };
      const byDate = new Map<string, Block[]>(
        (scheduleData ?? []).map((s) => [
          s.date,
          (s.routine_blocks as Block[] | null) ?? [],
        ])
      );

      // 이번 주 월(i=0)~일(i=6) 완료율, 미래 날짜는 0
      const weekPercents = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (d > today) return 0;
        const date = toDateStr(d);
        const blocks = byDate.get(date) ?? [];
        if (blocks.length === 0) return 0;
        const done = blocks.filter((b) => b.status === 'done').length;
        return Math.round((done / blocks.length) * 100);
      });

      // 최근 14일 스트릭 캘린더 (rolling)
      const streakDays14 = Array.from({ length: 14 }, (_, i) => {
        const date = daysAgo(13 - i);
        const blocks = byDate.get(date) ?? [];
        return blocks.some((b) => b.status === 'done');
      });

      // 오늘까지 지난 날만으로 평균 계산
      const passedPercents = weekPercents.filter((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d <= today;
      });
      const avgCompletionRate =
        passedPercents.length === 0
          ? 0
          : Math.round(
              passedPercents.reduce((sum, p) => sum + p, 0) /
                passedPercents.length
            );

      const streakDays = streakData?.total_completed_days ?? 0;

      // D-N 추정 (avg=0이면 -1 → 화면에서 "분석 중..." 표시)
      const etaDays =
        avgCompletionRate === 0
          ? -1
          : Math.ceil(((100 - avgCompletionRate) / avgCompletionRate) * 7);

      // 인사이트 텍스트
      const maxPct = Math.max(...weekPercents);
      const bestIdx = weekPercents.indexOf(maxPct);
      const bestDay = DAY_NAMES[bestIdx];
      const rolemodel = goalData?.rolemodel ?? '롤모델';
      const insightText =
        maxPct === 0
          ? `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 첫 루틴을 체크인해 보세요!`
          : `${rolemodel}처럼 꾸준한 루틴을 유지해보세요. 이번 주 ${bestDay}요일 완료율이 ${maxPct}%로 가장 높았어요.`;

      set({
        weekLabel: getWeekLabel(),
        weekPercents,
        streakDays14,
        kpi: {
          avgCompletionRate,
          streakDays,
          goalCompletionRate: avgCompletionRate,
        },
        goal: goalData
          ? {
              title: goalData.title,
              rolemodel: goalData.rolemodel,
              etaDays,
              percent: avgCompletionRate,
            }
          : null,
        insightText,
        loadStatus: 'idle',
      });
    } catch {
      set({ loadStatus: 'error' });
    }
  },
}));
