import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import type { RoutineBlock, RoutineStatus } from '@/types';

export type LoadStatus = 'idle' | 'loading' | 'empty' | 'error';

type ScheduleState = {
  date: string;
  scheduleId: string | null;
  blocks: RoutineBlock[];
  loadStatus: LoadStatus;
  streakDays: number;
  // 오늘 스케줄 로드
  fetchToday: () => Promise<void>;
  // 체크인 완료
  completeCheckin: (id: string, actualDuration: number, note?: string) => Promise<void>;
  // 건너뜀
  skipBlock: (id: string) => Promise<void>;
  // 순서 변경 (로컬 즉시 반영 후 DB 배치 업데이트)
  reorderBlocks: (fromIndex: number, toIndex: number) => Promise<void>;
};

export const useScheduleStore = create<ScheduleState>()((set, get) => ({
  date: new Date().toISOString().slice(0, 10),
  scheduleId: null,
  blocks: [],
  loadStatus: 'idle',
  streakDays: 0,

  fetchToday: async () => {
    const today = new Date().toISOString().slice(0, 10);
    set({ loadStatus: 'loading', date: today });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loadStatus: 'error' });
      return;
    }

    // 오늘 스케줄 조회
    const { data: schedule, error: schedErr } = await supabase
      .from('daily_schedules')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (schedErr) {
      set({ loadStatus: 'error' });
      return;
    }

    if (!schedule) {
      set({ scheduleId: null, blocks: [], loadStatus: 'empty' });
      return;
    }

    // 루틴 블록 조회
    const { data: rows, error: blockErr } = await supabase
      .from('routine_blocks')
      .select('*')
      .eq('schedule_id', schedule.id)
      .order('sort_order');

    if (blockErr) {
      set({ loadStatus: 'error' });
      return;
    }

    const blocks: RoutineBlock[] = (rows ?? []).map((r) => ({
      id: r.id,
      time: r.time,
      task: r.task,
      duration: r.duration_label,
      durationMinutes: r.duration_minutes,
      status: r.status as RoutineStatus,
    }));

    // 스트릭 조회
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('total_completed_days')
      .eq('user_id', user.id)
      .maybeSingle();

    set({
      scheduleId: schedule.id,
      blocks,
      loadStatus: blocks.length === 0 ? 'empty' : 'idle',
      streakDays: streak?.total_completed_days ?? 0,
    });
  },

  completeCheckin: async (id, actualDuration, note) => {
    // 낙관적 업데이트
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: 'done' as RoutineStatus, durationMinutes: actualDuration } : b
      ),
    }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await Promise.all([
      supabase
        .from('routine_blocks')
        .update({ status: 'done', duration_minutes: actualDuration })
        .eq('id', id),
      supabase
        .from('checkins')
        .insert({ block_id: id, user_id: user.id, actual_duration: actualDuration, note }),
    ]);
  },

  skipBlock: async (id) => {
    // 낙관적 업데이트
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: 'skipped' as RoutineStatus } : b
      ),
    }));

    await supabase
      .from('routine_blocks')
      .update({ status: 'skipped' })
      .eq('id', id);
  },

  reorderBlocks: async (fromIndex, toIndex) => {
    const blocks = [...get().blocks];
    const [moved] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, moved);

    // 로컬 즉시 반영
    set({ blocks });

    // DB 배치 업데이트
    const updates = blocks.map((b, i) =>
      supabase.from('routine_blocks').update({ sort_order: i }).eq('id', b.id)
    );
    await Promise.all(updates);
  },
}));
