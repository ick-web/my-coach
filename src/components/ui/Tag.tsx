import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Sizes, Typography } from '@/constants/theme';

type TagProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'duration';
};

export function Tag({ label, selected, onPress, variant = 'default' }: TagProps) {
  const isDuration = variant === 'duration';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        isDuration ? styles.duration : styles.default,
        selected && styles.selected,
      ]}>
      <Text style={[styles.label, selected && styles.selectedLabel, isDuration && styles.durationLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  default: {
    minWidth: Sizes.tagDefault.width,
    height: Sizes.tagDefault.height,
    paddingHorizontal: 12,
  },
  duration: {
    minWidth: Sizes.tagDuration.width,
    height: Sizes.tagDuration.height,
    paddingHorizontal: 8,
    borderRadius: 11,
  },
  selected: {
    backgroundColor: Colors.statusBg.active,
    borderColor: Colors.primary,
  },
  label: {
    ...Typography.body,
    color: Colors.text,
  },
  durationLabel: {
    ...Typography.subtext,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
