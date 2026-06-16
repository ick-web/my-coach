import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActiveIcon } from '@/components/icons/RoutineStatusIcons';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useScheduleStore } from '@/stores/scheduleStore';

export default function CheckinModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const block = useScheduleStore((s) => s.blocks.find((b) => b.id === id));
  const { completeCheckin, skipBlock, streakDays } = useScheduleStore();

  const [duration, setDuration] = useState(block?.durationMinutes ?? 30);
  const [note, setNote] = useState('');

  const close = () => router.back();

  const handleComplete = () => {
    if (id) completeCheckin(id, duration);
    close();
  };

  const handleSkip = () => {
    if (id) skipBlock(id);
    close();
  };

  if (!block) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={Typography.subtext}>루틴을 찾을 수 없어요.</Text>
          <Button label="닫기" fullWidth onPress={close} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <ActiveIcon size={32} />
          <View>
            <Text style={Typography.sectionTitle}>{block.task}</Text>
            <Text style={Typography.subtext}>{block.time} · {block.duration}</Text>
          </View>
        </View>

        <Text style={[Typography.body, styles.question]}>이 루틴을 완료하셨나요?</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>실제 소요 시간</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepperButton}
              onPress={() => setDuration((d) => Math.max(0, d - 5))}>
              <Text style={styles.stepperButtonText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{duration}분</Text>
            <Pressable style={styles.stepperButton} onPress={() => setDuration((d) => d + 5)}>
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>메모 (선택)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="오늘 루틴은 어땠나요?"
            placeholderTextColor={Colors.subtext}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        <View style={styles.actions}>
          <Button label="완료" fullWidth onPress={handleComplete} />
          <Button label="오늘만 건너뛰기" variant="ghost" fullWidth onPress={handleSkip} />
          <Text style={styles.warning}>건너뛰면 스트릭({streakDays}일)이 초기화될 수 있어요</Text>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  question: {
    color: Colors.text,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
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
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    padding: Spacing.sm,
    minHeight: 64,
    textAlignVertical: 'top',
    ...Typography.body,
    color: Colors.text,
  },
  actions: {
    gap: Spacing.md,
  },
  warning: {
    ...Typography.subtext,
    color: Colors.orange,
    textAlign: 'center',
  },
});
