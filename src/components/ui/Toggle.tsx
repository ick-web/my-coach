import { Pressable, StyleSheet } from 'react-native';

import { Colors, Radius, Sizes } from '@/constants/theme';

type ToggleProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
};

export function Toggle({ value, onValueChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
      <Pressable
        style={[styles.knob, value ? styles.knobOn : styles.knobOff, styles.knobPointerEvents]}
      />
    </Pressable>
  );
}

const KNOB_SIZE = Sizes.toggle.height - 4;

const styles = StyleSheet.create({
  track: {
    width: Sizes.toggle.width,
    height: Sizes.toggle.height,
    borderRadius: Radius.toggle,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: Colors.primary,
    alignItems: 'flex-end',
  },
  trackOff: {
    backgroundColor: Colors.border,
    alignItems: 'flex-start',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#fff',
  },
  knobOn: {},
  knobOff: {},
  knobPointerEvents: {
    pointerEvents: 'none',
  },
});
