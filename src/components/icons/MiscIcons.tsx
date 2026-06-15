import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

type IconProps = {
  size?: number;
  color?: string;
};

/** 알림 벨: 본체 + 클래퍼 */
export function BellIcon({ size = 20, color = Colors.subtext }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 10a6 6 0 1 1 12 0c0 3 1 4.5 1.5 5.5H4.5C5 14.5 6 13 6 10z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M10 18.5a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

/** 헤더 설정(톱니바퀴) */
export function GearIcon({ size = 20, color = Colors.subtext }: IconProps) {
  const teeth = [0, 60, 120, 180, 240, 300];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={5.5} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={12} r={1.8} stroke={color} strokeWidth={1.8} />
      {teeth.map((deg) => (
        <Path
          key={deg}
          d="M11.1 1.5h1.8v3.2h-1.8z"
          fill={color}
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </Svg>
  );
}

/** AI 추천 sparkle */
export function SparkleIcon({ size = 20, color = Colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.8 4.6L18.5 9.5 13.8 11.4 12 16l-1.8-4.6L5.5 9.5l4.7-1.9z"
        fill={color}
      />
    </Svg>
  );
}

/** 루틴 추가 plus */
export function PlusIcon({ size = 20, color = Colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** 다시 시도 refresh */
export function RefreshIcon({ size = 20, color = Colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path d="M17 3v4.5h-4.5M7 21v-4.5h4.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** 에러 상태: 노란 원 배경 + 주황 삼각형 느낌표 */
export function WarningIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={32} fill="#FEF3C7" />
      <Path d="M32 18l16 28H16z" stroke="#D97706" strokeWidth={3} strokeLinejoin="round" />
      <Path d="M32 30v6" stroke="#D97706" strokeWidth={3} strokeLinecap="round" />
      <Circle cx={32} cy={41} r={1.4} fill="#D97706" />
    </Svg>
  );
}

/** 빈 상태(SCR-10c): 파란 원 배경 + 플랫 캘린더 아이콘 */
export function CalendarIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={32} fill={Colors.statusBg.active} />
      <Rect x={16} y={20} width={32} height={28} rx={5} fill="#fff" stroke={Colors.primary} strokeWidth={3} />
      <Rect x={16} y={20} width={32} height={9} rx={5} fill={Colors.primary} />
      <Rect x={22} y={12} width={3} height={8} rx={1.5} fill={Colors.primary} />
      <Rect x={39} y={12} width={3} height={8} rx={1.5} fill={Colors.primary} />
      <Rect x={26} y={35} width={12} height={7} rx={2} fill={Colors.statusBg.active} />
    </Svg>
  );
}

/** 목표 달성 예측 등 보조 설명용 정보(i) 아이콘 */
export function InfoIcon({ size = 16, color = Colors.subtext }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.25} stroke={color} strokeWidth={1.8} />
      <Circle cx={12} cy={7.5} r={1} fill={color} />
      <Path d="M12 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
