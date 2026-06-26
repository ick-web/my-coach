import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleIcon, GoogleIcon, KakaoIcon } from '@/components/icons/SocialIcons';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const KAKAO_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
  tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Google OAuth ─────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        // 웹: Supabase가 Google 리다이렉트를 처리, detectSessionInUrl이 세션 자동 복원
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (error) throw error;
        return; // 브라우저가 Google로 리다이렉트됨
      }

      // 네이티브: WebBrowser로 직접 OAuth URL 열기
      const redirectUri = Linking.createURL('/');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error('OAuth URL 없음');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'success') {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (exchangeError) throw exchangeError;
        await navigateAfterAuth();
      }
    } catch {
      setError('Google 로그인 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Kakao OAuth ──────────────────────────────────────────────────
  // 카카오는 Supabase 기본 제공 provider가 아니므로
  // Supabase Edge Function 프록시를 통해 커스텀 JWT로 처리합니다.
  const kakaoRedirectUri = AuthSession.makeRedirectUri({ scheme: 'mobile' });
  const [kakaoRequest, kakaoResponse, kakaoPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '',
      redirectUri: kakaoRedirectUri,
      scopes: ['profile_nickname', 'account_email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
    },
    KAKAO_DISCOVERY
  );

  useEffect(() => {
    if (kakaoResponse?.type !== 'success') return;
    const code = kakaoResponse.params.code;
    if (!code) return;
    handleKakaoCode(code);
  }, [kakaoResponse]);

  const handleKakaoCode = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      // Edge Function: auth/kakao → Kakao 토큰 교환 후 Supabase 커스텀 JWT 반환
      const { data, error: fnError } = await supabase.functions.invoke('auth-kakao', {
        body: { code, redirectUri: kakaoRedirectUri },
      });
      if (fnError) throw fnError;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) throw sessionError;

      await navigateAfterAuth();
    } catch (e) {
      console.log('[Kakao] 에러:', e);
      setError('카카오 로그인 중 오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Apple Sign In ────────────────────────────────────────────────
  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identity token');

      const { error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (authError) throw authError;

      await navigateAfterAuth();
    } catch (e: unknown) {
      console.log('[Apple] 에러:', e);
      const code = (e as { code?: string }).code;
      if (code !== 'ERR_CANCELED') {
        setError('Apple 로그인 중 오류가 발생했어요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── 이메일 로그인 ─────────────────────────────────────────────────
  const handleEmailLogin = () => {
    // TODO: 이메일/비밀번호 화면으로 이동 (v1.1)
    navigateAfterAuth();
  };

  // ─── 공통 ─────────────────────────────────────────────────────────
  const navigateAfterAuth = async () => {
    // Goal이 있으면 홈으로, 없으면 온보딩으로
    const { data: goals } = await supabase
      .from('goals')
      .select('id')
      .eq('is_active', true)
      .limit(1);
    if (goals && goals.length > 0) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/step1');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>MyCoach</Text>
        <Text style={Typography.subtext}>막연한 목표를, 오늘의 루틴으로</Text>
      </View>

      <View style={styles.actions}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* 카카오 */}
        <Pressable
          style={[styles.socialButton, { backgroundColor: '#FEE500' }]}
          onPress={() => { setError(null); kakaoPromptAsync(); }}
          disabled={loading || !kakaoRequest}>
          <View style={styles.socialIcon}><KakaoIcon size={20} /></View>
          <Text style={[styles.socialLabel, { color: '#191600' }]}>카카오로 계속하기</Text>
        </Pressable>

        {/* Google */}
        <Pressable
          style={[styles.socialButton, { backgroundColor: '#fff' }, styles.socialButtonBorder]}
          onPress={handleGoogleSignIn}
          disabled={loading}>
          <View style={styles.socialIcon}><GoogleIcon size={20} /></View>
          <Text style={[styles.socialLabel, { color: Colors.text }]}>Google로 계속하기</Text>
        </Pressable>

        {/* Apple — iOS 전용 */}
        {Platform.OS === 'ios' && (
          <Pressable
            style={[styles.socialButton, { backgroundColor: '#000' }]}
            onPress={handleAppleSignIn}
            disabled={loading}>
            <View style={styles.socialIcon}><AppleIcon size={20} /></View>
            <Text style={[styles.socialLabel, { color: '#fff' }]}>Apple로 계속하기</Text>
          </Pressable>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={Typography.subtext}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="이메일로 계속하기"
          variant="secondary"
          fullWidth
          onPress={handleEmailLogin}
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator color={Colors.primary} style={styles.spinner} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.screenMargin,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.navy,
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.section,
  },
  socialButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  socialButtonBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    ...Typography.button,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  errorText: {
    ...Typography.subtext,
    color: Colors.orange,
    textAlign: 'center',
  },
  spinner: {
    marginTop: Spacing.xs,
  },
});
