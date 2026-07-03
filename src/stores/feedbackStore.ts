import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import type { RoutineBlock } from '@/types';

export type MoodKey = 'bad' | 'meh' | 'okay' | 'good' | 'great';
export type FeedbackStatus = 'idle' | 'loading-today' | 'ready' | 'generating' | 'done' | 'error';

type ExistingFeedback = {
  aiSummary: string;
  mood: MoodKey;
  nextPreview: RoutineBlock[];
};

type PreviewBlock = {
  time: string;
  task: string;
  duration_label: string;
  duration_minutes: number;
};

type FeedbackState = {
  status: FeedbackStatus;
  completionRate: number;
  completedCount: number;
  totalCount: number;
  deltaVsYesterday: number;
  existingFeedback: ExistingFeedback | null;
  aiSummary: string;
  nextPreview: RoutineBlock[];
  selectedMood: MoodKey | null;
  loadToday: () => Promise<void>;
  submitMood: (mood: MoodKey) => Promise<void>;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function previewToRoutineBlocks(blocks: PreviewBlock[]): RoutineBlock[] {
  return blocks.slice(0, 4).map((b, i) => ({
    id: `preview-${i}`,
    time: b.time,
    task: b.task,
    duration: b.duration_label,
    durationMinutes: b.duration_minutes,
    status: 'todo',
  }));
}

export const useFeedbackStore = create<FeedbackState>()((set, get) => ({
  status: 'idle',
  completionRate: 0,
  completedCount: 0,
  totalCount: 0,
  deltaVsYesterday: 0,
  existingFeedback: null,
  aiSummary: '',
  nextPreview: [],
  selectedMood: null,

  loadToday: async () => {
    set({ status: 'loading-today', selectedMood: null, aiSummary: '', nextPreview: [] });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ status: 'error' });
      return;
    }

    const today = todayStr();
    const yesterday = yesterdayStr();

    type ScheduleRow = { date: string; routine_blocks: Array<{ status: string }> | null };

    const { data: rows, error } = (await supabase
      .from('daily_schedules')
      .select('date, routine_blocks(status)')
      .eq('user_id', user.id)
      .in('date', [today, yesterday])) as { data: ScheduleRow[] | null; error: unknown };

    if (error) {
      set({ status: 'error' });
      return;
    }

    const todayRow = rows?.find((r) => r.date === today);
    const yesterdayRow = rows?.find((r) => r.date === yesterday);

    const todayBlocks = todayRow?.routine_blocks ?? [];
    const yesterdayBlocks = yesterdayRow?.routine_blocks ?? [];

    const todayDone = todayBlocks.filter((b) => b.status === 'done').length;
    const todayTotal = todayBlocks.length;
    const yesterdayDone = yesterdayBlocks.filter((b) => b.status === 'done').length;
    const completionRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    const { data: existing } = await supabase
      .from('feedbacks')
      .select('ai_summary, mood, next_schedule_preview')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      const preview = (existing.next_schedule_preview as PreviewBlock[] | null) ?? [];
      set({
        status: 'done',
        completionRate,
        completedCount: todayDone,
        totalCount: todayTotal,
        deltaVsYesterday: todayDone - yesterdayDone,
        existingFeedback: {
          aiSummary: existing.ai_summary ?? '',
          mood: existing.mood as MoodKey,
          nextPreview: previewToRoutineBlocks(preview),
        },
      });
      return;
    }

    set({
      status: 'ready',
      completionRate,
      completedCount: todayDone,
      totalCount: todayTotal,
      deltaVsYesterday: todayDone - yesterdayDone,
      existingFeedback: null,
    });
  },

  submitMood: async (mood) => {
    set({ status: 'generating', selectedMood: mood });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ status: 'error' });
      return;
    }

    const today = todayStr();

    try {
      const { data: schedule } = await supabase
        .from('daily_schedules')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const { data: blocks } = await supabase
        .from('routine_blocks')
        .select('task, status')
        .eq('schedule_id', schedule?.id ?? '');

      const completedTasks = (blocks ?? []).filter((b) => b.status === 'done').map((b) => b.task);
      const skippedTasks = (blocks ?? []).filter((b) => b.status === 'skipped').map((b) => b.task);

      const { data: goal } = await supabase
        .from('goals')
        .select('title, rolemodel, wake_time, sleep_time')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!goal) throw new Error('활성 목표를 찾을 수 없습니다.');

      const { completionRate } = get();

      const { data: aiData, error: aiError } = await supabase.functions.invoke<{
        ai_summary: string;
        next_blocks: PreviewBlock[];
      }>('generate-feedback', {
        body: {
          goal: goal.title,
          rolemodel: goal.rolemodel,
          completed_tasks: completedTasks,
          skipped_tasks: skippedTasks,
          completion_rate: completionRate,
          mood,
          wake_time: goal.wake_time,
          sleep_time: goal.sleep_time,
        },
      });

      if (aiError || !aiData) throw aiError ?? new Error('AI API error');

      const tomorrow = tomorrowStr();

      const { data: tomorrowSchedule, error: tomorrowSchedErr } = await supabase
        .from('daily_schedules')
        .upsert({ user_id: user.id, date: tomorrow }, { onConflict: 'user_id,date' })
        .select('id')
        .single();

      if (tomorrowSchedErr || !tomorrowSchedule) throw tomorrowSchedErr;

      await supabase.from('routine_blocks').delete().eq('schedule_id', tomorrowSchedule.id);

      const blockRows = aiData.next_blocks.map((b, i) => ({
        schedule_id: tomorrowSchedule.id,
        user_id: user.id,
        time: b.time,
        task: b.task,
        duration_label: b.duration_label,
        duration_minutes: b.duration_minutes,
        sort_order: i,
      }));

      const { error: blocksInsertError } = await supabase.from('routine_blocks').insert(blockRows);
      if (blocksInsertError) throw blocksInsertError;

      const { error: feedbackInsertError } = await supabase.from('feedbacks').insert({
        user_id: user.id,
        date: today,
        ai_summary: aiData.ai_summary,
        score: completionRate,
        mood,
        next_schedule_preview: aiData.next_blocks,
      });
      if (feedbackInsertError) throw feedbackInsertError;

      set({
        status: 'done',
        aiSummary: aiData.ai_summary,
        nextPreview: previewToRoutineBlocks(aiData.next_blocks),
      });
    } catch (e) {
      console.error('submitMood 오류', e);
      set({ status: 'error' });
    }
  },
}));
