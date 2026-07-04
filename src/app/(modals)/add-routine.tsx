import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useScheduleStore } from '@/stores/scheduleStore';

const MINUTE_STEPS = [0, 10, 20, 30, 40, 50];

export default function AddRoutineModal() {
  const addBlock = useScheduleStore((s) => s.addBlock);

  const [task, setTask] = useState('');
  const [hour, setHour] = useState(9);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [duration, setDuration] = useState(30);

  const close = () => router.back();

  const handleSubmit = async () => {
    const time = `${String(hour).padStart(2, '0')}:${String(MINUTE_STEPS[minuteIndex]).padStart(2, '0')}`;
    await addBlock(time, task.trim(), duration);
    close();
  };

  const canSubmit = task.trim().length > 0;

  return (
    <Pressable style={styles.overlay} onPress={close}>
      <Pressable style={styles.sheet} onPress={() => {}}>
        <View style={styles.handle} />

        <Text style={Typography.sectionTitle}>직접 루틴 추가하기</Text>

        <Input
          label="할 일"
          placeholder="예: 포트폴리오 작업"
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>시작 시간</Text>
          <View style={styles.timeRow}>
            <Stepper
              value={`${String(hour).padStart(2, '0')}시`}
              onDecrease={() => setHour((h) => (h + 23) % 24)}
              onIncrease={() => setHour((h) => (h + 1) % 24)}
            />
            <Stepper
              value={`${String(MINUTE_STEPS[minuteIndex]).padStart(2, '0')}분`}
              onDecrease={() => setMinuteIndex((i) => (i + MINUTE_STEPS.length - 1) % MINUTE_STEPS.length)}
              onIncrease={() => setMinuteIndex((i) => (i + 1) % MINUTE_STEPS.length)}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>소요 시간</Text>
          <Stepper
            value={`${duration}분`}
            onDecrease={() => setDuration((d) => Math.max(5, d - 5))}
            onIncrease={() => setDuration((d) => d + 5)}
            fullWidth
          />
        </View>

        <View style={styles.actions}>
          <Button label="추가하기" fullWidth disabled={!canSubmit} onPress={handleSubmit} />
          <Button label="취소" variant="ghost" fullWidth onPress={close} />
        </View>
      </Pressable>
    </Pressable>
  );
}

function Stepper({
  value,
  onDecrease,
  onIncrease,
  fullWidth,
}: {
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.stepper, fullWidth && styles.stepperFullWidth]}>
      <Pressable style={styles.stepperButton} onPress={onDecrease}>
        <Text style={styles.stepperButtonText}>−</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{value}</Text>
      <Pressable style={styles.stepperButton} onPress={onIncrease}>
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: Radius.cardLg,
    borderTopRightRadius: Radius.cardLg,
    padding: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  stepperFullWidth: {
    width: '100%',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.statusBg.skipped,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    ...Typography.sectionTitle,
    color: Colors.navy,
  },
  stepperValue: {
    ...Typography.statValue,
    color: Colors.text,
  },
  actions: {
    gap: Spacing.md,
  },
});
