import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  // 세션 초기화 (앱 시작 시 1회 호출)
  initialize: () => Promise<void>;
  // 로그아웃
  logout: () => Promise<void>;
};

async function fetchUserName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();
  return data?.name ?? '';
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  userName: '',

  initialize: async () => {
    // 저장된 세션 복원
    const { data: { session } } = await supabase.auth.getSession();
    const userName = session?.user ? await fetchUserName(session.user.id) : '';
    set({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      isLoading: false,
      userName,
    });

    // 이후 세션 변경(토큰 갱신, 로그아웃 등) 실시간 반영
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      const newUserName = newSession?.user ? await fetchUserName(newSession.user.id) : '';
      set({
        user: newSession?.user ?? null,
        session: newSession,
        isAuthenticated: !!newSession,
        userName: newUserName,
      });
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    // onAuthStateChange가 상태를 null로 정리함
  },
}));
