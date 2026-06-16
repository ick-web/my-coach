import { create } from 'zustand';

import type { RoutineBlock, RoutineStatus } from '@/types';

export type LoadStatus = 'idle' | 'loading' | 'empty' | 'error';

type ScheduleState = {
  date: string;
  blocks: RoutineBlock[];
  loadStatus: LoadStatus;
  streakDays: number;
  setBlocks: (blocks: RoutineBlock[], date: string) => void;
  setLoadStatus: (status: LoadStatus) => void;
  updateBlockStatus: (id: string, status: RoutineStatus) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  completeCheckin: (id: string, actualDuration: number) => void;
  skipBlock: (id: string) => void;
};

const SEED_BLOCKS: RoutineBlock[] = [
  { id: '1', time: '07:00', task: '아침 스트레칭', duration: '15분', durationMinutes: 15, status: 'done' },
  { id: '2', time: '08:00', task: '영어 회화 공부', duration: '30분', durationMinutes: 30, status: 'done' },
  { id: '3', time: '10:00', task: '포트폴리오 작업', duration: '90분', durationMinutes: 90, status: 'active' },
  { id: '4', time: '14:00', task: '이력서 첨삭', duration: '40분', durationMinutes: 40, status: 'delayed' },
  { id: '5', time: '18:00', task: '저녁 운동', duration: '30분', durationMinutes: 30, status: 'todo' },
  { id: '6', time: '21:00', task: '독서', duration: '20분', durationMinutes: 20, status: 'skipped' },
];

export const useScheduleStore = create<ScheduleState>()((set) => ({
  date: new Date().toISOString().slice(0, 10),
  blocks: SEED_BLOCKS,
  loadStatus: 'idle',
  streakDays: 12,

  setBlocks: (blocks, date) =>
    set({ blocks, date, loadStatus: blocks.length === 0 ? 'empty' : 'idle' }),

  setLoadStatus: (loadStatus) => set({ loadStatus }),

  updateBlockStatus: (id, status) =>
    set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, status } : b)) })),

  reorderBlocks: (fromIndex, toIndex) =>
    set((s) => {
      const blocks = [...s.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return { blocks };
    }),

  completeCheckin: (id, actualDuration) =>
    set((s) => ({
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, status: 'done', durationMinutes: actualDuration } : b
      ),
    })),

  skipBlock: (id) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, status: 'skipped' } : b)),
    })),
}));
