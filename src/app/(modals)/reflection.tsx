import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RefreshIcon } from '@/components/icons/MiscIcons';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useFeedbackStore, type MoodKey } from '@/stores/feedbackStore';

const MOODS: Array<{ key: MoodKey; emoji: string; label: string }> = [
  { key: 'bad', emoji: '😣', label: '힘들어요' },
  { key: 'meh', emoji: '🙁', label: '아쉬워요' },
  { key: 'okay', emoji: '😐', label: '보통이요' },
  { key: 'good', emoji: '🙂', label: '좋아요' },
  { key: 'great', emoji: '😁', label: '완벽해요' },
];

function todayLabel(): string {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export default function ReflectionModal() {
  const userName = useAuthStore((s) => s.userName);
  const {
    status,
    completionRate,
    deltaVsYesterday,
    existingFeedback,
    aiSummary,
    nextPreview,
    selectedMood,
    loadToday,
    submitMood,
  } = useFeedbackStore();

  useEffect(() => {
    loadToday();
  }, []);

  const displayMood = existingFeedback?.mood ?? selectedMood;
  const displaySummary = existingFeedback?.aiSummary ?? aiSummary;
  const displayPreview = existingFeedback?.nextPreview ?? nextPreview;
  const hasResult = status === 'done';
  const isReadOnly = !!existingFeedback;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>오늘 하루 돌아보기 🌙</Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.headerSubtitle}>
          {userName ? `오늘도 정말 잘 하셨어요, ${userName}님!` : '오늘 하루도 고생 많으셨어요!'}
        </Text>
      </SafeAreaView>

      {status === 'loading-today' && (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}

      {status === 'error' && !selectedMood && (
        <View style={styles.centerState}>
          <Text style={Typography.sectionTitle}>불러오지 못했어요</Text>
          <Pressable style={styles.retryRow} onPress={loadToday}>
            <RefreshIcon />
            <Text style={styles.retryText}>다시 시도하기</Text>
          </Pressable>
        </View>
      )}

      {(status === 'ready' || status === 'generating' || status === 'done' || (status === 'error' && !!selectedMood)) && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={Typography.subtext}>{todayLabel()}</Text>

          <View style={styles.card}>
            <Text style={[Typography.subtext, styles.cardLabel]}>오늘의 완료율</Text>
            <Text style={[Typography.statValue, styles.percentValue]}>{completionRate}%</Text>
            {deltaVsYesterday > 0 && (
              <Text style={styles.deltaText}>↑ 어제보다 {deltaVsYesterday}개 더 완료!</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={[Typography.subtext, styles.cardLabel]}>AI 코치 피드백</Text>
            {status === 'error' ? (
              <Pressable style={styles.retryRow} onPress={() => selectedMood && submitMood(selectedMood)}>
                <RefreshIcon />
                <Text style={styles.retryText}>다시 시도하기</Text>
              </Pressable>
            ) : hasResult ? (
              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>{displaySummary}</Text>
              </View>
            ) : (
              <View style={[styles.skeleton, status === 'generating' && styles.skeletonPulsing]} />
            )}
          </View>

          <View style={styles.card}>
            <Text style={[Typography.subtext, styles.cardLabel]}>내일의 루틴 미리 보기</Text>
            {hasResult ? (
              <>
                {displayPreview.slice(0, 3).map((b) => (
                  <Text key={b.id} style={styles.previewRow}>
                    {b.time}  {b.task}
                    {b.duration ? ` (${b.duration})` : ''}
                  </Text>
                ))}
                <Pressable onPress={() => router.push('/schedule')}>
                  <Text style={styles.scheduleLink}>스케줄 확인·수정 →</Text>
                </Pressable>
              </>
            ) : status === 'error' ? (
              <Text style={Typography.subtext}>피드백 생성 실패로 미리보기를 만들지 못했어요.</Text>
            ) : (
              <View style={[styles.skeleton, status === 'generating' && styles.skeletonPulsing]} />
            )}
          </View>

          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <Pressable
                key={m.key}
                disabled={isReadOnly || status === "generating" || hasResult}
                onPress={() => submitMood(m.key)}
                style={[styles.moodItem, displayMood === m.key && styles.moodItemSelected]}>
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[Typography.subtext, displayMood === m.key && styles.moodLabelSelected]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            label={isReadOnly ? '확인' : '오늘도 수고했어요! 🎉'}
            fullWidth
            disabled={!isReadOnly && !hasResult}
            onPress={() => router.back()}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.section,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  headerTitle: {
    ...Typography.sectionTitle,
    color: '#fff',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
  headerSubtitle: {
    ...Typography.body,
    color: '#DBEAFE',
    marginTop: Spacing.xs,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  scrollContent: {
    padding: Spacing.screenMargin,
    gap: Spacing.base,
    paddingBottom: Spacing.section,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  cardLabel: {
    fontWeight: '700',
    color: Colors.text,
  },
  percentValue: {
    color: Colors.navy,
  },
  deltaText: {
    ...Typography.subtext,
    color: '#16A34A',
    fontWeight: '600',
  },
  aiBubble: {
    backgroundColor: Colors.statusBg.active,
    borderRadius: Radius.cardSm,
    padding: Spacing.base,
  },
  aiBubbleText: {
    ...Typography.body,
    color: Colors.primary,
    lineHeight: 20,
  },
  skeleton: {
    height: 48,
    borderRadius: Radius.cardSm,
    backgroundColor: Colors.statusBg.skipped,
  },
  skeletonPulsing: {
    opacity: 0.6,
  },
  previewRow: {
    ...Typography.body,
    color: Colors.text,
  },
  scheduleLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.xs,
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
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  retryText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
