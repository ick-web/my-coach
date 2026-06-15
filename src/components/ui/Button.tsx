import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Colors, Radius, Typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'small-primary' | 'small-secondary';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, fullWidth, style }: ButtonProps) {
  const isSmall = variant === 'small-primary' || variant === 'small-secondary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        isSmall ? styles.small : styles.large,
        variantStyles[variant],
        disabled && styles.disabled,
        fullWidth && !isSmall && styles.fullWidth,
        style,
      ]}>
      <Text
        style={[
          Typography.button,
          isSmall && { fontSize: 13 },
          textVariantStyles[variant],
          disabled && styles.disabledText,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    height: 56,
    borderRadius: Radius.buttonPrimary,
    paddingHorizontal: 24,
  },
  small: {
    height: 32,
    minWidth: 92,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: Colors.statusBg.skipped,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabledText: {
    color: Colors.subtext,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.buttonGhost },
  'small-primary': { backgroundColor: Colors.primary },
  'small-secondary': { backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.primary },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: Colors.primary },
  ghost: { color: Colors.text },
  'small-primary': { color: '#fff' },
  'small-secondary': { color: Colors.primary },
});
