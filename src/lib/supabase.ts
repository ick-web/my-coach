import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// SecureStore는 2KB 한도가 있어 토큰만 저장, 나머지는 AsyncStorage 사용
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// 웹 SSR(Node)에는 window/localStorage가 없어 AsyncStorage·SecureStore 모두 호출 시 크래시 → no-op으로 우회
const NoopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const storage =
  Platform.OS !== 'web'
    ? ExpoSecureStoreAdapter
    : typeof window === 'undefined'
      ? NoopStorage
      : AsyncStorage;

// Node(SSR) 환경엔 네이티브 WebSocket이 없어 Realtime 클라이언트가 경고를 띄움 → ws로 보완
// 정적 import 대신 동적 require로 Metro 번들링 시 stream 모듈 의존성 제거
const realtime =
  typeof WebSocket === 'undefined'
    ? { transport: require('ws') as never }
    : undefined;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  realtime,
});
