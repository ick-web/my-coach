import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

type IconProps = {
  active?: boolean;
  size?: number;
};

const color = (active?: boolean) => (active ? Colors.tabActive : Colors.tabInactive);

/** 사각형(집 본체) + 작은 사각형(문) 조합 */
export function HomeIcon({ active, size = 24 }: IconProps) {
  const c = color(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 사각형(보드) + 가로선(리스트) 조합 */
export function ScheduleIcon({ active, size = 24 }: IconProps) {
  const c = color(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4.5} y={3.5} width={15} height={17} rx={2} stroke={c} strokeWidth={1.8} />
      <Path d="M8.5 2.5v3M15.5 2.5v3" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 11h8M8 14.5h8M8 18h5" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/** 원(도넛 차트) + 사각형(바 차트) 조합 */
export function DashboardIcon({ active, size = 24 }: IconProps) {
  const c = color(active);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={8.5} cy={8.5} r={5} stroke={c} strokeWidth={1.8} />
      <Path d="M8.5 3.5v5l4 2" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={15} y={11} width={3} height={9} rx={1} stroke={c} strokeWidth={1.8} />
      <Rect x={19.5} y={7} width={3} height={13} rx={1} stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

/** 원(기어 본체) + 작은 사각형(톱니) 조합 */
export function SettingsIcon({ active, size = 24 }: IconProps) {
  const c = color(active);
  const teeth = [0, 60, 120, 180, 240, 300];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5.5} stroke={c} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={1.8} stroke={c} strokeWidth={1.8} />
      {teeth.map((deg) => (
        <Rect
          key={deg}
          x={11.1}
          y={1.5}
          width={1.8}
          height={3.2}
          rx={0.6}
          fill={c}
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </Svg>
  );
}
