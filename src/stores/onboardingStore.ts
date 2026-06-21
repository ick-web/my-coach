import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type OnboardingState = {
  goal: string;
  rolemodel: string;
  lifestyleTags: string[];
  setGoal: (goal: string) => void;
  setRolemodel: (rolemodel: string) => void;
  setLifestyleTags: (tags: string[]) => void;
  reset: () => void;
  // Goal을 DB에 저장하고 AI 스케줄 생성 요청 (onboarding/loading 화면에서 호출)
  saveGoalAndGenerateSchedule: (
    onProgress: (pct: number) => void
  ) => Promise<'success' | 'error'>;
};

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  goal: '',
  rolemodel: '',
  lifestyleTags: [],

  setGoal: (goal) => set({ goal }),
  setRolemodel: (rolemodel) => set({ rolemodel }),
  setLifestyleTags: (lifestyleTags) => set({ lifestyleTags }),
  reset: () => set({ goal: '', rolemodel: '', lifestyleTags: [] }),

  saveGoalAndGenerateSchedule: async (onProgress) => {
    const { goal, rolemodel, lifestyleTags } = get();
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

      // 2. FastAPI AI 서빙 서버에 스케줄 생성 요청
      const aiRes = await fetch(`${process.env.EXPO_PUBLIC_AI_API_URL}/generate-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, rolemodel, lifestyle_tags: lifestyleTags }),
      });
      if (!aiRes.ok) throw new Error('AI API error');
      const { blocks: aiBlocks } = await aiRes.json() as {
        blocks: Array<{
          time: string;
          task: string;
          duration_label: string;
          duration_minutes: number;
        }>;
      };
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
    } catch {
      return 'error';
    }
  },
}));
