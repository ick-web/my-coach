import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const MOODS = [
  { key: 'bad', emoji: '😞', label: '별로예요' },
  { key: 'meh', emoji: '🙁', label: '그랬어요' },
  { key: 'okay', emoji: '😐', label: '보통이에요' },
  { key: 'good', emoji: '🙂', label: '좋았어요' },
  { key: 'great', emoji: '😄', label: '최고예요' },
] as const;

export default function ReflectionModal() {
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState('');

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={Typography.sectionTitle}>오늘 하루는 어땠나요?</Text>
        <Text style={Typography.subtext}>2026년 6월 13일 (토)</Text>

        {/* UX-009: 이모지 감정 평가에 텍스트 레이블 + 선택 상태 배경 */}
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => setMood(m.key)}
              style={[styles.moodItem, mood === m.key && styles.moodItemSelected]}>
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={[Typography.subtext, mood === m.key && styles.moodLabelSelected]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.note}
          placeholder="오늘 하루에 대한 생각을 자유롭게 적어보세요"
          placeholderTextColor={Colors.subtext}
          multiline
          value={note}
          onChangeText={setNote}
        />

        <Button label="기록 완료" fullWidth disabled={!mood} onPress={() => router.back()} />
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
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 6,
    borderRadius: Radius.cardSm,
    flex: 1,
  },
  moodItemSelected: {
    backgroundColor: Colors.statusBg.active,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  note: {
    minHeight: 88,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing.base,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
  },
});
