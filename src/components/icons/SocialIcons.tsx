import Svg, { Path } from 'react-native-svg';

type IconProps = {
  size?: number;
};

/** 카카오 말풍선 로고 */
export function KakaoIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C6.5 3 2 6.4 2 10.6c0 2.7 1.8 5.1 4.6 6.5l-1 3.6a.4.4 0 0 0 .6.5l4.2-2.8c.5.05 1.05.08 1.6.08 5.5 0 10-3.4 10-7.6S17.5 3 12 3z"
        fill="#191600"
      />
    </Svg>
  );
}

/** Google 'G' 로고 */
export function GoogleIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.6a4.8 4.8 0 0 1-2.08 3.15v2.6h3.36c1.97-1.8 3.12-4.5 3.12-7.55z"
        fill="#4285F4"
      />
      <Path
        d="M12 22c2.8 0 5.16-.92 6.88-2.5l-3.36-2.6c-.93.63-2.12 1-3.52 1-2.7 0-5-1.83-5.82-4.3H2.7v2.66A10 10 0 0 0 12 22z"
        fill="#34A853"
      />
      <Path
        d="M6.18 13.6a6 6 0 0 1 0-3.2V7.74H2.7a10 10 0 0 0 0 9.02z"
        fill="#FBBC05"
      />
      <Path
        d="M12 6.5c1.52 0 2.88.52 3.96 1.55l2.98-2.98C17.15 3.34 14.8 2.5 12 2.5A10 10 0 0 0 2.7 7.74L6.18 10.4C7 7.93 9.3 6.5 12 6.5z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/** Apple 로고 */
export function AppleIcon({ size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.5 2.5c.1 1.1-.3 2.2-1 3-.7.8-1.8 1.4-2.9 1.3-.1-1.1.4-2.2 1-3 .8-.9 2-1.4 2.9-1.3zM20.7 17.2c-.4.9-.9 1.8-1.6 2.6-1 1.2-2 2.4-3.4 2.4-1.4 0-1.8-.8-3.4-.8-1.6 0-2.1.8-3.4.8-1.4 0-2.4-1.2-3.4-2.4C3.4 17 2.5 13.6 3.7 11c.7-1.5 2-2.5 3.4-2.5 1.4 0 2.2.9 3.4.9 1.1 0 1.8-.9 3.4-.9 1.2 0 2.5.7 3.4 1.8-3 1.6-2.5 5.7.4 6.9z"
        fill="#000"
      />
    </Svg>
  );
}
