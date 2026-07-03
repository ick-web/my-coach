import Anthropic from 'npm:@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Mood = 'bad' | 'meh' | 'okay' | 'good' | 'great';

interface FeedbackRequest {
  goal: string;
  rolemodel: string;
  completed_tasks: string[];
  skipped_tasks: string[];
  completion_rate: number;
  mood: Mood;
  wake_time: string;
  sleep_time: string;
}

interface RoutineBlock {
  time: string;
  task: string;
  duration_label: string;
  duration_minutes: number;
}

interface FeedbackResult {
  ai_summary: string;
  next_blocks: RoutineBlock[];
}

const MOOD_LABEL: Record<Mood, string> = {
  bad: '힘들어요',
  meh: '아쉬워요',
  okay: '보통이요',
  good: '좋아요',
  great: '완벽해요',
};

const MOOD_TONE: Record<Mood, string> = {
  bad: '공감과 위로를 우선하고, 내일은 부담을 줄인 제안을 하세요.',
  meh: '공감하면서도 작은 개선점을 부드럽게 제안하세요.',
  okay: '담담하게 인정하고, 내일 시도해볼 작은 개선을 제안하세요.',
  good: '구체적으로 인정하고, 내일은 한 단계 더 도전할 수 있는 제안을 하세요.',
  great: '적극적으로 인정하고, 내일은 더 큰 도전 과제를 제안하세요.',
};

function buildPrompt(req: FeedbackRequest): string {
  return `당신은 라이프스타일 코치입니다. 아래 사용자의 오늘 하루 데이터를 바탕으로 (1) AI 코치 피드백과 (2) 내일 하루 실천 가능한 루틴 5~7개를 JSON으로 생성하세요.

사용자 정보:
- 직업 목표: ${req.goal}
- 롤모델: ${req.rolemodel}
- 오늘 완료한 루틴: ${req.completed_tasks.length ? req.completed_tasks.join(', ') : '없음'}
- 오늘 건너뛴 루틴: ${req.skipped_tasks.length ? req.skipped_tasks.join(', ') : '없음'}
- 오늘 완료율: ${req.completion_rate}%
- 오늘 기분: ${MOOD_LABEL[req.mood]}
- 기상 시간: ${req.wake_time}
- 취침 시간: ${req.sleep_time}

피드백 톤 지침: ${MOOD_TONE[req.mood]}

규칙:
- ai_summary는 2~3문장, 오늘 완료한 구체적인 루틴을 최소 1개 언급
- next_blocks의 시간은 HH:MM 24시간 형식, 기상 시간 이후 취침 시간 이전으로 배치
- next_blocks 각 루틴은 15~90분 단위, 목표 달성에 직결되는 루틴 우선
- 과도한 일정 금지 (Calm Technology 원칙)
- score/평점 필드는 포함하지 마세요 (완료율은 별도로 계산됩니다)

JSON 형식만 반환 (다른 텍스트 없이):
{"ai_summary": "...", "next_blocks": [
  {"time": "07:00", "task": "모닝 러닝", "duration_label": "30분", "duration_minutes": 30}
]}`;
}

async function callClaude(client: Anthropic, prompt: string): Promise<FeedbackResult> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const clean = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(clean);
  return parsed as FeedbackResult;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return jsonResponse({ error: '서버 설정 오류', detail: 'ANTHROPIC_API_KEY not configured' }, 500);
    }

    const body: FeedbackRequest = await req.json();
    const { goal, rolemodel, completed_tasks, skipped_tasks, completion_rate, mood, wake_time, sleep_time } = body;

    if (!goal || !rolemodel || completion_rate == null || !mood || !wake_time || !sleep_time) {
      return jsonResponse(
        {
          error: '필수 파라미터가 누락되었습니다.',
          detail: '필수 필드: goal, rolemodel, completion_rate, mood, wake_time, sleep_time',
        },
        400
      );
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const prompt = buildPrompt({
      goal,
      rolemodel,
      completed_tasks: completed_tasks ?? [],
      skipped_tasks: skipped_tasks ?? [],
      completion_rate,
      mood,
      wake_time,
      sleep_time,
    });

    let result: FeedbackResult;
    try {
      result = await callClaude(client, prompt);
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
      // JSON 파싱 실패 시 재시도 1회
      result = await callClaude(client, prompt);
    }

    return jsonResponse({ ai_summary: result.ai_summary, next_blocks: result.next_blocks });
  } catch (e) {
    console.error('generate-feedback 오류', e);
    return jsonResponse({ error: '피드백 생성 실패', detail: String(e) }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
