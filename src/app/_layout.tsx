import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

function AuthGuard() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // 웹 OAuth 리다이렉트 후 로그인 화면에 남아 있는 경우 처리
      supabase.from('goals').select('id').eq('is_active', true).limit(1).then(({ data: goals }) => {
        if (goals && goals.length > 0) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/step1');
        }
      });
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(modals)/checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(modals)/reflection" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
