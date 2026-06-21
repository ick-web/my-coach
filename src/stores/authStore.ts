import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // 세션 초기화 (앱 시작 시 1회 호출)
  initialize: () => Promise<void>;
  // 로그아웃
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    // 저장된 세션 복원
    const { data: { session } } = await supabase.auth.getSession();
    set({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      isLoading: false,
    });

    // 이후 세션 변경(토큰 갱신, 로그아웃 등) 실시간 반영
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({
        user: newSession?.user ?? null,
        session: newSession,
        isAuthenticated: !!newSession,
      });
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    // onAuthStateChange가 상태를 null로 정리함
  },
}));
