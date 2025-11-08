import { NextRequest, NextResponse } from 'next/server';

/**
 * HanMate AI Talk API Endpoint
 * 
 * POST /api/talk
 * Body: { message: string }
 * Response: { reply: string }
 * 
 * Provides warm, caring Korean AI responses for elderly users.
 */

const SYSTEM_PROMPT = `You are 'HanMate', a warm, gentle Korean AI companion for elderly people living alone in Korea. Always reply in simple, natural Korean, 2–3 sentences. Acknowledge their feelings first, then give a small, doable suggestion. Never say you are an AI or language model.`;

// Default supportive response when message is missing
const DEFAULT_REPLY = '네, 말씀해주세요. 제가 들어드리겠습니다. 어떤 일이 있으신가요?';

// Mock responses for when OpenAI API key is not set
const MOCK_RESPONSES = [
  '네, 말씀 잘 들었어요. 그동안 많이 힘드셨겠어요. 오늘은 따뜻한 차 한 잔 하시면서 조금 쉬어보시는 게 어떨까요?',
  '알겠습니다. 혼자 계시는 게 외로우실 수 있겠어요. 가까운 복지센터에 연락해서 도움을 받아보시는 것도 좋을 것 같아요.',
  '이해했습니다. 건강이 가장 중요하시니, 무리하지 마시고 꾸준히 병원에 다니시는 게 좋겠어요.',
  '네, 듣고 있어요. 걱정이 많으시는 것 같아요. 작은 것부터 하나씩 해결해 나가시면 좋을 것 같아요.',
];

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { reply: DEFAULT_REPLY },
        { status: 200 }
      );
    }

    const { message } = body;

    // If message is missing or empty, return default supportive text
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { reply: DEFAULT_REPLY },
        { status: 200 }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 1000) {
      return NextResponse.json(
        { reply: '죄송합니다. 메시지가 너무 깁니다. 짧게 말씀해주세요.' },
        { status: 200 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, return mocked reply
    if (!apiKey) {
      // Simple mock: use message length to pick a response
      const index = message.length % MOCK_RESPONSES.length;
      const reply = MOCK_RESPONSES[index];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      return NextResponse.json({ reply });
    }

    // Real OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      // If API fails, return a fallback response instead of error
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      
      return NextResponse.json({
        reply: '죄송합니다. 잠시 후 다시 시도해주세요.',
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    // Validate reply exists
    if (!reply) {
      return NextResponse.json({
        reply: '죄송합니다. 다시 말씀해주실 수 있나요?',
      });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API route error:', error);
    
    // Return a supportive error message instead of throwing
    return NextResponse.json(
      { reply: '죄송합니다. 잠시 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 200 }
    );
  }
}
