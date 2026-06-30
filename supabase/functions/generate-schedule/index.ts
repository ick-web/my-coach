import Anthropic from 'npm:@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRequest {
  goal: string;
  rolemodel: string;
  lifestyle_tags: string[];
  wake_time: string;
  sleep_time: string;
}

interface RoutineBlock {
  time: string;
  task: string;
  duration_label: string;
  duration_minutes: number;
}

function buildPrompt(req: ScheduleRequest): string {
  return `당신은 라이프스타일 코치입니다. 아래 사용자 정보를 바탕으로 오늘 하루 실천 가능한 루틴 5~7개를 JSON으로 생성하세요.

사용자 정보:
- 직업 목표: ${req.goal}
- 롤모델: ${req.rolemodel}
- 라이프스타일 키워드: ${req.lifestyle_tags.join(', ')}
- 기상 시간: ${req.wake_time}
- 취침 시간: ${req.sleep_time}

규칙:
- 시간은 HH:MM 24시간 형식
- 기상 시간 이후, 취침 시간 이전으로 배치
- 각 루틴은 15~90분 단위
- 목표 달성에 직결되는 루틴 우선
- 과도한 일정 금지 (Calm Technology 원칙)

JSON 형식만 반환 (다른 텍스트 없이):
{"blocks": [
  {"time": "07:00", "task": "모닝 러닝", "duration_label": "30분", "duration_minutes": 30}
]}`;
}

async function callClaude(client: Anthropic, prompt: string): Promise<RoutineBlock[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const parsed = JSON.parse(text.trim());
  return parsed.blocks as RoutineBlock[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ScheduleRequest = await req.json();
    const { goal, rolemodel, lifestyle_tags, wake_time, sleep_time } = body;

    if (!goal || !rolemodel || !lifestyle_tags?.length || !wake_time || !sleep_time) {
      return jsonResponse({ error: '필수 파라미터가 누락되었습니다.' }, 400);
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const prompt = buildPrompt({ goal, rolemodel, lifestyle_tags, wake_time, sleep_time });

    let blocks: RoutineBlock[];
    try {
      blocks = await callClaude(client, prompt);
    } catch {
      // JSON 파싱 실패 시 재시도 1회
      blocks = await callClaude(client, prompt);
    }

    return jsonResponse({ blocks });
  } catch (e) {
    console.error('generate-schedule 오류', e);
    return jsonResponse({ error: '스케줄 생성 실패', detail: String(e) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
