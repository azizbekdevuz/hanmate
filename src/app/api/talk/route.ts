import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Talk API Route
 * 
 * Receives user messages and returns AI responses using OpenAI.
 * System prompt is designed to be warm, caring, and appropriate for Korean elders.
 */

const SYSTEM_PROMPT = `You are 'HanMate', a warm, gentle Korean AI companion for elderly people living alone in Korea. 
Your job is to LISTEN first and COMFORT second. 
Always reply in natural, simple Korean with 존댓말 but not too formal. 
Keep replies short: 2-3 sentences. 
If the user talks about loneliness, money, health, or family, first acknowledge the feeling (e.g. '그동안 많이 힘드셨겠어요.'), then offer a small, doable suggestion (e.g. '따뜻한 차 한 잔 하셔도 좋을 것 같아요.'). 
Do NOT mention that you are an AI or language model. 
Sound human, caring, and present.`;

const SYSTEM_PROMPT_EN = `You are 'HanMate', a warm, gentle AI companion for elderly people living alone. 
Your job is to LISTEN first and COMFORT second. 
Always reply in natural, simple English. 
Keep replies short: 2-3 sentences. 
If the user talks about loneliness, money, health, or family, first acknowledge the feeling, then offer a small, doable suggestion. 
Do NOT mention that you are an AI or language model. 
Sound human, caring, and present.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Mock response for demo/hackathon when API key is not set
      const mockResponses = [
        '네, 말씀 잘 들었어요. 그동안 많이 힘드셨겠어요. 오늘은 따뜻한 차 한 잔 하시면서 조금 쉬어보시는 게 어떨까요?',
        '알겠습니다. 혼자 계시는 게 외로우실 수 있겠어요. 가까운 복지센터에 연락해서 도움을 받아보시는 것도 좋을 것 같아요.',
        '이해했습니다. 건강이 가장 중요하시니, 무리하지 마시고 꾸준히 병원에 다니시는 게 좋겠어요.',
      ];
      
      const mockResponsesEn = [
        'Yes, I understand. That must have been difficult. How about taking a break with a warm cup of tea today?',
        'I see. It can be lonely living alone. You might want to contact a nearby community center for support.',
        'I understand. Health is most important, so please take care and keep up with your regular check-ups.',
      ];

      // Simple mock: use message length to pick a response
      const index = message.length % 3;
      const isKorean = /[가-힣]/.test(message);
      const reply = isKorean ? mockResponses[index] : mockResponsesEn[index];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

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
        model: 'gpt-4o-mini', // Using mini for faster responses
        messages: [
          {
            role: 'system',
            content: /[가-힣]/.test(message) ? SYSTEM_PROMPT : SYSTEM_PROMPT_EN,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 150, // Keep responses short
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '죄송합니다. 다시 말씀해주실 수 있나요?';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

