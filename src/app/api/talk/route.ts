import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Talk API Route
 * 
 * Receives user messages and returns AI responses using OpenAI.
 * System prompt is designed to be warm, caring, and appropriate for Korean elders.
 */

const SYSTEM_PROMPT_BASE = (context?: string) => `You are 'HanMate', a warm, gentle Korean AI companion for elderly people living alone in Korea. 
You have been talking with this person and learning about their life, concerns, and preferences over time.

CORE PRINCIPLES:
1. LISTEN first - truly understand what they're saying and feeling
2. COMFORT second - acknowledge emotions before offering advice
3. REMEMBER - reference previous conversations naturally when relevant
4. BE PRESENT - respond as if you're a caring friend who knows them
5. BE NATURAL - use simple, warm Korean with 존댓말 (not too formal)
6. BE BRIEF - 2-3 sentences maximum, elders prefer concise responses

CONVERSATION STYLE:
- If they mention something from before, acknowledge it naturally (e.g., "지난번에 말씀하신 그 일은 어떻게 되셨나요?")
- Show you remember their preferences and concerns
- Use their name or terms they prefer if mentioned
- Match their emotional tone - if they're sad, be gentle; if happy, share their joy
- Ask follow-up questions that show genuine interest

RESPONSE GUIDELINES:
- Never say you're an AI or language model
- Never be overly formal or robotic
- Use natural Korean expressions elders would use
- If they talk about problems, first validate: "그동안 많이 힘드셨겠어요" or "정말 걱정이 되시겠어요"
- Then offer gentle, practical suggestions
- Reference shared memories or topics naturally

${context ? `\nCONTEXT FROM PREVIOUS CONVERSATIONS:\n${context}\n\nUse this context to make your response more personal and relevant. Reference past topics naturally when appropriate.` : ''}`;

const SYSTEM_PROMPT_BASE_EN = (context?: string) => `You are 'HanMate', a warm, gentle AI companion for elderly people living alone. 
You have been talking with this person and learning about their life, concerns, and preferences over time.

CORE PRINCIPLES:
1. LISTEN first - truly understand what they're saying and feeling
2. COMFORT second - acknowledge emotions before offering advice
3. REMEMBER - reference previous conversations naturally when relevant
4. BE PRESENT - respond as if you're a caring friend who knows them
5. BE NATURAL - use simple, warm English
6. BE BRIEF - 2-3 sentences maximum, elders prefer concise responses

CONVERSATION STYLE:
- If they mention something from before, acknowledge it naturally
- Show you remember their preferences and concerns
- Use their name or terms they prefer if mentioned
- Match their emotional tone - if they're sad, be gentle; if happy, share their joy
- Ask follow-up questions that show genuine interest

RESPONSE GUIDELINES:
- Never say you're an AI or language model
- Never be overly formal or robotic
- Use natural expressions elders would use
- If they talk about problems, first validate their feelings
- Then offer gentle, practical suggestions
- Reference shared memories or topics naturally

${context ? `\nCONTEXT FROM PREVIOUS CONVERSATIONS:\n${context}\n\nUse this context to make your response more personal and relevant. Reference past topics naturally when appropriate.` : ''}`;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { message, conversationHistory, context } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Enhanced mock responses with context awareness
      const isKorean = /[가-힣]/.test(message);
      const messageLower = message.toLowerCase();
      
      // Context-aware mock responses
      let reply = '';
      
      if (context) {
        // If we have context, reference it
        if (isKorean) {
          reply = '네, 기억하고 있어요. ' + (messageLower.includes('건강') || messageLower.includes('health') 
            ? '건강 걱정이 많으시는 것 같아요. 꾸준히 병원에 다니시는 게 좋겠어요.'
            : messageLower.includes('외로') || messageLower.includes('lonely')
            ? '혼자 계시는 게 외로우실 수 있겠어요. 가까운 복지센터에 연락해보시는 것도 좋을 것 같아요.'
            : '말씀 잘 들었어요. 따뜻한 차 한 잔 하시면서 조금 쉬어보시는 게 어떨까요?');
        } else {
          reply = 'Yes, I remember. ' + (messageLower.includes('health')
            ? 'I know you\'re concerned about your health. Please keep up with your regular check-ups.'
            : messageLower.includes('lonely')
            ? 'It can be lonely living alone. You might want to contact a nearby community center.'
            : 'I understand. How about taking a break with a warm cup of tea?');
        }
      } else {
        // First-time responses
        const mockResponses = isKorean ? [
          '네, 말씀 잘 들었어요. 그동안 많이 힘드셨겠어요. 오늘은 따뜻한 차 한 잔 하시면서 조금 쉬어보시는 게 어떨까요?',
          '알겠습니다. 혼자 계시는 게 외로우실 수 있겠어요. 가까운 복지센터에 연락해서 도움을 받아보시는 것도 좋을 것 같아요.',
          '이해했습니다. 건강이 가장 중요하시니, 무리하지 마시고 꾸준히 병원에 다니시는 게 좋겠어요.',
        ] : [
          'Yes, I understand. That must have been difficult. How about taking a break with a warm cup of tea today?',
          'I see. It can be lonely living alone. You might want to contact a nearby community center for support.',
          'I understand. Health is most important, so please take care and keep up with your regular check-ups.',
        ];
        
        const index = message.length % 3;
        reply = mockResponses[index];
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      return NextResponse.json({ reply });
    }

    // Build conversation context
    const isKorean = /[가-힣]/.test(message);
    const systemPrompt = isKorean 
      ? SYSTEM_PROMPT_BASE(context || '')
      : SYSTEM_PROMPT_BASE_EN(context || '');

    // Build messages array with conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history if provided (last 10 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role && msg.content && ['user', 'assistant'].includes(msg.role)) {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          });
        }
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Real OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini for faster responses
        messages,
        temperature: 0.8, // Slightly higher for more natural responses
        max_tokens: 200, // Allow slightly longer for context-aware responses
        presence_penalty: 0.3, // Encourage variety while maintaining context
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to get AI response';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // Use default error message
      }
      
      console.error('OpenAI API error:', errorText);
      
      // Return a fallback response instead of error
      const fallbackReply = /[가-힣]/.test(message)
        ? '죄송합니다. 잠시 후 다시 시도해주세요.'
        : 'Sorry, please try again in a moment.';
      
      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    
    if (!reply) {
      const fallbackReply = /[가-힣]/.test(message)
        ? '죄송합니다. 다시 말씀해주실 수 있나요?'
        : 'Sorry, could you please repeat that?';
      return NextResponse.json({ reply: fallbackReply });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

