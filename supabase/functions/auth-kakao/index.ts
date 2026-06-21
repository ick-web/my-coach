// 카카오 OAuth 인가 코드 → Supabase 세션 발급
//
// 카카오는 Supabase Auth의 기본 제공 OAuth provider가 아니므로,
// 1) 클라이언트가 받은 인가 코드를 카카오 토큰으로 교환하고
// 2) 카카오 사용자 정보를 조회한 뒤
// 3) admin.generateLink(magiclink)로 Supabase 유저를 생성/조회하고
// 4) verifyOtp로 해당 매직링크 토큰을 access_token/refresh_token으로 교환한다.
//
// 인증 이메일은 항상 카카오 고유 id 기반 합성 이메일(`kakao_<id>@kakao.mycoach.internal`)을
// 사용한다. 이메일 제공 동의 여부와 무관하게 안정적으로 사용자를 식별할 수 있고,
// 다른 provider 계정과 실제 이메일이 겹쳐 계정이 의도치 않게 합쳐지는 것을 방지한다.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const KAKAO_REST_API_KEY = Deno.env.get('KAKAO_REST_API_KEY')!;
const KAKAO_CLIENT_SECRET = Deno.env.get('KAKAO_CLIENT_SECRET'); // 카카오 앱에서 활성화한 경우만 필요
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KakaoTokenResponse {
  access_token: string;
}

interface KakaoUserResponse {
  id: number;
  properties?: { nickname?: string };
  kakao_account?: { email?: string; profile?: { nickname?: string } };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();
    if (!code || !redirectUri) {
      return jsonResponse({ error: 'code와 redirectUri가 필요합니다.' }, 400);
    }

    // 1. 인가 코드 → 카카오 액세스 토큰 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: redirectUri,
      code,
    });
    if (KAKAO_CLIENT_SECRET) tokenParams.set('client_secret', KAKAO_CLIENT_SECRET);

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });
    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      console.error('카카오 토큰 교환 실패', tokenRes.status, detail);
      return jsonResponse({ error: '카카오 토큰 교환 실패', detail }, 401);
    }
    const kakaoToken: KakaoTokenResponse = await tokenRes.json();

    // 2. 카카오 사용자 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoToken.access_token}` },
    });
    if (!userRes.ok) {
      const detail = await userRes.text();
      console.error('카카오 사용자 정보 조회 실패', userRes.status, detail);
      return jsonResponse({ error: '카카오 사용자 정보 조회 실패', detail }, 401);
    }
    const kakaoUser: KakaoUserResponse = await userRes.json();

    const nickname =
      kakaoUser.kakao_account?.profile?.nickname ?? kakaoUser.properties?.nickname ?? '카카오 사용자';
    const syntheticEmail = `kakao_${kakaoUser.id}@kakao.mycoach.internal`;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. 신규 유저면 생성, 기존 유저면 조회만 — 매직링크 토큰 발급
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
      options: {
        data: {
          name: nickname,
          provider: 'kakao',
          kakao_id: kakaoUser.id,
          kakao_email: kakaoUser.kakao_account?.email ?? null,
        },
      },
    });
    if (linkError || !linkData) {
      console.error('사용자 생성/조회 실패', linkError);
      return jsonResponse({ error: '사용자 생성/조회 실패', detail: linkError?.message }, 500);
    }

    // 4. 매직링크 토큰 → 세션(access_token/refresh_token) 교환
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: verifyData, error: verifyError } = await anon.auth.verifyOtp({
      type: 'email',
      token_hash: linkData.properties.hashed_token,
    });
    if (verifyError || !verifyData.session) {
      console.error('세션 발급 실패', verifyError);
      return jsonResponse({ error: '세션 발급 실패', detail: verifyError?.message }, 500);
    }

    return jsonResponse({
      access_token: verifyData.session.access_token,
      refresh_token: verifyData.session.refresh_token,
    });
  } catch (e) {
    console.error('알 수 없는 오류', e);
    return jsonResponse({ error: '알 수 없는 오류', detail: String(e) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
