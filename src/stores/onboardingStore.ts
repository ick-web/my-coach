import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type OnboardingState = {
  goal: string;
  rolemodel: string;
  lifestyleTags: string[];
  wakeTime: string;
  sleepTime: string;
  setGoal: (goal: string) => void;
  setRolemodel: (rolemodel: string) => void;
  setLifestyleTags: (tags: string[]) => void;
  setWakeTime: (time: string) => void;
  setSleepTime: (time: string) => void;
  reset: () => void;
  saveGoalAndGenerateSchedule: (
    onProgress: (pct: number) => void
  ) => Promise<'success' | 'error'>;
};

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  goal: '',
  rolemodel: '',
  lifestyleTags: [],
  wakeTime: '07:00',
  sleepTime: '23:00',

  setGoal: (goal) => set({ goal }),
  setRolemodel: (rolemodel) => set({ rolemodel }),
  setLifestyleTags: (lifestyleTags) => set({ lifestyleTags }),
  setWakeTime: (wakeTime) => set({ wakeTime }),
  setSleepTime: (sleepTime) => set({ sleepTime }),
  reset: () => set({ goal: '', rolemodel: '', lifestyleTags: [], wakeTime: '07:00', sleepTime: '23:00' }),

  saveGoalAndGenerateSchedule: async (onProgress) => {
    const { goal, rolemodel, lifestyleTags, wakeTime, sleepTime } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'error';

    try {
      onProgress(10);

      // 1. 기존 활성 Goal 비활성화 후 신규 저장
      await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data: savedGoal, error: goalErr } = await supabase
        .from('goals')
        .insert({ user_id: user.id, title: goal, rolemodel, lifestyle_tags: lifestyleTags })
        .select('id')
        .single();

      if (goalErr || !savedGoal) throw goalErr;
      onProgress(30);

      // 2. Edge Function으로 스케줄 생성 요청
      const { data: aiData, error: aiError } = await supabase.functions.invoke<{
        blocks: Array<{
          time: string;
          task: string;
          duration_label: string;
          duration_minutes: number;
        }>;
      }>('generate-schedule', {
        body: {
          goal,
          rolemodel,
          lifestyle_tags: lifestyleTags,
          wake_time: wakeTime,
          sleep_time: sleepTime,
        },
      });

      if (aiError || !aiData) throw aiError ?? new Error('AI API error');
      const aiBlocks = aiData.blocks;
      onProgress(65);

      // 3. DailySchedule + RoutineBlock 저장
      const today = new Date().toISOString().slice(0, 10);

      const { data: schedule, error: schedErr } = await supabase
        .from('daily_schedules')
        .upsert({ user_id: user.id, date: today }, { onConflict: 'user_id,date' })
        .select('id')
        .single();

      if (schedErr || !schedule) throw schedErr;
      onProgress(80);

      // 같은 날 재온보딩 시 기존 블록 삭제 후 재생성
      await supabase
        .from('routine_blocks')
        .delete()
        .eq('schedule_id', schedule.id);

      const blockRows = aiBlocks.map((b, i) => ({
        schedule_id: schedule.id,
        user_id: user.id,
        time: b.time,
        task: b.task,
        duration_label: b.duration_label,
        duration_minutes: b.duration_minutes,
        sort_order: i,
      }));

      const { error: blockErr } = await supabase
        .from('routine_blocks')
        .insert(blockRows);

      if (blockErr) throw blockErr;
      onProgress(100);

      get().reset();
      return 'success';
    } catch (e) {
      console.error('saveGoalAndGenerateSchedule 오류', e);
      return 'error';
    }
  },
}));
