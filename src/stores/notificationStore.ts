import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type NotificationState = {
  allNotifications: boolean;
  morningRoutine: boolean;
  checkinReminder: boolean;
  eveningReflection: boolean;
  streakWarning: boolean;
  bannerSound: boolean;
  bannerVibration: boolean;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
  setAllNotifications: (v: boolean) => void;
  setMorningRoutine: (v: boolean) => void;
  setCheckinReminder: (v: boolean) => void;
  setEveningReflection: (v: boolean) => void;
  setStreakWarning: (v: boolean) => void;
  setBannerSound: (v: boolean) => void;
  setBannerVibration: (v: boolean) => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      allNotifications: true,
      morningRoutine: true,
      checkinReminder: true,
      eveningReflection: true,
      streakWarning: false,
      bannerSound: true,
      bannerVibration: true,
      doNotDisturbStart: '23:00',
      doNotDisturbEnd: '06:00',
      setAllNotifications: (allNotifications) => set({ allNotifications }),
      setMorningRoutine: (morningRoutine) => set({ morningRoutine }),
      setCheckinReminder: (checkinReminder) => set({ checkinReminder }),
      setEveningReflection: (eveningReflection) => set({ eveningReflection }),
      setStreakWarning: (streakWarning) => set({ streakWarning }),
      setBannerSound: (bannerSound) => set({ bannerSound }),
      setBannerVibration: (bannerVibration) => set({ bannerVibration }),
    }),
    {
      name: 'notification-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
