import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useNotificationStore } from '@/stores/notificationStore';

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ label, description, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description && <Text style={Typography.subtext}>{description}</Text>}
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );
}

export default function SettingsScreen() {
  const {
    allNotifications, setAllNotifications,
    morningRoutine, setMorningRoutine,
    checkinReminder, setCheckinReminder,
    eveningReflection, setEveningReflection,
    streakWarning, setStreakWarning,
    bannerSound, setBannerSound,
    bannerVibration, setBannerVibration,
    doNotDisturbStart, doNotDisturbEnd,
  } = useNotificationStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={Typography.sectionTitle}>알림 설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <ToggleRow
            label="전체 알림"
            description="모든 알림을 한 번에 켜거나 꺼요"
            value={allNotifications}
            onValueChange={setAllNotifications}
          />
        </View>

        <View style={[styles.card, !allNotifications && styles.cardDisabled]}>
          <Text style={styles.cardTitle}>방해 금지 시간</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>취침</Text>
            <Text style={Typography.subtext}>{formatTime(doNotDisturbStart)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>기상</Text>
            <Text style={Typography.subtext}>{formatTime(doNotDisturbEnd)}</Text>
          </View>
        </View>

        {Platform.OS === 'android' && (
          <View style={[styles.card, !allNotifications && styles.cardDisabled]}>
            <Text style={styles.cardTitle}>배너 알림 종류</Text>
            <ToggleRow label="알림 소리" value={bannerSound} onValueChange={setBannerSound} />
            <ToggleRow label="진동" value={bannerVibration} onValueChange={setBannerVibration} />
          </View>
        )}

        <View style={[styles.card, !allNotifications && styles.cardDisabled]}>
          <ToggleRow
            label="아침 루틴 알림"
            description="하루를 시작하는 알림을 받아요"
            value={morningRoutine}
            onValueChange={setMorningRoutine}
          />
          <ToggleRow
            label="체크인 리마인더"
            description="진행 중인 루틴 시간에 알려드려요"
            value={checkinReminder}
            onValueChange={setCheckinReminder}
          />
          <ToggleRow
            label="저녁 회고 알림"
            description="주 3회, 하루를 마무리하며 회고해요"
            value={eveningReflection}
            onValueChange={setEveningReflection}
          />
          <ToggleRow
            label="스트릭 경고"
            description="연속 기록이 끊기기 전에 알려드려요"
            value={streakWarning}
            onValueChange={setStreakWarning}
          />
        </View>
      </ScrollView>

      {/* UX-003: 저장 버튼이 탭바와 겹치지 않도록 하단 고정 영역에 배치 */}
      <View style={styles.footer}>
        <Button label="저장" fullWidth onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

function formatTime(time: string): string {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}:${minute}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: Spacing.screenMargin,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.section,
    gap: Spacing.base,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardLg,
    padding: Spacing.base,
    gap: Spacing.base,
  },
  cardTitle: {
    ...Typography.body,
    fontWeight: '700',
  },
  cardDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    gap: 2,
    paddingRight: Spacing.base,
  },
  rowLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.screenMargin,
    paddingBottom: Spacing.base,
  },
});
