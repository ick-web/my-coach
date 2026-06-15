import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoutineStatus, RoutineStatusIcon } from '@/components/icons/RoutineStatusIcons';
import { Colors, Radius, Sizes, Spacing, Typography } from '@/constants/theme';

type RoutineItemProps = {
  time: string;
  task: string;
  duration: string;
  status: RoutineStatus;
  onPress?: () => void;
};

const statusBg: Record<RoutineStatus, string> = {
  done: Colors.statusBg.done,
  active: Colors.statusBg.active,
  todo: Colors.statusBg.todo,
  delayed: Colors.statusBg.delayed,
  skipped: Colors.statusBg.skipped,
};

const statusLabel: Record<RoutineStatus, string> = {
  done: '완료',
  active: '진행중',
  todo: '예정',
  delayed: '지연',
  skipped: '건너뜀',
};

export function RoutineItem({ time, task, duration, status, onPress }: RoutineItemProps) {
  const StatusIcon = RoutineStatusIcon[status];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, { backgroundColor: statusBg[status] }, status === 'todo' && styles.todoBorder]}>
      <StatusIcon size={24} />
      <View style={styles.middle}>
        <Text style={styles.task}>{task}</Text>
        <Text style={Typography.subtext}>
          {time} · {duration}
        </Text>
      </View>
      <Text style={[styles.statusLabel, status === 'delayed' && { color: Colors.statusIcon.delayed }]}>
        {statusLabel[status]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: Sizes.routineItem.width,
    minHeight: Sizes.routineItem.minHeight,
    borderRadius: Radius.cardSm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  todoBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  task: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  statusLabel: {
    ...Typography.subtext,
    color: Colors.subtext,
  },
});
