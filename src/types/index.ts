import type { RoutineStatus } from '@/components/icons/RoutineStatusIcons';

export type { RoutineStatus };

export type RoutineBlock = {
  id: string;
  time: string;
  task: string;
  duration: string;
  durationMinutes: number;
  status: RoutineStatus;
};
