import type { ReactElement } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Colors } from '@/constants/theme';

export type RoutineStatus = 'done' | 'active' | 'todo' | 'delayed' | 'skipped';

type IconProps = {
  size?: number;
};

/** 완료: 초록 원 + 체크 */
export function DoneIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={Colors.statusIcon.done} />
      <Path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** 진행중: 파란 원 + 흰색 도트 (재생 표시 대체) */
export function ActiveIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={Colors.primary} />
      <Circle cx={12} cy={12} r={3.5} fill={Colors.statusIcon.active} />
    </Svg>
  );
}

/** 예정: 회색 원 외곽선 */
export function TodoIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.5} stroke={Colors.statusIcon.todo} strokeWidth={1.8} />
    </Svg>
  );
}

/** 지연: 주황 원 + 느낌표 */
export function DelayedIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={Colors.statusIcon.delayed} />
      <Line x1={12} y1={6.5} x2={12} y2={13} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={12} cy={16.5} r={1.1} fill="#fff" />
    </Svg>
  );
}

/** 건너뜀: 회색 원 + 마이너스 */
export function SkippedIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={Colors.statusIcon.skipped} />
      <Line x1={8} y1={12} x2={16} y2={12} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export const RoutineStatusIcon: Record<RoutineStatus, (props: IconProps) => ReactElement> = {
  done: DoneIcon,
  active: ActiveIcon,
  todo: TodoIcon,
  delayed: DelayedIcon,
  skipped: SkippedIcon,
};
