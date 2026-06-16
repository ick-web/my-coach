import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
  goal: string;
  rolemodel: string;
  lifestyleTags: string[];
  setGoal: (goal: string) => void;
  setRolemodel: (rolemodel: string) => void;
  setLifestyleTags: (tags: string[]) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      goal: '',
      rolemodel: '',
      lifestyleTags: [],
      setGoal: (goal) => set({ goal }),
      setRolemodel: (rolemodel) => set({ rolemodel }),
      setLifestyleTags: (lifestyleTags) => set({ lifestyleTags }),
      reset: () => set({ goal: '', rolemodel: '', lifestyleTags: [] }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
