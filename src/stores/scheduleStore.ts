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
  // 루틴 직접 추가
  addBlock: (time: string, task: string, durationMinutes: number) => Promise<void>;
  // 루틴 삭제
  deleteBlock: (id: string) => Promise<void>;
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

  addBlock: async (time, task, durationMinutes) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let scheduleId = get().scheduleId;
    const date = get().date;

    if (!scheduleId) {
      const { data: newSchedule, error: createErr } = await supabase
        .from('daily_schedules')
        .insert({ user_id: user.id, date })
        .select('id')
        .single();

      if (createErr || !newSchedule) return;
      scheduleId = newSchedule.id;
    }

    const durationLabel = `${durationMinutes}분`;

    // 시간순으로 삽입될 위치 계산 (blocks는 sort_order 순 = 시간순으로 정렬돼 있음)
    const existingBlocks = get().blocks;
    const insertIndex = existingBlocks.findIndex((b) => b.time > time);
    const sortOrder = insertIndex === -1 ? existingBlocks.length : insertIndex;

    // 삽입 위치 이후 블록들의 sort_order를 한 칸씩 밀어서 자리 확보
    const blocksToShift = insertIndex === -1 ? [] : existingBlocks.slice(insertIndex);
    if (blocksToShift.length > 0) {
      await Promise.all(
        blocksToShift.map((b, i) =>
          supabase
            .from('routine_blocks')
            .update({ sort_order: sortOrder + 1 + i })
            .eq('id', b.id)
        )
      );
    }

    const { data: row, error: insertErr } = await supabase
      .from('routine_blocks')
      .insert({
        schedule_id: scheduleId,
        user_id: user.id,
        time,
        task,
        duration_label: durationLabel,
        duration_minutes: durationMinutes,
        status: 'todo',
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertErr || !row) return;

    const newBlock: RoutineBlock = {
      id: row.id,
      time: row.time,
      task: row.task,
      duration: row.duration_label,
      durationMinutes: row.duration_minutes,
      status: row.status as RoutineStatus,
    };

    set((s) => {
      const blocks = [...s.blocks];
      blocks.splice(sortOrder, 0, newBlock);
      return { scheduleId, loadStatus: 'idle', blocks };
    });
  },

  deleteBlock: async (id) => {
    // 낙관적 업데이트
    set((s) => {
      const blocks = s.blocks.filter((b) => b.id !== id);
      return { blocks, loadStatus: blocks.length === 0 ? 'empty' : s.loadStatus };
    });

    await supabase.from('routine_blocks').delete().eq('id', id);
  },
}));
